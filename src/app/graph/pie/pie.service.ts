import { Injectable } from '@angular/core';
import { Graph } from './../graph-type.enum';

import *  as d3 from 'd3';

export class PieService implements Graph{
  pieElement;
  pieGenerator;
  pieDataConvertor;
  previousData: Uint8Array;

  constructor(
    private hostSvgElement: any,
    private colorScale: any) { 
  }

  create(data: Uint8Array): void {
    this.pieElement = this.hostSvgElement
        .append('g')
        .attr('id', 'pie')
        .attr('transform', 'translate(100,100)');
    this.pieDataConvertor = d3.pie()
        .startAngle(-Math.PI*.3)
        .endAngle(Math.PI*.3)
        .sort(null)
        .value((d: number) => d);

    this.pieGenerator = d3.arc()
        .innerRadius(40)
        .outerRadius(90);

    const pieData = this.pieDataConvertor(data);

    this.pieElement.selectAll('slices').data(pieData)
      .enter()
      .append('path')
      .style('fill', (datum: any, index) => {
        return this.colorScale('' + index);
      })
      .attr('stroke-width', 0)
      .attr('d', this.pieGenerator)
      .attr('opacity', 0.6);

      this.previousData = data;
  }

  update(data: Uint8Array): void {
    if (!this.pieElement) {
      this.create(data);
      return;
    }
    const pieData = this.pieDataConvertor(data);

    const slices = this.pieElement.selectAll('path').data(pieData);
    slices.transition().duration(500).attrTween("d", this.pieTween);
    this.previousData = data;

  }

  fade(): void {
    if (!this.pieElement) {
      return;
    }
    const slices = this.pieElement.selectAll('path');
    slices
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('opacity', 0)
      .remove();

    this.pieElement = null;
  }

  pieTween = (datum, index) => {
    const interpolation = d3.interpolate(this.previousData[index], datum);
    this.previousData[index] = interpolation(0);
    return (t) => {
        return this.pieGenerator(interpolation(t));
    }
  }
}
