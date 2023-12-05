import { Color, Graphics } from "pixi.js-legacy";
import GameObject from "./GameObject";

class GuideArrow extends GameObject {
  public readonly bodyGraphics: Graphics;
  public readonly headGraphics: Graphics;

  private readonly BODY_WIDTH = 24;
  private readonly HEAD_WIDTH = 44;
  private readonly HEAD_HEIGHT = 30;
  private readonly HEAD_SINK = 10;

  constructor(public color: Color, public length: number) {
    super();

    this.bodyGraphics = new Graphics();
    this.headGraphics = new Graphics();
    this.addChild(this.bodyGraphics, this.headGraphics);
  }

  setup() {
    super.setup();

    this.bodyGraphics.beginFill(this.color);
    this.bodyGraphics.moveTo(0, this.length);
    this.bodyGraphics.lineTo(-this.BODY_WIDTH / 2, 0);
    this.bodyGraphics.lineTo(this.BODY_WIDTH / 2, 0);
    this.bodyGraphics.endFill();

    this.headGraphics.beginFill(this.color);
    this.headGraphics.moveTo(0, -this.HEAD_HEIGHT);
    this.headGraphics.lineTo(-this.HEAD_WIDTH / 2, this.HEAD_SINK);
    this.headGraphics.lineTo(0, 0);
    this.headGraphics.lineTo(this.HEAD_WIDTH / 2, this.HEAD_SINK);
    this.headGraphics.endFill();
  }
}

export default GuideArrow;
