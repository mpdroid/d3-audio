import { Component, OnInit, OnDestroy, AfterContentInit, ElementRef, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';

import { GraphComponent } from '../graph/graph.component';
import { GraphType } from '../graph/graph-type.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('graph', { static: true }) graph: GraphComponent;
  @ViewChild('miniLed', { static: true }) miniLed: GraphComponent;
  @ViewChild('miniBubble', { static: true }) miniBubble: GraphComponent;
  @ViewChild('miniPie', { static: true }) miniPie: GraphComponent;
  @ViewChild('miniSpiro', { static: true }) miniSpiro: GraphComponent;

  graphType = GraphType.BUBBLE;
  transitionTime = 17;
  refreshInterval;
  analyzer;
  bufferLength = 256;
  fftSize = this.bufferLength * 2;
  micStream;
  micAudioContext;
  scriptProcessor;

  ledGraphType = GraphType.LED;
  pieGraphType = GraphType.PIE;
  spiroGraphType = GraphType.SPIRO;
  bubbleGraphType = GraphType.BUBBLE;


  constructor() {
  }

  ngOnInit() {
    this.processMic();
    this.carouse();
  }

  carouse() {
    setInterval(() => {
      let oldType = this.graphType;
      let newType = oldType + 1;
      if (newType > Object.keys(GraphType).length / 2 - 1) {
        newType = 0;
      }
      console.log('changing chart', newType);
      this.graphType = GraphType[GraphType[newType]];
    }, 30000);

  }

  gotStream = (stream) => {
    this.micStream = stream;
    this.micAudioContext = new AudioContext();
    const mediaStreamSource = this.micAudioContext.createMediaStreamSource(stream);
    this.analyzer = this.micAudioContext.createAnalyser();
    this.analyzer.fftSize = this.fftSize;
    this.bufferLength = this.analyzer.frequencyBinCount;
    this.scriptProcessor = this.micAudioContext.createScriptProcessor();
//    this.scriptProcessor.onaudioprocess = this.processInput;
    mediaStreamSource.connect(this.analyzer);
    this.analyzer.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.micAudioContext.destination);
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.processInput(new Event('mock'));
    this.refreshInterval = setInterval(() => {
      if (document.hasFocus()) {
        this.processInput(new Event('mock'));
      }
    }, this.transitionTime);

  }

  processInput = (event) => {

    const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);

    this.analyzer.getByteFrequencyData(dataArray);
    //    this.setZeroes();
    if (document.hasFocus()) {
      this.graph.updateData(dataArray);
      this.miniLed.updateData(dataArray);
      this.miniBubble.updateData(dataArray);
      this.miniPie.updateData(dataArray);
      this.miniSpiro.updateData(dataArray);
    }


  }

  processMic() {
    if (!this.micStream) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          this.gotStream(stream);
        });
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

