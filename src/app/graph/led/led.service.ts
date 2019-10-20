import { Graph } from '../graph-type.enum';
import * as d3 from 'd3';
import { ColorService } from '../color.service';

export class LedService implements Graph{
  graphElement;

  public static scaleIndex = 4;

  constructor(
    private hostSvgElement: any,
    private xConvertor: any,
    private yConvertor: any,
    private transitionTime: number,
    private colorService: ColorService
    ) { 

  }



  create(data: Uint8Array): void {
    const w = (this.xConvertor(1) - this.xConvertor(0));
    const rx = w * 0.1;

    this.graphElement = this.hostSvgElement.selectAll('rects').data(data);
    this.graphElement
      .enter()
      .append('rect')
      .style('fill', (datum: any, index) => {
        return this.colorService.getColorInScale(index, LedService.scaleIndex);
      })
      .attr('width', w)
      .attr('rx', rx)
      .attr('x', (datum: any, index) => {
        return this.xConvertor(index);
      })
      .attr('y', (datum: any, index) => {
        return this.yConvertor(datum);
      })
      .attr('height', (datum: any, index) => {
        return this.yConvertor(0) - this.yConvertor(datum);
      })
      .attr('opacity', 0)
      .transition()
      .duration(0)
      .ease(d3.easeLinear)
      .attr('opacity', 0.6);
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
      .style('fill', (datum: any, index) => {
        return this.colorService.getColorInScale(index, LedService.scaleIndex);
      })
        .attr('y', (datum: any, index) => {
        return this.yConvertor(datum);
      })
      .attr('height', (datum: any, index) => {
        return this.yConvertor(0) - this.yConvertor(datum);
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
        return this.yConvertor(0);
      })
      .attr('height', (datum: any, index) => {
        return 0;
      })
      .remove();    
  }

}
