import { Component, OnInit, OnDestroy, AfterContentInit, ElementRef, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import * as d3 from 'd3';

import { BubbleChartComponent } from './../bubble-chart/bubble-chart.component';
import { ChartControlsService } from '../chart-controls.service';
import { IWindow } from '../app.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterContentInit {
  @ViewChild('bubbleChart', { static: true }) chart: BubbleChartComponent;
  @ViewChild('audio', { static: true }) audio: ElementRef;

  chartData = [];

  transitionTime = 17;
  refreshInterval;

  audioContext;
  analyzer;
  dataArray;
  bufferLength = 256;
  fftSize = this.bufferLength * 2;
  micStream;
  micAudioContext;
  audioStream;
  scriptProcessor;
  audioProcessing = false;

  lastChangeTime;

  N = 5;
  means = [15, 30, 45, 60, 75];
  drifts = [0.1, -.1, 0, .1, -.1];


  constructor(private chartControlsService: ChartControlsService) {
    this.chartControlsService.fullScreen = true;
  }

  ngOnInit() {
    this.processMic();
  }


  gotStream = (stream) => {
    this.micStream = stream;
    this.micAudioContext = new AudioContext();
    const mediaStreamSource = this.micAudioContext.createMediaStreamSource(stream);
    this.analyzer = this.micAudioContext.createAnalyser();
    this.analyzer.fftSize = this.fftSize;
    this.bufferLength = this.analyzer.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
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
      this.chart.updateData(dataArray);
    }
    this.dataArray = [...dataArray];
    // this.chart.data = [...this.dataArray];
  }

  processMic() {
    if (this.audioProcessing) {
      this.audio.nativeElement.pause();
      if (this.audioContext) {
        this.audioContext.close().then(() => {
          this.analyzer.disconnect();
          this.scriptProcessor.disconnect();
        });
        this.audioContext = null;
      }
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
    }
    if (!this.micStream) {
      this.lastChangeTime = Date.now();
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          this.gotStream(stream);
        });
    }
  }
  processAudio(event) {
    event.preventDefault();
    if (this.micStream) {
      this.micStream().getTracks().forEach(track => track.stop());
      if (this.micAudioContext) {
        this.micAudioContext.close();
        this.micAudioContext = null;
      }
    }
    if (!this.audioProcessing) {
      this.audioProcessing = true;
      this.audioContext = new AudioContext();
      const audioSrc = this.audioContext.createMediaElementSource(this.audio.nativeElement);
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = this.fftSize;
      this.bufferLength = this.analyzer.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      audioSrc.connect(this.analyzer);
      audioSrc.connect(this.audioContext.destination);


      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
      this.generateData();
      this.refreshInterval = setInterval(() => {
        if (document.hasFocus()) {
          this.generateData();
          this.chart.data = [...this.dataArray];
        }
      }, this.transitionTime);
    }


  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  ngAfterContentInit() {
  }

  select(event, fileName) {
    event.preventDefault();
    this.audio.nativeElement.pause();
    this.audio.nativeElement.src = 'assets/' + fileName;
  }


  generateData() {
    if (this.analyzer) {
      this.analyzer.getByteFrequencyData(this.dataArray);
      // this.setZeroes()
      this.chart.data = [...this.dataArray];
    }

  }

  setZeroes() {
    this.dataArray = this.dataArray.map((datum) => {
      if (datum < 0) {
        return 0;
      } else {
        return datum;
      }
    });
  }

}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

