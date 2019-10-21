import { Graph } from '../graph-type.enum';
import * as d3 from 'd3';
import { ColorService } from '../color.service';

export class BubbleService implements Graph {
  graphElement;
  previousData: number[];
  myxScaler;
  zConvertor;
  public static scaleIndex = 1;

  constructor(
    private hostSvgElement: any,
    private xScaler: any,
    private yScaler: any,
    private transitionTime: number,
    private colorService: ColorService
  ) {
    this.zConvertor = d3.scaleLinear()
      .domain(yScaler.domain())
      .range([0, 40]);
    this.myxScaler = d3.scaleLinear()
      .domain(xScaler.domain())
      .range([10, 190]);

  }

  create(data: Uint8Array): void {
    this.previousData = new Array(data.length).fill(0);
    this.update(data);
  }

  update(data: Uint8Array): void {
    const t0 = d3.transition().duration(this.transitionTime).ease(d3.easeLinear);

    const peaks = [];
    data.forEach((datum, k) => {
      if (k % 3 === 0) {
      if (this.previousData[k] > 0 && datum > this.previousData[k] * 1.5) {
        peaks.push({
          index: k,
          value: datum,
          delta: datum - this.previousData[k]
        });
      }
    }
    });

    const nw = Date.now();
    this.hostSvgElement
      .selectAll('dot' + nw)
      .data(peaks, (datum, index) => index)
      .enter()
      .append('circle')
      .style('fill', (datum: any) => this.colorService.getColorInScale(datum.index, BubbleService.scaleIndex))
      .style('stroke', 'gold')
      .style('stroke-width', '0.2')
      .attr('r', (d: any) => this.zConvertor(0))
      .attr('cx', (d: any) => this.myxScaler(d.index))
      .attr('cy', (d: any) => this.yScaler(d.value))
      .attr('opacity', 0.0)
      .transition(t0)
      .attr('opacity', 1)
      .on('start', (d, i, n) => {
        d3.active(n[i])
          .transition()
          .duration(5000)
          .ease(d3.easeExpOut)
          .attr('r', (d: any) => this.zConvertor(d.delta))
          .attr('opacity', 0)
          .remove();
      });
    this.previousData = [...data];
  }
  fade(): void {
  }
}
