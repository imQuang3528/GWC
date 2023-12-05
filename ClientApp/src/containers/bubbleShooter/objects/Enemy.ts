import { Container, Graphics, Point, Sprite, Texture } from "pixi.js-legacy";
import { Easing, Interpolation, Tween } from "tweedle.js";
import RandomPick from "../utils/helpers/RandomPick";
import GameObject from "./GameObject";

export type EnemyConfig = {
  diameter: number;
  floatingDurationSpeedRatio: number;
  floatingDurationNoise: RandomPick<number>;
  floatingDelta: number;
  fallingStopY: number;
  fallingDuration: number;
  fallingPeak: number;
  fallingDrift: number;
};

class Enemy extends GameObject {
  public readonly bodySprite: Sprite;
  public speed: number = 0;
  public direction: -1 | 1 = 1;
  public readonly floatingTween: Tween<Container>;
  public readonly fallingTween: Tween<Container>;
  private _hit = false;
  private debugGraphics = new Graphics();

  private readonly MAX_HIT_SLOPE = 0.6;

  public onFallingFinish?: () => void;

  constructor(
    private textures: RandomPick<Texture[]>,
    public readonly config: EnemyConfig
  ) {
    super();

    this.bodySprite = new Sprite();
    this.floatingTween = new Tween(this.bodySprite);
    this.fallingTween = new Tween(this.bodySprite);

    this.addChild(this.bodySprite);

    this.debugGraphics.lineStyle(2, 0xffffff, 1);
    this.bodySprite.addChild(this.debugGraphics);
  }

  setup() {
    this.bodySprite.anchor.set(0.5);
    this.bodySprite.width = this.config.diameter;
    this.bodySprite.height = this.config.diameter;

    this.floatingTween
      .to({ y: "+" + this.config.floatingDelta })
      .duration(1000) // default
      .yoyo(true)
      .repeat(Infinity)
      .easing(Easing.Quadratic.InOut)
      .start();

    this.fallingTween
      .duration(this.config.fallingDuration * 1000)
      .interpolation(Interpolation.Geom.Bezier)
      .onComplete(() => this.onFallingFinish?.());

    this.reset();
  }

  reset() {
    this.bodySprite.position.set(0);
    this.bodySprite.texture = this.textures.getRandom();
    this.floatingTween.duration(
      (this.config.floatingDurationSpeedRatio / this.speed) *
        1000 *
        (1 + this.config.floatingDurationNoise.getRandom())
    );
    this.bodySprite.rotation = 0;
    this.setHit(false);
  }

  update(delta: number) {
    super.update(delta);

    if (!this._hit) {
      this.container.x += (this.direction * this.speed * delta) / 1000;
    }
  }

  setHit(hit: boolean, collidedPoint?: Point) {
    this._hit = hit;

    if (hit) {
      this.floatingTween.pause();

      if (collidedPoint) {
        const { x: x1, y: y1 } = this.bodySprite.toLocal(
          this.bodySprite.getGlobalPosition()
        );
        const { x: x2, y: y2 } = this.bodySprite.toLocal(collidedPoint);

        let slope = (y1 - y2) / (x1 - x2);
        if (Math.abs(slope) < this.MAX_HIT_SLOPE) {
          slope = Math.sign(slope) * this.MAX_HIT_SLOPE;
        }

        const peakY = y1 - this.config.fallingPeak;
        const peakX = (peakY - (y1 - slope * x1)) / slope;

        const lowX = 2 * peakX - x2;
        const lowY = y2;

        const bottomX = lowX - Math.sign(slope) * this.config.fallingDrift;
        const bottomY = y1 + this.config.fallingStopY;

        // DEBUG ONLY
        // this.debugGraphics.drawCircle(x1, y1, 2);
        // this.debugGraphics.drawCircle(x2, y2, 5);
        // this.debugGraphics.drawCircle(peakX, peakY, 5);
        // this.debugGraphics.drawCircle(lowX, lowY, 5);
        // this.debugGraphics.drawCircle(bottomX, bottomY, 5);

        this.fallingTween
          .to({
            x: [peakX, lowX, bottomX],
            y: [peakY, lowY, bottomY],
            rotation: -Math.sign(slope) * Math.PI,
          })
          .restart();
      }
    } else {
      this.floatingTween.resume();
      this.fallingTween.stop();
      this.fallingTween.reset();
    }
  }

  get hit() {
    return this._hit;
  }
}

export default Enemy;
