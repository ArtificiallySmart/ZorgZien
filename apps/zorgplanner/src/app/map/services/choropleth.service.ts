import { Injectable, effect, inject, signal } from '@angular/core';

import * as d3 from 'd3';
import { FeatureCollection, GeoJsonProperties } from 'geojson';
import * as topojson from 'topojson';
import { Objects } from 'topojson-specification';

import { DataService } from '../../project/services/data.service';
import { ZipcodeData, ZipcodeDataService } from './zipcode-data.service';

import * as utils from '../../shared/utils/hsl-hsla.util';
import { Subject } from 'rxjs';

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
      this.createLegend(this.zipcodeDataService.currentZipcodeData());
    });

    effect(() => {
      this.demandType();
      this.fillZipcodeData();
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

    const minHours = d3.min(data, (d) => d.amountOfHours);
    const maxHours = d3.max(data, (d) => d.amountOfHours);
    const hourLogScale = d3.scaleLog().domain([minHours || 1, maxHours || 1]);
    const hourAlphaValue = (value: number) => {
      return value !== null ? hourLogScale(value) * 0.8 + 0.2 : 1;
    };

    const maxClients = d3.max(data, (d) => d.amountOfClients);
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
      .attr('data-hours', (d) => {
        const index = data.findIndex(
          (entry) => entry.zipcode === d.properties!['postcode4']
        );
        if (index === -1) {
          return 'grey';
        }
        const alpha = hourAlphaValue(data[index].amountOfHours!).toString();

        if (data[index].color === null) {
          return this.getUnassignedColor(+alpha);
        }
        data[index].color = utils.hslToHsla(data[index].color!, +alpha);
        return data[index].color;
      })
      .attr('data-clients', (d) => {
        const index = data.findIndex(
          (entry) => entry.zipcode === d.properties!['postcode4']
        );
        if (index === -1) {
          return 'grey';
        }
        const alpha = clientAlphaValue(data[index].amountOfClients!).toString();

        if (data[index].color === null) {
          return this.getUnassignedColor(+alpha);
        }
        data[index].color = utils.hslToHsla(data[index].color!, +alpha);
        return data[index].color;
      })
      .attr('transform', this.transform?.toString() ?? null)
      .attr('class', (d) => {
        const index = data.findIndex(
          (entry) => entry.zipcode === d.properties!['postcode4']
        );
        if (index === -1) {
          return 'unassigned';
        }
        return `${data[index].assignedTeamName
          ?.replace(/ /g, '')
          .toLowerCase()}`;
      })
      .append('title')
      .text((d) => {
        const index = data.findIndex(
          (entry) => entry.zipcode === d.properties!['postcode4']
        );
        if (index === -1) {
          return '';
        }
        const clients = data[index].amountOfClients;
        const hours = data[index].amountOfHours;
        const assignedTeamName = data[index].assignedTeamName;
        let text = `Postcode: ${data[index].zipcode}\n`;
        if (assignedTeamName !== null) {
          text += `Team: ${assignedTeamName}\n`;
        }
        if (clients !== null) {
          text += `Aantal cliënten: ${clients}\n`;
        }
        if (hours !== null) {
          text += `Aantal uren: ${hours}`;
        }

        return text;
      });

    this.addMouseOver();
    this.addClick(data);
    this.fillZipcodeData();
  }

  fillZipcodeData() {
    const svgElements = d3.selectAll('path');
    svgElements.each((_, i, nodes) => {
      const element = d3.select(nodes[i] as SVGElement);
      const color = element.attr(`data-${this.demandType()}`);

      if (!color) return;
      element.attr('fill', color);
      element.attr('stroke', 'grey');
    });
  }

  addMouseOver() {
    const svg = this.svg;
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

    svg
      // .selectAll('path')
      .on('click', (event) => {
        if (event.target.nodeName !== 'path') {
          // this.clickLocation.update(() => {
          //   return {
          //     x: event.offsetX,
          //     y: event.offsetY,
          //     zipcodeData: {} as ZipcodeData,
          //   };
          // });
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
        // this.clickLocation.update(() => {
        //   return {
        //     x: event.offsetX,
        //     y: event.offsetY,
        //     zipcodeData: zipcodeData,
        //   };
        // });
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

  createLegend(zipcodeData: ZipcodeData[]) {
    try {
      this.svg.selectAll('.legend-group').remove();
    } catch (error) {
      return;
    }

    if (!zipcodeData.length) return;

    const combinedDemandSupply = this.zipcodeDataService.combinedDemandSupply();

    const legend = {
      dots: {
        centerX: 25,
        firstCenterY: 100,
        radius: 7,
        spaceBetween: 50,
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
      progressBars: {
        height: 20,
        get startX() {
          return legend.dots.centerX - legend.dots.radius;
        },
        centerY: (i: number) => {
          return legend.dots.centerY(i) + legend.progressBars.height / 2;
        },
      },
    };

    this.svg
      .append('g')
      .attr('class', 'legend-group')
      .selectAll('circles')
      // .data(Object.keys(keyvalue).sort())
      .data(combinedDemandSupply.map((entry) => entry.organisationName).sort())
      .enter()
      .append('circle')
      .attr('class', 'legend')
      .attr('cx', legend.dots.centerX)
      .attr('cy', (_, i) => {
        return legend.dots.centerY(i);
      })
      .attr('r', legend.dots.radius)
      .style('fill', (d: string) => {
        const index = combinedDemandSupply.findIndex(
          (entry) => entry.organisationName === d
        );
        if (index === -1) {
          return '';
        }
        return combinedDemandSupply[index].organisationColor!;
      });
    // .style('fill', (d: string) => keyvalue[d] as string);

    this.svg
      .select('g.legend-group')
      .selectAll('labels')
      // .data(Object.keys(keyvalue).sort())
      .data(combinedDemandSupply.map((entry) => entry.organisationName).sort())
      .enter()
      .append('text')
      .attr('class', 'legend')
      .attr('x', legend.text.startX)
      .attr('y', function (_, i) {
        return legend.text.centerY(i);
      })
      // .text(function (d) {
      //   return Object.keys(keyvalue).find((key) => key === d) as string;
      // })
      .text((d) => d)
      .attr('text-anchor', 'left')
      .style('alignment-baseline', 'middle')
      .style('cursor', 'pointer')
      .append('title')
      .text((d) => {
        const index = combinedDemandSupply.findIndex(
          (entry) => entry.organisationName === d
        );
        if (index === -1) {
          return '';
        }
        const totalDemandClients =
          combinedDemandSupply[index].totalDemandClients;
        const totalDemandHours = combinedDemandSupply[index].totalDemandHours;
        const totalSupplyHours = combinedDemandSupply[index].totalSupplyHours;
        let text = `Organisatie: ${d}\n`;
        if (totalSupplyHours !== null) {
          text += `Aantal uren aanbod: ${totalSupplyHours}\n`;
        }
        if (totalDemandHours !== null) {
          text += `Aantal uren vraag: ${totalDemandHours}\n`;
        }
        if (totalDemandClients !== null) {
          text += `Aantal cliënten: ${totalDemandClients}`;
        }
        return text;
      });

    this.svg
      .select('g.legend-group')
      .selectAll('labels')
      // .data(Object.keys(keyvalue).sort())
      .data(combinedDemandSupply.map((entry) => entry.organisationName).sort())
      .enter()
      .append('rect')
      .attr('x', legend.progressBars.startX)
      .attr('y', (_, i) => {
        return legend.progressBars.centerY(i);
      })
      .attr('width', 100)
      .attr('height', legend.progressBars.height)
      .style('fill', 'hsla(32, 100%, 59%, .1)')
      .style('border', 'solid 1px');

    this.svg
      .select('g.legend-group')
      .selectAll('labels')
      // .data(Object.keys(keyvalue).sort())
      .data(combinedDemandSupply.map((entry) => entry.organisationName).sort())
      .enter()
      .append('rect')
      .attr('x', legend.progressBars.startX)
      .attr('y', (_, i) => {
        return legend.progressBars.centerY(i);
      })
      // .attr('width', 50)
      .attr('width', (d) => {
        const index = combinedDemandSupply.findIndex(
          (entry) => entry.organisationName === d
        );
        if (index === -1) {
          return 0;
        }
        const totalDemandHours = combinedDemandSupply[index].totalDemandHours;
        const totalSupplyHours = combinedDemandSupply[index].totalSupplyHours;
        if (totalDemandHours === null || totalSupplyHours === null) {
          return 0;
        }
        return (totalDemandHours / totalSupplyHours) * 100;
      })
      .attr('height', legend.progressBars.height)
      // .style('fill', 'grey');
      .style('fill', (d) => {
        const index = combinedDemandSupply.findIndex(
          (entry) => entry.organisationName === d
        );
        if (index === -1) {
          return '';
        }
        const totalDemandHours = combinedDemandSupply[index].totalDemandHours;
        const totalSupplyHours = combinedDemandSupply[index].totalSupplyHours;
        const percentage = (totalDemandHours / totalSupplyHours) * 100;
        if (percentage < 80) {
          return 'blue';
        }
        if (percentage < 100) {
          return 'green';
        }
        return 'red';
      });

    this.addLegendMouseOver();

    //this.addLegendClick();
  }

  // addLegendClick() {
  //   const svg = this.svg;
  //   svg.selectAll('.legend').on('click', function (_, d) {
  //     console.log(d);
  //     // const className = (d as string).replace(/ /g, '').toLowerCase();
  //     // d3.selectAll(`.${className}`).attr('stroke', '#000').raise();
  //   });
  // }

  addLegendMouseOver() {
    const svg = this.svg;
    svg
      .selectAll('.legend')
      .on('mouseover', function (_, d) {
        const className = (d as string).replace(/ /g, '').toLowerCase();
        d3.selectAll(`.${className}`).attr('stroke', '#000').raise();
      })
      .on('mouseout', function (_, d) {
        const className = (d as string).replace(/ /g, '').toLowerCase();
        d3.selectAll(`.${className}`).attr('stroke', 'grey').lower();
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
