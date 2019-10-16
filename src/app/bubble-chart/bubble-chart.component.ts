import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges } from '@angular/core';

import * as d3 from 'd3';
import { randomInt } from '../home/home.component'
import { easeExpIn, easeExpInOut } from 'd3';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-bubble-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.scss']
})
export class BubbleChartComponent implements OnInit, OnChanges {
  @Input() transitionTime = 1000;
  @Input() xmax = 45;
  @Input() ymax = 200;
  @Input() hticks = 60;
  @Input() grid = 'false';
  @Input() data: number[];
  @Input() showLabel = 1;

  chartType = 1;

  previousData;
  previousPeaks;
  hostElement; // Native element hosting the SVG container
  svg; // Top level SVG element
  g; // SVG Group element
  colorScale; // D3 color provider
  x; // X-axis graphical coordinates
  y; // Y-axis graphical coordinates
  z;

  r;
  o;

  colors = d3.scaleOrdinal(d3.schemeCategory10);
  bins; // Array of frequency distributions - one for each area chaer
  paths; // Path elements for each area chart
  area; // For D3 area function
  histogram; // For D3 histogram function

  bubbles; // SVG bubbles element;
  leds;

  discs;
  arcs;
  arcGenerator;
  startAngle;
  endAngle;

  random;
  mockdata;


