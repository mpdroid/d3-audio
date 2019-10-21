import { Graph } from '../graph-type.enum';
import * as d3 from 'd3';
import { ColorService, COLOR_SCALE_ARRAY } from '../color.service';
import { randomInt } from '../common-functions';

export class SpiroService implements Graph {
  graphElement;
  arcGenerator;
  startAngle;
  endAngle;
  colorFunction;
  static scaleIndex = 0;

  constructor(
    private hostSvgElement: any,
    private colorScale: any,
    private xScaler: any,
    private yScaler: any,
    private transitionTime: number,
    private colorService: ColorService
  ) {
    this.colorFunction = (datum: any, index) => {
      return this.colorService.getColorInScale(index, SpiroService.scaleIndex);
    };
  }

  create(data: Uint8Array): void {

    this.graphElement = this.hostSvgElement
      .append('g')
      .attr('id', 'arcs');
    this.startAngle = d3.scaleLinear()
      .domain(this.xScaler.domain())
      .range([1.25 * Math.PI, 3.25 * Math.PI]);

    this.endAngle = d3.scaleLinear()
      .domain(this.yScaler.domain())
      .range([0, 1.5 * Math.PI]);

    this.arcGenerator = (datum: any, index) => {
      return d3.arc()
        .innerRadius(20)
        .outerRadius(20.2)
        .startAngle(this.startAngle(index) + Math.PI * 1.5)
        .endAngle(this.endAngle(datum) + this.startAngle(index) + Math.PI * 1.5)
    };

    const frequencyDomainTransformer = (datum, index) => 'translate(' +
      (100 + 20 * Math.cos(this.startAngle(index)))
      + ','
      + (50 + 20 * Math.sin(this.startAngle(index)))
      + ')';

    this.graphElement.selectAll('arcs').data(data)
      .enter()
      .append('path')
      .attr('transform', frequencyDomainTransformer)
      .style('fill', this.colorFunction)
      .attr('d', (datum, index) => this.arcGenerator(datum, index)())
      .attr('opacity', 1);

  }
  update(data: Uint8Array): void {
    if (!this.graphElement) {
      this.create(data);
      return;
    }
    const arcs = this.graphElement.selectAll('path').data(data);
    arcs.attr("d", (datum, index) => this.arcGenerator(datum, index)())
    .style('fill', this.colorFunction);
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
