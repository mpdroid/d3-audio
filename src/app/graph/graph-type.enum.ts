import { PieService } from './pie/pie.service';
import { LedService } from './led/led.service';
import { SpiroService } from './spiro/spiro.service';
import { BubbleService } from './bubble/bubble.service';
import * as d3 from 'd3';
import { randomInt } from '../home/home.component';
import { ColorService } from './color.service';
import { WaveService } from './wave/wave.service';

export enum GraphType {
    LED,
    BUBBLE,
    PIE,
    SPIRO,
    WAVE
}

export interface Graph {
    create(data: Uint8Array): void;
    update(data: Uint8Array): void;
    fade(): void;
}

export function createGraph(type: GraphType,
    hostSvgElement: any,
    colorScale: any,
    xConvertor: any,
    yConvertor: any,
    transitionTime: number,
    data: Uint8Array,
    colorService: ColorService): Graph {
    switch (type) {
        case GraphType.LED:
            const led: Graph = new LedService(
                hostSvgElement,
                xConvertor,
                yConvertor,
                transitionTime,
                colorService);
            led.create(data);
            return led;
            break;
        case GraphType.BUBBLE:
            const bubble: Graph = new BubbleService(
                hostSvgElement,
                xConvertor,
                yConvertor,
                transitionTime,
                colorService);
            bubble.create(data);
            return bubble;
            break;
        case GraphType.PIE:
            const pie: Graph = new PieService(
                hostSvgElement,
                xConvertor,
                colorService);
            pie.create(data);
            return pie;
            break;
        case GraphType.SPIRO:
            const spiro: Graph = new SpiroService(
                hostSvgElement,
                colorScale,
                xConvertor,
                yConvertor,
                transitionTime,
                colorService
            );
            spiro.create(data);
            return spiro;
            break;
        case GraphType.WAVE:
            const wave: Graph = new WaveService(
                hostSvgElement,
                xConvertor,
                yConvertor,
                transitionTime,
            );
            wave.create(data);
            return wave;
            break;
        default:
            const def: Graph = new PieService(hostSvgElement,
                colorScale,
                colorService);
            def.create(data);
            return def;
    }
}