  ledArray = [];

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
    this.chartType = 0;
    this.carouse();
  }

  ngOnInit() {
  }

  carouse() {
    setInterval(() => {
      let oldType = this.chartType;
      let newType = this.chartType + 1;
      if (newType > 3) {
        newType = 0;
      }
      console.log('changing chart', newType);
      this.chartType = newType;
      this.fadeChart(oldType);
    }, 30000);

  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes.data && !changes.data.firstChange) {
    //   this.updateChart(changes.data.currentValue);
    // }
  }

  updateData(newData) {
    this.updateChart(newData);
  }




  private createChart(data: number[]) {

    this.previousPeaks = new Array(data.length).fill(0);

    this.removeExistingChartFromParent();

    this.setChartDimensions();

    this.setColorScale();

    this.addGraphicsElement();

    this.createXAxis();

    this.createYAxis();

    this.createZAxis();

    this.processData(data);

    switch (this.chartType) {
      case 0:
        this.createScratch(data);
        break;
      case 1:
        this.createBubbleChart(data);
        break;
      case 1:
        this.createLEDs(data);
        break;
      case 2:
        this.createSpiral(data);
        break;
      default:
        this.createScratch(data);
        break;
    }
  }


  private processData(data) {
  }

  private setChartDimensions() {
    let viewBoxHeight = 100;
    let viewBoxWidth = 200;
    this.svg = d3.select(this.hostElement).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight);
  }

  private addGraphicsElement() {
    this.g = this.svg.append('g')
      .attr('transform', 'translate(0,0)');

    const defs = this.svg.append('defs');

    const gradient = defs.append('radialGradient')
      .attr('id', 'radial')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
      .attr('fx', '50%')
      .attr('fy', '50%')
    gradient
      .append('stop')
      .attr('offset', '0%')
      .style('opacity', 0);
    gradient
      .append('stop')
      .attr('offset', '100%')
      .style('opacity', 1);

    //Filter for the outside glow
    const filter = defs.append('filter')
      .attr('id', 'glow');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '1.5')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'DROP');
    // feMerge.append('feMergeNode')
    //   .attr('in', 'SourceGraphic');

  }

  private setColorScale() {
    this.colorScale = d3.scaleSequential(d3.interpolateSpectral)
      .domain([0, this.xmax]);
    // Below is an example of using custom colors
    // this.colorScale = d3.scaleOrdinal().domain([0,1,2,3]).range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']);
  }

  private createXAxis() {

    let strokeWidth = (this.grid === 'true') ? 0.5 : 0;
    let dashWidth = (this.grid === 'true') ? 0.1 : 0;
    let tickFormat = (this.grid === 'true') ? d3.format('d') : '';
    console.log('max' + this.xmax);
    this.x = d3.scaleLinear()
      .domain([0, this.xmax])
      .range([0, 200]);

    if (this.grid === 'true') {
      this.g.append('g')
        .attr('transform', 'translate(0,90)')
        .attr("stroke-width", .5)
        .call(d3.axisBottom(this.x).tickSize(0).tickFormat(<any>''));

      this.g.append('g')
        .attr('transform', 'translate(0,90)')
        .style('font-size', '6')
        .style("stroke-dasharray", ("1,1"))
        .attr("stroke-width", .1)
        .call(d3.axisBottom(this.x).ticks(10).tickSize(-80));

    }

  }

  private createYAxis() {
    this.y = d3.scaleLinear()
      .domain([0, this.ymax])
      //  .domain([-255, 255])
      .range([100, 2]);
    if (this.grid === 'true') {
      this.g.append('g')
        .attr('transform', 'translate(30,0)')
        .attr("stroke-width", .5)
        .call(d3.axisLeft(this.y).tickSize(0).tickFormat(<any>''));
      this.g.append('g')
        .attr('transform', 'translate(30,0)')
        .style("stroke-dasharray", ("1,1"))
        .attr("stroke-width", .1)
        .call(d3.axisLeft(this.y).ticks(4).tickSize(-140))
        .style('font-size', '6');
    }

    if (this.showLabel === 1) {
      this.g.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(10,50) rotate(-90)')
        .style('font-size', 8)
        .text('Frequency');
    }
  }

  private createZAxis() {
    this.z = d3.scaleLinear()
      .domain([0, 10])
      .range([0, 10]);

  }

  private updateBubbleChart(data) {
    if (!this.bubbles) {
      this.createBubbleChart(data);
      return;
    }
    const t = d3.transition().duration(100).ease(d3.easeLinear);
    const t0 = d3.transition().duration(100).ease(d3.easeLinear);
    const t1 = d3.transition().duration(2000).ease(d3.easeLinear);
    const t2 = d3.transition().delay(10000).ease(() => d3.easeExpOut(1));

    // const peaks = this.data.map((datum, k) => {
    //     if(datum < this.previousData[k] && this.previousData[k] > this.previousPeaks[k]) {
    //       this.previousPeaks[k] = this.previousData[k];
    //       return this.previousData[k];
    //     } else {
    //       return 0;
    //     }
    // });

    const peaks = data.map((datum, k) => {
      if (this.previousData[k] > 0 && datum > this.previousData[k] + 30) {
        return datum;
      } else {
        return 0;
      }
    });


    const nw = Date.now();
    this.g
      .selectAll('dot' + nw)
      .data(peaks, (datum, index) => index)
      .enter()
      .append('circle')
      .style('fill', (datum: any, j) => this.colorScale('' + j))
      .attr('r', (d: any) => { return (d > 0.0) ? this.z(2) : this.z(0); })
      .attr('cx', (d: any, j) => { return this.x(j); })
      .attr('cy', (d: any) => { return this.y(d); })
      .attr('opacity', 0.0)
      .transition(t0)
      .attr('opacity', 1)
      .on('start', (d, i, n) => {
        d3.active(n[i])
          .transition()
          .duration(2000).ease(d3.easeLinear)
          .attr('r', (d: any) => { return (d > 0.0) ? this.z(8) : this.z(0); })
          .attr('opacity', 0)
          .remove();
      })


    // this.bubbles
    //   .data(this.data, (datum, index) => index)
    //   .transition(t)
    //   .attr('cy', (d: any) => { return this.y(d); })
    //   .attr('r', (d: any) => { return (d > 0.0) ? this.z(2) : this.z(0); });

  }

  private fadeBubbleChart(data) {


    this.bubbles = null;
  }
  private createBubbleChart(data) {
    const t = d3.transition().duration(100);
    const tExit = d3.transition().duration(5000);

    this.bubbles = this.g
      .selectAll('dot')
      .data(data, (datum, index) => index)
      .enter()
      .append('circle')
      .style('fill', (datum: any, j) => this.colorScale('' + j))
      .attr('opacity', 0.7)
      .attr('r', (d: any) => { return this.z(0); })
      .attr('cx', (d: any, j) => { return this.x(j); })
      .attr('cy', (d: any) => { return this.y(d); });

    //    this.updateBubbleChart();

  }

  pieGenerator;

  pie;

  pieDataGenerator;


  private createScratch(data) {



    this.pie = this.g.append('g').attr('id', 'pie').attr('transform', 'translate(100,100)');

    this.pieDataGenerator = d3.pie()
        .startAngle(-Math.PI*.4)
        .endAngle(Math.PI*.4)
        .sort(null)
        .value((d: number) => d);



    this.pieGenerator = d3.arc()
        .innerRadius(20)
        .outerRadius(90);

    const pieData = this.pieDataGenerator(data);

    this.pie.selectAll('slices').data(pieData)
      .enter()
      .append('path')
      .style('fill', (datum: any, index) => {
        return this.colorScale('' + index);
      })
      .attr('stroke-width', 0)
      .attr('d', this.pieGenerator)
      .attr('opacity', 0.6);


  }
  private updateScratch(data) {
    if (!this.pie) {
      this.createScratch(data);
      return;
    }
    console.log('updating pie');
   const pieData = this.pieDataGenerator(data);

   const slices = this.pie.selectAll('path').data(pieData);
   slices.transition().duration(500).attrTween("d", this.pieTween);
  }

  pieTween = (datum, index) => {
    const interpolation = d3.interpolate(this.previousData[index], datum);
    this.previousData[index] = interpolation(0);
    return (t) => {
        return this.pieGenerator(interpolation(t));
    }
}

  private fadeScratch(data) {
    if (!this.pie) {
      return;
    }

    const slices = this.pie.selectAll('path').data(data);
    slices
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('opacity', 0)
      .remove();

    this.pie = null;
  }



  private createSpiral(data) {

    const w = (this.x(1) - this.x(0));
    const h = this.y(0) - this.y(1);
    const rx = w * 0.1;

    this.r = d3.scaleLinear()
      .domain([0, this.xmax])
      .range([0, 60]);

    const t = this.r(3) - this.r(0);

    this.arcs = this.g.append('g').attr('id', 'arcs');
    //.attr('transform', 'translate(100,50)');


    this.startAngle = d3.scaleLinear()
      .domain([0, this.xmax])
      .range([ 1.25 * Math.PI, 3.25* Math.PI]);

    this.endAngle = d3.scaleLinear()
      .domain([0, this.ymax])
      .range([ 0, 2 * Math.PI]);

    this.arcGenerator = (datum: any, index) => {
      return d3.arc()
        .innerRadius(25)
        .outerRadius(25.5)
        .startAngle(this.startAngle(index) + Math.PI*1.5  )
        .endAngle(this.endAngle(datum) + this.startAngle(index) + Math.PI*1.5 )
    };

    this.arcs.selectAll('arcs').data(data)
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
      // .attr('opacity', 0)
      // .transition()
      // .duration(500)
      // .ease(d3.easeLinear)
      .attr('opacity', 1);


  }
  private updateSpiral(data) {
    if (!this.arcs) {
      this.createSpiral(data);
      return;
    }
    console.log('updating arcs');
    const arcs = this.arcs.selectAll('path').data(data);
    arcs.attr("d", (datum, index) => this.arcGenerator(datum, index)());

  }

  private fadeSpiral(data) {
    if (!this.arcs) {
      return;
    }

    const arcs = this.arcs.selectAll('path').data(data);
    arcs
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('opacity', 0)
      .remove();

    this.arcs = null;
  }

  arcTween = (datum, index) => {
    const interpolation = d3.interpolate(this.previousData[index], datum);
    this.previousData[index] = interpolation(0);
    return (t) => {
      this.arcGenerator(interpolation(t), index)();
    }
  }

  private createDiscs(data) {
    console.log('creating discs');
    this.r = d3.scaleLinear()
      .domain([0, this.xmax])
      .range([0, 60]);

    this.o = d3.scaleLinear()
      .domain([0, this.ymax])
      .range([0, 1]);

    const t = this.r(3) - this.r(0);
    this.g = this.svg.append('g')
      .attr('transform', 'translate(0,0)');

    this.discs = this.g.append('g').attr('id', 'discs');

    this.discs.selectAll('discs').data(data)
      .enter()
      .append('circle')
      .style('fill', 'transparent')
      .attr('stroke', (datum: any, index) => {
        return this.colorScale('' + index);
      })
      .attr('stroke-width', t)
      .attr('cx', 100)
      .attr('cy', 50)
      .attr('r', (datum: any, index) => {
        return this.r(index);
      })
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('opacity', (datum: any, index) => {
        return this.o(datum);
      });


  }

  private updateDiscs(data) {
    if (!this.discs) {
      this.createDiscs(data);
      return;
    }
    const discs = this.discs.selectAll('circle').data(data);
    discs
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('opacity', (datum: any, index) => {
        return this.o(datum);
      });
  }

  private fadeDiscs(data) {
    if (!this.discs) {
      return;
    }

    const discs = this.discs.selectAll('circle').data(data);
    discs
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('opacity', 0)
      .remove();

    this.discs = null;
  }

  private createLEDs(data) {
    const t = d3.transition().duration(100).ease(d3.easeLinear);



    const w = (this.x(1) - this.x(0));
    const h = this.y(0) - this.y(1);
    const rx = w * 0.1;

    this.leds = this.g.selectAll('rects').data(data);

    this.leds
      .enter()
      .append('rect')
      .style('fill', (datum: any, index) => {
        return this.colorScale('' + index);
      })
      // .attr('stroke', 'black')
      // .attr('stroke-width', 0.1)
      .attr('width', w)
      .attr('rx', rx)
      .attr('x', (datum: any, index) => {
        return this.x(index);
      })
      .attr('y', (datum: any, index) => {
        return this.y(datum);
      })
      .attr('height', (datum: any, index) => {
        return this.y(0) - this.y(datum);
      })
      .attr('opacity', 0)
      .transition()
      .duration(0)
      .ease(d3.easeLinear)
      .attr('opacity', 1);


  }

  private fireLEDs(data) {
    if (!this.leds) {
      this.createLEDs(data);
      return;
    }

    const leds = this.g.selectAll('rect').data(data);
    leds
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('y', (datum: any, index) => {
        return this.y(datum);
      })
      .attr('height', (datum: any, index) => {
        return this.y(0) - this.y(datum);
      });
  }

  private fadeLEDs(data) {
    if (!this.leds) {
      return;
    }
    this.g.selectAll('rect').remove();
    const leds = this.g.selectAll('rect').data(data);
    leds
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('y', (datum: any, index) => {
        return this.y(0);
      })
      .attr('height', (datum: any, index) => {
        return 0;
      })
      .remove();
    // .on('end', (d, i, n) => {
    //   d3.active(n[i])
    //     .remove();
    // });
    this.leds = null;
  }

  private createLEDsOld() {
    const t = d3.transition().duration(10).ease(d3.easeLinear);


    const w = (this.x(1) - this.x(0));
    const h = this.y(0) - this.y(1);
    const rx = w * 0.1;


    this.ledArray = new Array(this.xmax * this.ymax).fill(0);

    this.data.forEach((d, i) => {
      for (let j = 0; j < this.ymax; j++) {
        const onState = (d > j) ? 1 : 0;
        this.ledArray[j + i * this.ymax] = onState;
      }
    });

    this.leds = this.g.selectAll('rects').data(this.ledArray);

    this.leds
      .enter()
      .append('rect')
      .style('fill', (datum: any, index) => {
        const i = Math.floor(index / this.ymax);
        const j = index % this.ymax;
        return this.colorScale('' + i);
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 0.1)
      .attr('width', w)
      .attr('height', h)
      .attr('rx', rx)
      .attr('x', (datum: any, index) => {
        const i = Math.floor(index / this.ymax);
        return this.x(i);
      })
      .attr('y', (datum: any, index) => {
        const j = index % this.ymax;
        return this.y(j);
      })
      .attr('opacity', (datum) => datum);

  }

  private fireLEDsOld() {
    if (!this.leds) {
      return;
    }

    this.data.forEach((d, i) => {
      for (let j = 0; j < this.ymax; j++) {
        const onState = (d > j) ? 1 : 0;
        this.ledArray[j + i * this.ymax] = onState;
      }
    });

    const leds = this.g.selectAll('rect').data(this.ledArray);
    leds
      .transition()
      .style('opacity', (datum) => datum);
  }

  public updateChart(data: number[]) {
    if (!this.svg) {
      this.createChart(data);
      this.previousData = [...data];
      return;
    }

    this.processData(data);


    switch (this.chartType) {
      case 0:
        this.updateScratch(data);
        break;
      case 1:
        this.updateBubbleChart(data);
        break;
      case 2:
        this.fireLEDs(data);
        break;
      case 3:
        this.updateSpiral(data);
        break;
      default:
        this.updateScratch(data);
        break;
    }
    this.previousData = [...data];

  }

  public fadeChart(oldType) {
    if (!this.svg) {
      return;
    }

    const data = new Array(this.xmax).fill(0);

    switch (oldType) {
      case 0:
        this.fadeScratch(data);
        break;
      case 1:
        this.fadeBubbleChart(data);
        break;
      case 2:
        this.fadeLEDs(data);
        break;
      case 3:
        this.fadeSpiral(data);
        break;
      default:
        this.updateScratch(data);
        break;
    }

  }

  private removeExistingChartFromParent() {
    // !!!!Caution!!!
    // Make sure not to do;
    //     d3.select('svg').remove();
    // That will clear all other SVG elements in the DOM
    d3.select(this.hostElement).select('svg').remove();
  }

}
