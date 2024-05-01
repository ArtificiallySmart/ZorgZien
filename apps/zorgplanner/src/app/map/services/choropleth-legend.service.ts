import { Injectable, inject } from '@angular/core';
import { ZipcodeDataService } from './zipcode-data.service';
import { legendConfig } from './legend.config';
import * as d3 from 'd3';
import * as utils from '../../shared/utils/hsl-hsla.util';

@Injectable({
  providedIn: 'root',
})
export class ChoroplethLegendService {
  private zipcodeDataService = inject(ZipcodeDataService);

  constructor() {}

  createLegend(supplyTeams: { [key: string]: string }) {
    const svg = d3.select('svg.choropleth');
    // Remove existing legend
    try {
      svg.selectAll('.legend-group').remove();
    } catch (error) {
      return;
    }

    // No data, no legend
    if (!Object.keys(supplyTeams).length) return;

    const combinedDemandSupply = this.zipcodeDataService.combinedDemandSupply();

    // Create colored legend dots
    svg
      .append('g')
      .attr('class', 'legend-group')
      .selectAll('circles')
      .data(Object.keys(supplyTeams).sort())
      .enter()
      .append('circle')
      .attr('class', 'legend')
      .attr('cx', legendConfig.dots.centerX)
      .attr('cy', (_, i) => {
        return legendConfig.dots.centerY(i);
      })
      .attr('r', legendConfig.dots.radius)
      .style('fill', (d: string) => supplyTeams[d] as string);

    // Create legend text with info on hover
    svg
      .select('g.legend-group')
      .selectAll('labels')
      .data(Object.keys(supplyTeams).sort())
      .enter()
      .append('text')
      .attr('class', 'legend')
      .attr('x', legendConfig.text.startX)
      .attr('y', function (_, i) {
        return legendConfig.text.centerY(i);
      })
      .text(function (d) {
        return Object.keys(supplyTeams).find((key) => key === d) as string;
      })
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

    this.addLegendMouseOver(supplyTeams);
    //this.addLegendClick();
  }

  addLegendMouseOver(supplyTeams: { [key: string]: string }) {
    const svg = d3.select('svg.choropleth');

    svg
      .selectAll('.legend')
      .on('mouseover', function (_, d) {
        const teamName = d as string;
        const className = teamName.replace(/ /g, '').toLowerCase();
        const selection = d3.selectAll(`.${className}`);
        selection.each(function (_, i, nodes) {
          const element = d3.select(nodes[i] as SVGElement);
          const alpha = element.attr(`data-alpha`);
          element.attr('fill', () => {
            return utils.hslToHsla(supplyTeams[teamName] as string, +alpha);
          });
          element.attr('stroke', '#000').raise();
        });
      })

      .on('mouseout', function (_, d) {
        const className = (d as string).replace(/ /g, '').toLowerCase();
        d3.selectAll(`.${className}`).attr('stroke', 'grey').lower();
      });
  }
}
