import { Point, Ticker } from "pixi.js-legacy";

class DynamicPoint extends Point {
  constructor(
    public readonly onUpdate: (point: Point) => void,
    ticker?: Ticker
  ) {
    super();

    (ticker ?? Ticker.shared).add(() => onUpdate(this));
  }
}

export default DynamicPoint;
