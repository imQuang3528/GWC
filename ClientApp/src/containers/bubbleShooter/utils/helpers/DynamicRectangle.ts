import { Rectangle, Ticker } from "pixi.js-legacy";

class DynamicRectangle extends Rectangle {
  constructor(
    public readonly onUpdate: (rectangle: Rectangle) => void,
    ticker?: Ticker
  ) {
    super();

    (ticker ?? Ticker.shared).add(() => onUpdate(this));
  }
}

export default DynamicRectangle;
