import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';

import * as topojson from 'topojson';
import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  geoData: any;
  private centerGroningen: [number, number] = [6.5, 53.259];

  mapFeatures!: FeatureCollection;

  svg!: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

  projection = d3.geoMercator().scale(40000).center(this.centerGroningen);

  path = d3.geoPath(this.projection);

  transform: any = null;

  constructor(private httpService: HttpService) {
    this.httpService.get().subscribe({
      next: (data) => (this.geoData = data),
      error: (e) => console.error(e),
      complete: () => this.init(),
    });
  }

  init() {
    this.mapFeatures = topojson.feature(this.geoData, {
      type: 'GeometryCollection',
      geometries: this.geoData.objects.groningen.geometries,
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

    const zoom = d3.zoom().scaleExtent([-10, 8]).on('zoom', this.zoomed) as any;

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
      .attr('transform', (d: any) => {
        var centroid = this.path.centroid(d);
        if (this.transform === null) {
          return `translate(${centroid})`;
        }
        return `translate(${this.transform.apply(centroid)})`;
      })
      .text(function (d: any) {
        return d.properties.postcode4;
      });
  }

  removeLabels() {
    this.svg.selectAll('.label-group').remove();
  }

  togglePostcode(value: boolean) {
    if (value) {
      this.createLabels();
    }
    if (!value) {
      this.removeLabels();
    }
  }

  zoomed = ({ transform }: { transform: any }) => {
    this.transform = transform;
    this.svg
      .selectAll('path')
      .attr('transform', transform)
      .attr('stroke-width', 1 / transform.k);
    this.svg
      .selectAll('.label')
      .attr(
        'transform',
        (d: any) =>
          `translate(${transform.apply(this.path.centroid(d))}) scale(1)`
      );
  };

  addHours(data: Map<number, number>) {
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
      .attr('fill', (d: any) => {
        const postcode = d.properties.postcode4;
        const value = data.get(+postcode);
        if (value !== undefined) {
          return d3.interpolateReds(colorScale(value));
        }
        return 'white';
      });
  }
}
