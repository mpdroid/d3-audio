import { Component, OnInit, OnDestroy, AfterContentInit, ElementRef, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';

import { GraphComponent } from '../graph/graph.component';
import { GraphType } from '../graph/graph-type.enum';
import { COLOR_SCALE_ARRAY } from '../graph/color.service';
import { LedService } from '../graph/led/led.service';
import { BubbleService } from '../graph/bubble/bubble.service';
import { PieService } from '../graph/pie/pie.service';
import { SpiroService } from '../graph/spiro/spiro.service';
import * as d3 from 'd3';
import { WaveService } from '../graph/wave/wave.service';

//https://stackoverflow.com/questions/38087013/angular2-web-speech-api-voice-recognition
export interface IWindow extends Window {
  webkitAudioContext: any;
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('graph', { static: false }) graph: GraphComponent;
  @ViewChild('miniLed', { static: false }) miniLed: GraphComponent;
  @ViewChild('miniBubble', { static: false }) miniBubble: GraphComponent;
  @ViewChild('miniPie', { static: false }) miniPie: GraphComponent;
  @ViewChild('miniSpiro', { static: false }) miniSpiro: GraphComponent;
  @ViewChild('miniWave', { static: false }) miniWave: GraphComponent;

  AudioContext;
  showError = false;
  browserSupported = true;
  micAllowed = true;
  showInfo = false;

  graphTypes = Object.keys(GraphType).filter((key: any) => !isNaN(key));
  graphType = GraphType.LED;
  transitionTime = 17;
  refreshInterval;
  analyzer;
  leftAnalyzer;
  rightAnalyzer;
  bufferLength = 256;
  fftSize = this.bufferLength * 2;
  micStream;
  micAudioContext;
  scriptProcessor;


  ledGraphType = GraphType.LED;
  pieGraphType = GraphType.PIE;
  spiroGraphType = GraphType.SPIRO;
  bubbleGraphType = GraphType.BUBBLE;
  waveGraphType = GraphType.WAVE;


  constructor() {

    const win = window as any;
    // https://stackoverflow.com/questions/29373563/audiocontext-on-safari
    this.AudioContext = win.AudioContext // Default
      || win.webkitAudioContext // Safari and old versions of Chrome
      || false;
    this.browserSupported == !!this.AudioContext;
    this.browserSupported = (win.chrome && !win.opr);
    if (this.browserSupported) {
      setInterval(() => {
        let arr = range(COLOR_SCALE_ARRAY.length);
        shuffle(arr);
        LedService.scaleIndex = arr[0] - 1;
        BubbleService.scaleIndex = arr[1] - 1;
        PieService.scaleIndex = arr[2] - 1;
        SpiroService.scaleIndex = arr[3] - 1;
        WaveService.scaleIndex = arr[4] - 1;
      }, 5000);
    }
  }

  ngOnInit() {
    if (this.browserSupported) {
      this.processMic();
      this.carouse();
    }
  }

  carouse() {
    setInterval(() => {
      let oldType = this.graphType;
      let newType = oldType + 1;
      if (newType > Object.keys(GraphType).length / 2 - 1) {
        newType = 0;
      }
      this.graphType = GraphType[GraphType[newType]];
    }, 60000);

  }

  select(graphTypeId) {
    this.graphType = GraphType[GraphType[graphTypeId]];
  }

  toggleCallout() {
    this.showInfo = !this.showInfo;
  }
  gotStream = (stream) => {
    this.micStream = stream;
    this.micAudioContext = new this.AudioContext;
    const mediaStreamSource = this.micAudioContext.createMediaStreamSource(stream);
    this.analyzer = this.micAudioContext.createAnalyser();
    this.analyzer.fftSize = this.fftSize;
    this.bufferLength = this.analyzer.frequencyBinCount;
    this.scriptProcessor = this.micAudioContext.createScriptProcessor();

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
    const waveArray = new Uint8Array(this.analyzer.fftSize);
    this.analyzer.fftSize = this.fftSize;
    this.analyzer.getByteFrequencyData(dataArray);
    this.analyzer.getByteTimeDomainData(waveArray);
    if (this.graphType === this.waveGraphType) {
      this.graph.updateData(waveArray);

    } else {
      this.graph.updateData(dataArray);
    }
    this.miniLed.updateData(dataArray);
    this.miniBubble.updateData(dataArray);
    this.miniPie.updateData(dataArray);
    this.miniSpiro.updateData(dataArray);
    this.miniWave.updateData(waveArray);


  }

  processMic() {
    if (!this.micStream) {

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          this.micAllowed = true;
          this.gotStream(stream);
        }, (error) => {
          this.micAllowed = false;
        });
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

}

function shuffle(arr) {
  let n = 0;
  for (n = 0; n < arr.length - 1; n++) {
    let k = randomInt(n + 1, arr.length - 1);
    let t = arr[k];
    arr[k] = arr[n];
    arr[n] = t;
  }
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/questions/8069315/create-array-of-all-integers-between-two-numbers-inclusive-in-javascript-jquer
export function range(n) {
  return Array.from({ length: n }, (v, k) => k + 1);
}
