import { Graph } from '../graph-type.enum';
import * as d3 from 'd3';

export class WaveService implements Graph {
  graphElement;
  waveConvertor;

  colorScale;

  static scaleIndex = 0;

  constructor(
    private hostSvgElement: any,
    private xConvertor: any,
    private yConvertor: any,
    private transitionTime: number
  ) {
    this.colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
    .domain([0, 128]);
  }

  create(data: Uint8Array): void {
    this.waveConvertor = d3.scaleLinear()
      .domain([0,data.length+2])
      .range([0, 200]);



    const sigma = Math.floor(d3.deviation(data));
    const mean = Math.floor(d3.mean(data));
    const copy = new Uint8Array(data.length + 2);
    copy[0] = mean;
    copy[data.length+1] = mean;
    copy.set(data,1); 

    const area = d3.area().curve(d3.curveBasis)
    .x((datum: any, index) => this.waveConvertor(index))
    .y0((datum: any) => this.yConvertor(mean))
    .y1((datum: any) => this.yConvertor(datum))

    this.graphElement = this.hostSvgElement
      .append('g')
      .attr('id', 'wave')


      this.graphElement.append('path')
      .datum(copy)
      .attr('d', (datum: any) => area(datum))
      .attr('opacity', 0)
      .transition().duration(this.transitionTime)
      .style('stroke', (datum: any, index) => {
        return this.colorScale('' + sigma);
      })
      .style('fill', (datum: any, index) => {
        return this.colorScale('' + sigma);
      })
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
    copy[data.length+1] = mean;
    copy.set(data,1); 

    const area = d3.area().curve(d3.curveBasis)
    .x((datum: any, index) => this.waveConvertor(index))
    .y0((datum: any) => this.yConvertor(mean))
    .y1((datum: any) => this.yConvertor(datum));

    this.graphElement.selectAll('path').datum(copy)
   .transition().duration(this.transitionTime)
    .attr('d',  (datum: any) => area(datum))
    .style('stroke', (datum: any, index) => {
      return this.colorScale('' + sigma);
    })
    .style('fill', (datum: any, index) => {
      return this.colorScale('' + sigma);
    })
    .style('fill-opacity', 0.5)
    .style('stroke-width', '0.2');
  }

  fade(): void {
    this.graphElement.remove();
  }
}
