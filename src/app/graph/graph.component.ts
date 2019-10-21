import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges } from '@angular/core';

import { GraphType, createGraph, Graph } from './graph-type.enum'
import * as d3 from 'd3';
import { ColorService } from './color.service';

@Component({
  selector: 'app-graph',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, OnChanges {

  @Input() transitionTime = 5;

  @Input() frequencyBinCount = 256; 

  @Input() maxStdAmplitude = 255;

  @Input() graphType = GraphType.PIE;

  hostElement;
  svgElement;
  groupElement;
  d3ColorScale;
  xScaler;
  yScaler;
  graphs: Graph[];
  currentGraph: Graph;

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.graphType && !changes.graphType.firstChange) {
        const oldGraph = this.currentGraph;
        oldGraph.fade();
        this.currentGraph = null;
    }
  }

  updateData(newData: Uint8Array) {
    this.updateAudioGraph(newData);
  }

  private createAudioGraph(data: Uint8Array) {
    this.removeSVGElementFromParent();
    this.setChartDimensions();
    this.setColorScale();
    this.addGroupElement();
    this.createXAxis();
    this.createYAxis();
    const colorService = new ColorService(this.xScaler.domain(), 0);
    this.currentGraph = createGraph(
      this.graphType,
      this.svgElement,
      this.d3ColorScale,
      this.xScaler,
      this.yScaler,
      this.transitionTime,
      data,
      colorService);
  }

  private updateAudioGraph(data: Uint8Array) {
    if (!this.svgElement || !this.currentGraph) {
      this.createAudioGraph(data);
      return;
    }
    this.currentGraph.update(data);
  }

  private setChartDimensions() {
    let viewBoxHeight = 100;
    let viewBoxWidth = 200;
    this.svgElement = d3.select(this.hostElement).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMaxYMax meet')
      .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight);
  }

  private addGroupElement() {
    this.groupElement = this.svgElement.append('g')
      .attr('transform', 'translate(0,0)');
  }

  private setColorScale() {
    this.d3ColorScale = d3.scaleSequential(d3.interpolateSpectral)
      .domain([0, this.frequencyBinCount-1]);
  }

  private createXAxis() {
    this.xScaler = d3.scaleLinear()
      .domain([0, this.frequencyBinCount-1])
      .range([0, 200]);
  }

  private createYAxis() {
    this.yScaler = d3.scaleLinear()
      .domain([0, this.maxStdAmplitude])
      .range([100, 0]);    
  }

  private removeSVGElementFromParent() {
    // !!!!Caution!!!
    // Make sure not to do;
    //     d3.select('svg').remove();
    // That will clear all other SVG elements in the DOM
    d3.select(this.hostElement).select('svg').remove();
  }

}
