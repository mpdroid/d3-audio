import { Graph } from '../graph-type.enum';
import * as d3 from 'd3';

export class SpiroService implements Graph {
  graphElement;
  arcGenerator;
  rConvertor;
  startAngle;
  endAngle;

  constructor(
    private hostSvgElement: any,
    private colorScale: any,
    private xConvertor: any,
    private yConvertor: any,
    private transitionTime: number
  ) {
  }

  create(data: Uint8Array): void {

    const w = (this.xConvertor(1) - this.xConvertor(0));
    console.log(this.xConvertor.domain());
    this.rConvertor = d3.scaleLinear()
      .domain(this.xConvertor.domain())
      .range([0, 60]);

    this.graphElement = this.hostSvgElement
      .append('g')
      .attr('id', 'arcs');
    this.startAngle = d3.scaleLinear()
      .domain(this.xConvertor.domain())
      .range([1.25 * Math.PI, 3.25 * Math.PI]);

    this.endAngle = d3.scaleLinear()
      .domain(this.yConvertor.domain())
      .range([0, 2 * Math.PI]);

    this.arcGenerator = (datum: any, index) => {
      return d3.arc()
        .innerRadius(25)
        .outerRadius(25.5)
        .startAngle(this.startAngle(index) + Math.PI * 1.5)
        .endAngle(this.endAngle(datum) + this.startAngle(index) + Math.PI * 1.5)
    };

    this.graphElement.selectAll('arcs').data(data)
      .enter()
      .append('path')
      .attr('transform', (datum, index) => 'translate(' +
        (100 + 25 * Math.cos(this.startAngle(index)))
        + ','
        + (50 + 25 * Math.sin(this.startAngle(index)))
        + ')'
      )
      .style('fill', (datum: any, index) => {
        return this.colorScale('' + index);
      })
      .attr('d', (datum, index) => this.arcGenerator(datum, index)())
      .attr('opacity', 1);

  }
  update(data: Uint8Array): void {
    if (!this.graphElement) {
      this.create(data);
      return;
    }
    const arcs = this.graphElement.selectAll('path').data(data);
    arcs.attr("d", (datum, index) => this.arcGenerator(datum, index)());
  }
  fade(): void {
    if (!this.graphElement) {
      return;
    }
    const arcs = this.graphElement.selectAll('path');
    arcs
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('opacity', 0)
      .remove();

    this.graphElement = null;
  }

}
