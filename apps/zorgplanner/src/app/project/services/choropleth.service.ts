import { Injectable, effect, inject, signal } from '@angular/core';

import * as d3 from 'd3';
import { FeatureCollection, GeoJsonProperties } from 'geojson';
import * as topojson from 'topojson';
import { Objects } from 'topojson-specification';

import { CareDemandList } from '../../shared/interfaces/care-demand';
import {
  CareSupplyEntry,
  CareSupplyList,
} from '../../shared/interfaces/care-supply';
import { DataService } from './data.service';
import { CareDemandService } from './care-demand.service';
import { CareSupplyService } from './care-supply.service';

@Injectable({
  providedIn: 'root',
})
export class ChoroplethService {
  private dataService = inject(DataService);
  private careDemandService = inject(CareDemandService);
  private careSupplyService = inject(CareSupplyService);

  private centerGroningen: [number, number] = [6.5, 53.259];

  mapFeatures!: FeatureCollection;
  svg!: d3.Selection<SVGElement, unknown, HTMLElement, unknown>;
  projection = d3.geoMercator().scale(40000).center(this.centerGroningen);
  path = d3.geoPath(this.projection);
  transform: d3.ZoomTransform | null = null;

  combineDemandSupply = signal<boolean>(false);

  constructor() {
    effect(() => {
      console.log(this.combineDemandSupply());
    });

    effect(() => {
      if (this.careDemandService.loaded()) {
        this.changeDemand(this.careDemandService.selectedCareDemandList());
      }
    });

    effect(() => {
      if (this.careSupplyService.loaded()) {
        this.changeSupply(this.careSupplyService.selectedCareSupplyList());
      }
    });
  }

  init() {
    this.dataService.loadGeoData().subscribe({
      next: (geoData) => this.makeFeatures(geoData),
      error: (err) => console.log(err),
    });
  }

  makeFeatures(geoData2: TopoJSON.Topology<Objects<GeoJsonProperties>>) {
    this.mapFeatures = topojson.feature(geoData2, {
      type: 'GeometryCollection',
      geometries: (geoData2.objects['groningen'] as GeoJsonProperties)![
        'geometries'
      ],
    });
    this.svg = d3.select('svg');
    this.draw();
  }

  draw() {
    const svg = this.svg;
    const path = this.path;
    console.log(this.mapFeatures);
    svg
      .append('g')
      .selectAll('path')
      .data(this.mapFeatures.features)
      .join('path')
      .attr('d', path)
      .attr('fill', 'white')
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

  changeDemand(careList: CareDemandList | null) {
    if (careList === null) {
      this.svg.selectAll('.care-demand').remove();
      return;
    }
    const data = careList.careDemand;
    const svg = this.svg;
    const path = this.path;
    const max = d3.max(Array.from(data.values()));
    const min = d3.min(Array.from(data.values()));
    const colorScale = d3.scaleLog().domain([min || 1, max || 1]);

    svg
      .append('g')
      .attr('class', 'care-demand')
      .selectAll('path')
      .data(this.mapFeatures.features)
      .join('path')
      .attr('d', path)
      .attr('fill', (d) => {
        const postcode = d.properties!['postcode4'];
        const value = data.get(+postcode);
        if (value !== undefined) {
          console.log(value, colorScale(value));
          //return d3.interpolateReds(colorScale(value));
          return `hsla(242, 100%, 50%, ${colorScale(value || 0)})`;
        }
        return 'grey';
      });
  }

  changeSupply(careList: CareSupplyList | null) {
    if (careList === null) {
      this.svg.selectAll('.care-supply').remove();
      return;
    }
    const data = careList.careSupply;
    const svg = this.svg;
    const path = this.path;

    svg
      .append('g')
      .attr('class', 'care-supply')
      .selectAll('path')
      .data(this.mapFeatures.features)
      .join('path')
      .attr('d', path)
      .attr('fill', (d) => {
        const postcode = d.properties!['postcode4'];
        const isInEntry = (entry: CareSupplyEntry) => {
          return entry.areaPostalCodes!.includes(postcode);
        };
        const index = data.findIndex(isInEntry);
        console.log(d3.schemeCategory10[index]);
        return index !== -1 ? '#4682b401' : 'white';
        // return index !== -1 ? d3.schemeCategory10[index] : 'white';
      });
  }
}
