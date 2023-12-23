import { Injectable, effect, inject, signal } from '@angular/core';

import * as d3 from 'd3';
import { FeatureCollection, GeoJsonProperties } from 'geojson';
import * as topojson from 'topojson';
import { Objects } from 'topojson-specification';

import { CareDemandList } from '../../shared/interfaces/care-demand';
import { CareSupplyList } from '../../shared/interfaces/care-supply';
import { CareDemandService } from './care-demand.service';
import { CareSupplyService } from './care-supply.service';
import { DataService } from './data.service';

export interface PostalCodeData {
  postalCode: string;
  demand: number | null;
  assignedTeam: string | null;
  color: string | null;
}

export interface PopoverLocationState {
  x: number;
  y: number;
  postalCodeData: PostalCodeData;
}

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

  demandPostalCodeData: PostalCodeData[] = [];
  supplyPostalCodeData: PostalCodeData[] = [];

  clickLocation = signal<PopoverLocationState>({
    x: 0,
    y: 0,
    postalCodeData: {} as PostalCodeData,
  });

  // clickLocation = signal<[number, number]>([0, 0]);

  constructor() {
    effect(() => {
      if (this.careDemandService.loaded()) {
        this.demandPostalCodeData = this.convertDemandList(
          this.careDemandService.selectedCareDemandList()
        );
        this.combinePostalCodeData();
      }
    });

    effect(() => {
      if (this.careSupplyService.loaded()) {
        this.supplyPostalCodeData = this.convertSupplyList(
          this.careSupplyService.selectedCareSupplyList()
        );
        this.combinePostalCodeData();
      }
    });
  }

  init() {
    this.dataService.loadGeoData().subscribe({
      next: (geoData) => this.makeFeatures(geoData),
      error: (err) => console.log(err),
    });
  }

  convertDemandList(demandList: CareDemandList | null) {
    if (demandList === null) {
      return [];
    }
    const data: PostalCodeData[] = [];
    demandList.careDemand.forEach((value, key) => {
      data.push({
        postalCode: key.toString(),
        demand: value,
        assignedTeam: null,
        color: null,
      });
    });
    return data;
  }

  convertSupplyList(supplyList: CareSupplyList | null) {
    if (supplyList === null) {
      return [];
    }
    const data: PostalCodeData[] = [];
    supplyList.careSupply.forEach((entry) => {
      entry.areaPostalCodes?.forEach((postalCode) => {
        data.push({
          postalCode: postalCode,
          demand: null,
          assignedTeam: entry.name,
          color: entry.color,
        });
      });
    });
    return data;
  }

  combinePostalCodeData() {
    const list1 = this.demandPostalCodeData.map((entry) => ({ ...entry }));
    const list2 = this.supplyPostalCodeData.map((entry) => ({ ...entry }));

    list2.forEach((entry) => {
      const index = list1.findIndex((el) => el.postalCode === entry.postalCode);
      if (index !== -1) {
        list1[index].assignedTeam = entry.assignedTeam ?? null;
        list1[index].color = entry.color ?? null;
      } else {
        list1.push(entry);
      }
    });

    this.plotPostalCodeData(list1);
    // return data;
  }

  plotPostalCodeData(data: PostalCodeData[]) {
    const svg = this.svg;
    const path = this.path;

    if (!this.svg) return;
    svg.selectAll('.postal-code-data').remove();

    const filteredMapFeatures = this.filterMapFeatures(data);
    const maxDemand = d3.max(data, (d) => d.demand);
    const logScale = d3.scaleLog().domain([1, maxDemand || 1]);
    const alphaValue = (value: number) => {
      return value !== null ? logScale(value) * 0.8 + 0.2 : 1;
    };

    svg
      .append('g')
      .attr('class', 'postal-code-data')
      .selectAll('path')
      .data(filteredMapFeatures)
      .join('path')
      .attr('d', path)
      .attr('fill', (d) => {
        const index = data.findIndex(
          (entry) => entry.postalCode === d.properties!['postcode4']
        );
        if (index === -1) {
          return 'grey';
        }
        const alpha = alphaValue(data[index].demand!).toString();

        if (data[index].color === null) {
          return `hsla(0, 100%, 50%, ${alpha})`;
        }
        data[index].color = this.hslToHsla(data[index].color!, +alpha);
        return data[index].color;
      })
      .attr('transform', this.transform?.toString() ?? null);

    this.addMouseOver();
    this.addClick(data);
  }

  hslToHsla(hsl: string, alpha: number) {
    if (hsl.startsWith('hsla')) {
      return hsl;
    }
    const hsla = hsl.replace(')', `, ${alpha})`);
    return hsla;
  }

  addMouseOver() {
    const svg = this.svg;
    //const path = this.path;
    svg
      .selectAll('path')
      .on('mouseover', function () {
        d3.select(this).attr('stroke', '#000').raise();
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke', 'grey').lower();
      });
  }

  addClick(data: PostalCodeData[]) {
    const svg = this.svg;

    svg.selectAll('path').on('click', (event) => {
      const index = data.findIndex(
        (entry) =>
          entry.postalCode == event.target.__data__.properties!['postcode4']
      );
      let postalCodeData: PostalCodeData = {} as PostalCodeData;
      postalCodeData = {
        ...data[index],
        postalCode: event.target.__data__.properties!['postcode4'],
      };

      this.clickLocation.update(() => {
        return {
          x: event.offsetX,
          y: event.offsetY,
          postalCodeData: postalCodeData,
        };
      });
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

  filterMapFeatures(dataList: PostalCodeData[]) {
    const features = this.mapFeatures.features.filter((feature) => {
      const postcode = feature.properties!['postcode4'];
      const index = dataList.findIndex(
        (entry) => entry.postalCode === postcode
      );
      return index !== -1;
    });
    return features;
  }
}
