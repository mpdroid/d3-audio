import { PieService } from './pie/pie.service';
import { LedService } from './led/led.service';
import { SpiroService } from './spiro/spiro.service';
import { BubbleService } from './bubble/bubble.service';

export enum GraphType {
    LED,
    BUBBLE,
    PIE,
    SPIRO
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
    data: Uint8Array): Graph {
    switch (type) {
        case GraphType.LED:
            const led: Graph = new LedService(
                hostSvgElement,
                colorScale,
                xConvertor,
                yConvertor,
                transitionTime);
            led.create(data);
            return led;
            break;
        case GraphType.BUBBLE:
            const bubble: Graph = new BubbleService(
                hostSvgElement,
                colorScale,
                xConvertor,
                yConvertor,
                transitionTime);
            bubble.create(data);
            return bubble;
            break;
        case GraphType.PIE:
            const pie: Graph = new PieService(hostSvgElement, colorScale);
            pie.create(data);
            return pie;
            break;
        case GraphType.SPIRO:
            const spiro: Graph = new SpiroService(
                hostSvgElement,
                colorScale,
                xConvertor,
                yConvertor,
                transitionTime);
            spiro.create(data);
            return spiro;
            break;
        default:
            const def: Graph = new PieService(hostSvgElement, colorScale);
            def.create(data);
            return def;
    }
}
