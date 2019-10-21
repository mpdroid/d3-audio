import { Graph } from '../graph-type.enum';
import * as d3 from 'd3';

export class WaveService implements Graph {
  graphElement;
  waveFormXScaler;
  colorScale;

  static scaleIndex = 0;

  constructor(
    private hostSvgElement: any,
    private xScaler: any,
    private yScaler: any,
    private transitionTime: number
  ) {
    this.colorScale = d3.scaleSequential(d3.interpolateSpectral)
      .domain([0, 64]);
  }

  create(data: Uint8Array): void {
    this.waveFormXScaler = d3.scaleLinear()
      .domain([0, data.length + 1])
      .range([0, 200]);



    const sigma = Math.floor(d3.deviation(data));
    const mean = Math.floor(d3.mean(data));
    const copy = new Uint8Array(data.length + 2);
    copy[0] = mean;
    copy[data.length] = mean;
    copy.set(data, 1);

    const area = d3.area().curve(d3.curveBasis)
      .x((datum: any, index) => this.waveFormXScaler(index))
      .y0(this.yScaler(mean))
      .y1((datum: any) => this.yScaler(datum))

    this.graphElement = this.hostSvgElement
      .append('g')
      .attr('id', 'wave')


    this.graphElement.append('path')
      .datum(copy)
      .attr('d', (datum: any) => area(datum))
      .attr('opacity', 0)
      .transition().duration(this.transitionTime)
      .style('stroke', this.colorScale('' + sigma))
      .style('fill', this.colorScale('' + sigma))
      .style('fill-opacity', 0.5)
      .style('stroke-width', '0.2')
      .attr('opacity', 1);
  }

  update(data: Uint8Array): void {
    if (!this.graphElement) {
      this.create(data);
      return;
    }
    const sigma = Math.floor(d3.deviation(data));
    const mean = Math.floor(d3.mean(data));
    const copy = new Uint8Array(data.length + 2);
    copy[0] = mean;
    copy[data.length + 1] = mean;
    copy.set(data, 1);

    const area = d3.area().curve(d3.curveBasis)
      .x((datum: any, index) => this.waveFormXScaler(index))
      .y0(this.yScaler(mean))
      .y1((datum: any) => this.yScaler(datum));

    this.graphElement.selectAll('path').datum(copy)
      .transition().duration(this.transitionTime)
      .attr('d', (datum: any) => area(datum))
      .style('stroke',this.colorScale('' + sigma))
      .style('fill', this.colorScale('' + sigma))
      .style('fill-opacity', 0.5)
      .style('stroke-width', '0.2');
  }

  fade(): void {
    this.graphElement.remove();
  }
}
