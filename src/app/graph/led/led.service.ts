import { Graph } from '../graph-type.enum';
import * as d3 from 'd3';
import { ColorService } from '../color.service';

export class LedService implements Graph {
  graphElement;
  colorFunction;

  public static scaleIndex = 4;

  constructor(
    private hostSvgElement: any,
    private xScaler: any,
    private yScaler: any,
    private transitionTime: number,
    private colorService: ColorService
  ) {
    this.colorFunction = (datum: any, index) => {
      return this.colorService.getColorInScale(index, LedService.scaleIndex);
    }
  }



  create(data: Uint8Array): void {
    const w = (this.xScaler(1) - this.xScaler(0));
    const rx = w * 0.1;

    this.graphElement = this.hostSvgElement.selectAll('rects').data(data);

    this.graphElement
      .enter()
      .append('rect')
      .style('fill', this.colorFunction)
      .attr('width', w)
      .attr('rx', rx)
      .attr('x', (datum: any, index) => {
        return this.xScaler(index);
      })
      .attr('y', (datum: any, index) => {
        return this.yScaler(datum);
      })
      .attr('height', (datum: any, index) => {
        return this.yScaler(0) - this.yScaler(datum);
      })
      .attr('opacity', 0)
      .transition()
      .duration(0)
      .ease(d3.easeLinear)
      .attr('opacity', 0.6);

    this.hostSvgElement.append('g')
      .attr("class", "led-border")
      .attr("stroke-width", 0.2)
      .attr('stroke', 'white')
      .call(d3.axisLeft(this.yScaler).ticks(102).tickSize(-200).tickFormat(<any>''));

  }


  update(data: Uint8Array): void {
    if (!this.graphElement) {
      this.create(data);
      return;
    }

    const leds = this.hostSvgElement.selectAll('rect').data(data);
    leds
      .transition()
      .duration(this.transitionTime)
      .ease(d3.easeLinear)
      .style('fill', this.colorFunction)
      .attr('y', (datum: any, index) => {
        return this.yScaler(datum);
      })
      .attr('height', (datum: any, index) => {
        return this.yScaler(0) - this.yScaler(datum);
      });
  }

  fade(): void {
    if (!this.graphElement) {
      return;
    }
    const leds = this.hostSvgElement.selectAll('rect');
    leds
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('y', (datum: any, index) => {
        return this.yScaler(0);
      })
      .attr('height', (datum: any, index) => {
        return 0;
      })
      .remove();
  }

}
