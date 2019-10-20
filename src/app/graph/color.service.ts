import * as d3 from 'd3';

export const COLOR_SCALE_ARRAY = [
  d3.interpolateRdYlGn,
  d3.interpolateYlGnBu,
  d3.interpolateSpectral,
  d3.interpolateRainbow,
  d3.interpolateWarm,
  d3.interpolateCool
];

export class ColorService {

  scaleFunctionArray = [];

  constructor(private domain: any, private currentScaleIndex = 0) {
    // this.setColorScale();
    COLOR_SCALE_ARRAY.forEach((fn) => {
      this.scaleFunctionArray.push(
        d3.scaleSequential(fn)
      .domain(this.domain)
      );
    });
  }

  getColorInScale(index = 0, scale = 0) {
    return this.scaleFunctionArray[scale]('' + index);
  }
}
