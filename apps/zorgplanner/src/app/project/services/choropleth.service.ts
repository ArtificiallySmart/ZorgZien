import { Injectable, effect, inject, signal } from '@angular/core';

import * as d3 from 'd3';
import { FeatureCollection, GeoJsonProperties } from 'geojson';
import * as topojson from 'topojson';
import { Objects } from 'topojson-specification';

import { CareDemandList } from '../../shared/interfaces/care-demand';
import { CareSupplyList } from '../../shared/interfaces/care-supply';
import { CareDemandService } from '../care-demand/services/care-demand.service';
import { CareSupplyService } from './care-supply.service';
import { DataService } from './data.service';

export interface ZipcodeData {
  zipcode: string;
  demand: number | null;
  assignedTeam: string | null;
  color: string | null;
}

export interface PopoverLocationState {
  x: number;
  y: number;
  zipcodeData: ZipcodeData;
}

@Injectable({
  providedIn: 'root',
})
export class ChoroplethService {
  private dataService = inject(DataService);
  private careDemandService = inject(CareDemandService);
  private careSupplyService = inject(CareSupplyService);

  private centerGroningen: [number, number] = [6.4, 53.259];

  mapFeatures!: FeatureCollection;
  svg!: d3.Selection<SVGElement, unknown, HTMLElement, unknown>;
  projection = d3.geoMercator().scale(40000).center(this.centerGroningen);
  path = d3.geoPath(this.projection);
  transform: d3.ZoomTransform | null = null;

  demandZipcodeData: ZipcodeData[] = [];
  supplyZipcodeData: ZipcodeData[] = [];

  clickLocation = signal<PopoverLocationState>({
    x: 0,
    y: 0,
    zipcodeData: {} as ZipcodeData,
  });

  // clickLocation = signal<[number, number]>([0, 0]);

  constructor() {
    effect(() => {
      if (this.careDemandService.loaded()) {
        this.demandZipcodeData = this.convertDemandList(
          this.careDemandService.selectedCareDemandList()
        );
        this.combineZipcodeData();
      }
    });

    effect(() => {
      if (this.careSupplyService.loaded()) {
        this.supplyZipcodeData = this.convertSupplyList(
          this.careSupplyService.selectedCareSupplyList()
        );
        this.combineZipcodeData();
        this.createLegend(this.careSupplyService.selectedCareSupplyList());
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
    const data: ZipcodeData[] = [];
    demandList.careDemand.forEach((entry) => {
      data.push({
        zipcode: entry[0].toString(),
        demand: entry[1],
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
    const data: ZipcodeData[] = [];
    supplyList.careSupply.forEach((entry) => {
      entry.areaZipcodes?.forEach((zipcode) => {
        data.push({
          zipcode: zipcode,
          demand: null,
          assignedTeam: entry.name,
          color: entry.color,
        });
      });
    });
    return data;
  }

  combineZipcodeData() {
    const list1 = this.demandZipcodeData.map((entry) => ({ ...entry }));
    const list2 = this.supplyZipcodeData.map((entry) => ({ ...entry }));

    list2.forEach((entry) => {
      const index = list1.findIndex((el) => el.zipcode === entry.zipcode);
      if (index !== -1) {
        list1[index].assignedTeam = entry.assignedTeam ?? null;
        list1[index].color = entry.color ?? null;
      } else {
        list1.push(entry);
      }
    });
    this.plotZipcodeData(list1);
  }

  plotZipcodeData(data: ZipcodeData[]) {
    const svg = this.svg;
    const path = this.path;

    if (!this.svg) return;
    svg.selectAll('.zipcode-data').remove();

    const filteredMapFeatures = this.filterMapFeatures(data);
    const maxDemand = d3.max(data, (d) => d.demand);
    const logScale = d3.scaleLog().domain([1, maxDemand || 1]);
    const alphaValue = (value: number) => {
      return value !== null ? logScale(value) * 0.8 + 0.2 : 1;
    };

    svg
      .append('g')
      .attr('class', 'zipcode-data')
      .selectAll('path')
      .data(filteredMapFeatures)
      .join('path')
      .attr('d', path)
      .attr('fill', (d) => {
        const index = data.findIndex(
          (entry) => entry.zipcode === d.properties!['postcode4']
        );
        if (index === -1) {
          return 'grey';
        }
        const alpha = alphaValue(data[index].demand!).toString();

        if (data[index].color === null) {
          return `hsla(0, 100%, 0%, ${alpha})`;
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

  addClick(data: ZipcodeData[]) {
    const svg = this.svg;

    svg.selectAll('path').on('click', (event) => {
      const index = data.findIndex(
        (entry) =>
          entry.zipcode == event.target.__data__.properties!['postcode4']
      );
      let zipcodeData: ZipcodeData = {} as ZipcodeData;
      zipcodeData = {
        ...data[index],
        zipcode: event.target.__data__.properties!['postcode4'],
      };

      this.clickLocation.update(() => {
        return {
          x: event.offsetX,
          y: event.offsetY,
          zipcodeData: zipcodeData,
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

  createLegend(careSupplyList: CareSupplyList | null = null) {
    if (careSupplyList === null) {
      this.svg.selectAll('.legend').remove();
      return;
    }

    const keyvalue: { [key: string]: string } = {};

    careSupplyList.careSupply.forEach(
      (entry: { name: string; color: string }) => {
        keyvalue[entry.name] = entry.color;
      }
    );

    const legend = {
      dots: {
        centerX: 25,
        firstCenterY: 40,
        radius: 7,
        spaceBetween: 25,
        centerY: (i: number) => {
          return legend.dots.firstCenterY + i * legend.dots.spaceBetween;
        },
      },
      spaceBetweenDotsAndText: 10,
      text: {
        get startX() {
          return (
            legend.dots.centerX +
            legend.dots.radius +
            legend.spaceBetweenDotsAndText
          );
        },
        centerY: (i: number) => {
          return legend.dots.centerY(i);
        },
      },
    };

    this.svg
      .selectAll('circles')
      .data(Object.keys(keyvalue))
      .enter()
      .append('circle')
      .attr('class', 'legend')
      .attr('cx', legend.dots.centerX)
      .attr('cy', (d, i) => {
        return legend.dots.centerY(i);
      })
      .attr('r', legend.dots.radius)
      .style('fill', (d: string) => keyvalue[d] as string);

    this.svg
      .selectAll('labels')
      .data(Object.keys(keyvalue))
      .enter()
      .append('text')
      .attr('class', 'legend')
      .attr('x', legend.text.startX)
      .attr('y', function (d, i) {
        return legend.text.centerY(i);
      })
      .style('fill', (d: string) => keyvalue[d] as string)
      .text(function (d) {
        return Object.keys(keyvalue).find((key) => key === d) as string;
      })
      .attr('text-anchor', 'left')
      .style('alignment-baseline', 'middle');
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

  filterMapFeatures(dataList: ZipcodeData[]) {
    const features = this.mapFeatures.features.filter((feature) => {
      const postcode = feature.properties!['postcode4'];
      const index = dataList.findIndex((entry) => entry.zipcode === postcode);
      return index !== -1;
    });
    return features;
  }
}
