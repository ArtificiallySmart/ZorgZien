import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';

import * as d3 from 'd3';
import { FeatureCollection, GeoJsonProperties } from 'geojson';
import * as topojson from 'topojson';
import { Objects } from 'topojson-specification';
import { CareNeedList } from '../../shared/interfaces/care-need';

@Injectable({
  providedIn: 'root',
})
export class ChoroplethService {
  geoData!: TopoJSON.Topology<Objects<GeoJsonProperties>>;
  private centerGroningen: [number, number] = [6.5, 53.259];
  mapFeatures!: FeatureCollection;
  svg!: d3.Selection<SVGElement, unknown, HTMLElement, unknown>;
  projection = d3.geoMercator().scale(40000).center(this.centerGroningen);
  path = d3.geoPath(this.projection);
  transform: d3.ZoomTransform | null = null;

  constructor(private httpService: HttpService) {
    this.httpService.get().subscribe({
      next: (data) => (this.geoData = data as TopoJSON.Topology),
      error: (e) => console.error(e),
      complete: () => this.init(),
    });
  }

  init() {
    this.mapFeatures = topojson.feature(this.geoData, {
      type: 'GeometryCollection',
      geometries: (this.geoData.objects['groningen'] as GeoJsonProperties)![
        'geometries'
      ],
    });
    this.svg = d3.select('svg');
    this.draw();
  }

  draw() {
    const svg = this.svg;
    const path = this.path;

    svg
      .append('g')
      .selectAll('path')
      .data(this.mapFeatures.features)
      .join('path')
      .attr('d', path)
      .attr('fill', 'grey')
      .attr('stroke', 'grey');

    const zoom = d3
      .zoom<SVGElement, unknown>()
      .scaleExtent([-10, 8])
      .on('zoom', this.zoomed);

    svg.call(zoom);
  }

  createLabels() {
    this.svg
      .append('g')
      .attr('class', 'label-group')
      .selectAll('.label')
      .data(this.mapFeatures.features)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('transform', (d) => {
        const centroid = this.path.centroid(d);
        if (this.transform === null) {
          return `translate(${centroid})`;
        }
        return `translate(${this.transform.apply(centroid)})`;
      })
      .text(function (d) {
        return d.properties!['postcode4'];
      });
  }

  removeLabels() {
    this.svg.selectAll('path').attr('fill', 'grey').attr('stroke', 'grey');
  }

  togglePostcode(value: boolean) {
    if (value) {
      this.createLabels();
    }
    if (!value) {
      this.removeLabels();
    }
  }

  zoomed = ({ transform }: { transform: d3.ZoomTransform }) => {
    this.transform = transform;
    this.svg
      .selectAll('path')
      .attr('transform', transform.toString())
      .attr('stroke-width', 1 / transform.k);
    this.svg
      .selectAll('.label')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('transform', (d: any) => {
        const centroid = this.path.centroid(d);
        return `translate(${transform.apply(centroid)}) scale(1)`;
      });
  };

  removeHours() {}

  addHours(careList: CareNeedList) {
    const data = careList.careNeed;
    const svg = this.svg;
    const path = this.path;
    const max = d3.max(Array.from(data.values()));
    const min = d3.min(Array.from(data.values()));

    const colorScale = d3.scaleLog().domain([min || 0, max || 0]);

    svg
      .append('g')
      .selectAll('path')
      .data(this.mapFeatures.features)
      .join('path')
      .attr('d', path)
      .attr('fill', (d) => {
        const postcode = d.properties!['postcode4'];
        const value = data.get(+postcode);
        if (value !== undefined) {
          return d3.interpolateReds(colorScale(value));
        }
        return 'white';
      });
  }
}
