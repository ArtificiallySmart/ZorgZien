import { Injectable, effect, inject, signal } from '@angular/core';

import * as d3 from 'd3';
import { FeatureCollection, GeoJsonProperties } from 'geojson';
import * as topojson from 'topojson';
import { Objects } from 'topojson-specification';

import { DataService } from '../../project/services/data.service';
import { ZipcodeData, ZipcodeDataService } from './zipcode-data.service';

import * as utils from '../../shared/utils/hsl-hsla.util';
import { Subject } from 'rxjs';
import { ChoroplethLegendService } from './choropleth-legend.service';

export interface ClickLocationData {
  x: number;
  y: number;
  zipcodeData: ZipcodeData;
}

@Injectable({
  providedIn: 'root',
})
export class ChoroplethService {
  private dataService = inject(DataService);
  private zipcodeDataService = inject(ZipcodeDataService);
  private legendService = inject(ChoroplethLegendService);

  private centerGroningen: [number, number] = [6.4, 53.259];

  mapFeatures!: FeatureCollection;
  svg!: d3.Selection<SVGElement, unknown, HTMLElement, unknown>;
  projection = d3.geoMercator().scale(40000).center(this.centerGroningen);
  path = d3.geoPath(this.projection);
  transform: d3.ZoomTransform | null = null;

  clickLocation$ = new Subject<ClickLocationData>();

  demandType = signal<'hours' | 'clients'>('hours');

  constructor() {
    effect(() => {
      this.plotZipcodeData(this.zipcodeDataService.currentZipcodeData());
      this.legendService.createLegend(this.zipcodeDataService.supplyTeams());
    });
  }

  init() {
    this.dataService.loadGeoData().subscribe({
      next: (geoData) => this.makeFeatures(geoData),
      error: (err) => console.log(err),
    });
  }

  getUnassignedColor(alpha: number, hsl: boolean = false) {
    if (hsl) {
      return `hsl(0, 100%, 0%)`;
    }
    return `hsla(0, 100%, 0%, ${alpha})`;
  }

  plotZipcodeData(data: ZipcodeData[]) {
    const svg = this.svg;
    const path = this.path;

    if (!this.svg) return;

    svg.selectAll('.zipcode-data').remove();
    if (!data.length) return;
    const filteredMapFeatures = this.filterMapFeatures(data);

    const minHours = d3.min(data, (d) => d.totalAmountOfHours);
    const maxHours = d3.max(data, (d) => d.totalAmountOfHours);
    const hourLogScale = d3.scaleLog().domain([minHours || 1, maxHours || 1]);
    const hourAlphaValue = (value: number) => {
      return value !== null ? hourLogScale(value) * 0.8 + 0.2 : 1;
    };

    const maxClients = d3.max(data, (d) => d.totalAmountOfClients);
    const clientLogScale = d3.scaleLog().domain([1, maxClients || 1]);
    const clientAlphaValue = (value: number) => {
      return value !== null ? clientLogScale(value) * 0.8 + 0.2 : 1;
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
        const alpha =
          this.demandType() === 'clients'
            ? clientAlphaValue(data[index].totalAmountOfClients!).toString()
            : hourAlphaValue(data[index].totalAmountOfHours!).toString();

        if (!data[index].activeTeams.length) {
          return this.getUnassignedColor(+alpha);
        }

        const color = utils.hslToHsla(data[index].activeTeams[0].color, +alpha);
        return color;
      })
      .attr('stroke', 'grey')
      .attr('data-alpha', (d) => {
        const index = data.findIndex(
          (entry) => entry.zipcode === d.properties!['postcode4']
        );
        if (this.demandType() === 'clients') {
          return clientAlphaValue(data[index].totalAmountOfClients!).toString();
        }
        return hourAlphaValue(data[index].totalAmountOfHours!).toString();
      })
      .attr('data-amt-teams', (d) => {
        const index = data.findIndex(
          (entry) => entry.zipcode === d.properties!['postcode4']
        );
        if (index === -1) {
          return '0';
        }
        return data[index].activeTeams.length.toString();
      })
      .attr('transform', this.transform?.toString() ?? null)
      .attr('class', (d) => {
        const index = data.findIndex(
          (entry) => entry.zipcode === d.properties!['postcode4']
        );
        if (index === -1) {
          return 'unassigned';
        }

        let classNames = '';

        data[index].activeTeams.forEach((team) => {
          classNames += `${team.teamName.replace(/ /g, '').toLowerCase()} `;
        });

        return classNames;
      });
    //TODO: Add title to the path
    // .append('title')
    // .text((d) => {
    //   const index = data.findIndex(
    //     (entry) => entry.zipcode === d.properties!['postcode4']
    //   );
    //   if (index === -1) {
    //     return '';
    //   }
    //   const clients = data[index].totalAmountOfClients;
    //   const hours = data[index].totalAmountOfHours;
    //   const assignedTeamName = data[index].assignedTeamName;
    //   let text = `Postcode: ${data[index].zipcode}\n`;
    //   if (assignedTeamName !== null) {
    //     text += `Team: ${assignedTeamName}\n`;
    //   }
    //   if (clients !== null) {
    //     text += `Aantal cliënten: ${clients}\n`;
    //   }
    //   if (hours !== null) {
    //     text += `Aantal uren: ${hours}`;
    //   }

    //   return text;
    // });

    this.addMouseOver();
    this.addClick(data);
  }

  addMouseOver() {
    const svg = this.svg;
    svg
      .selectAll('path')
      .on('mouseover', function () {
        d3.select(this).attr('stroke', '#000').raise();
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke', 'grey');
      });
  }

  addClick(data: ZipcodeData[]) {
    const svg = this.svg;

    svg.on('click', (event) => {
      if (event.target.nodeName !== 'path') {
        this.clickLocation$.next({
          x: event.offsetX,
          y: event.offsetY,
          zipcodeData: {} as ZipcodeData,
        });
        return;
      }
      const index = data.findIndex(
        (entry) =>
          entry.zipcode == event.target.__data__.properties!['postcode4']
      );
      let zipcodeData: ZipcodeData = {} as ZipcodeData;
      zipcodeData = {
        ...data[index],
        zipcode: event.target.__data__.properties!['postcode4'],
      };
      this.clickLocation$.next({
        x: event.offsetX,
        y: event.offsetY,
        zipcodeData: zipcodeData,
      });
    });
  }

  makeFeatures(geoData: TopoJSON.Topology<Objects<GeoJsonProperties>>) {
    this.mapFeatures = topojson.feature(geoData, {
      type: 'GeometryCollection',
      geometries: (geoData.objects['groningen'] as GeoJsonProperties)![
        'geometries'
      ],
    });
    this.svg = d3.select('svg.choropleth');
    this.draw();
  }

  draw() {
    const svg = this.svg;
    const path = this.path;
    svg
      .append('g')
      .attr('class', 'map-group')
      .selectAll('path')
      .data(this.mapFeatures.features)
      .join('path')
      .attr('d', path)
      .attr('fill', 'white')
      .attr('stroke', 'grey');

    const zoom = d3
      .zoom<SVGElement, unknown>()
      .scaleExtent([1, 1])
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
    value ? this.createLabels() : this.removeLabels();
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
