import { Sound } from "@pixi/sound";
import { Container, Point, Sprite, Texture } from "pixi.js-legacy";
import { Easing, Tween } from "tweedle.js";
import GameObject from "./GameObject";

export type ProjectileConfig = {
  diameter: number;
  rotationSpeed: number;
  explosionDuration: number;
  explosionMaxScale: number;
};

/**
 * Round projectile to be exacted
 */
class Projectile extends GameObject {
  public readonly projectileSprite: Sprite;
  public readonly explosionSprite: Sprite;
  private _exploded = false;
  private _rotate = false;
  private _rotateDirection = 1;
  private explosionEffectTween: Tween<Container>;

  constructor(
    private texture: Texture,
    private explosionTexture: Texture,
    public center: Point,
    public readonly config: ProjectileConfig,
    public readonly sounds?: {
      projectileExplode: Sound;
    }
  ) {
    super();

    this.projectileSprite = new Sprite(texture);
    this.explosionSprite = new Sprite(explosionTexture);
    this.explosionEffectTween = new Tween(this.explosionSprite);

    this.addChild(this.projectileSprite);
    this.projectileSprite.addChild(this.explosionSprite);
  }

  setup() {
    this.projectileSprite.anchor.set(0.5);
    this.projectileSprite.width = this.config.diameter;
    this.projectileSprite.height = this.config.diameter;

    this.explosionSprite.anchor.set(0.5);
    this.explosionSprite.visible = false;

    this.explosionEffectTween
      .to({
        scale: {
          x: this.config.explosionMaxScale,
          y: this.config.explosionMaxScale,
        },
        alpha: 0,
      })
      .duration(this.config.explosionDuration * 1000)
      .easing(Easing.Exponential.Out);
  }

  update(delta: number) {
    super.update(delta);

    this.container.position = this.center;

    if (this._rotate) {
      this.projectileSprite.rotation +=
        (this._rotateDirection * (this.config.rotationSpeed * delta)) / 1000;
    }
  }

  reset() {
    this.setExplode(false);
    this.setRotation(false);
    this.projectileSprite.rotation = 0;
  }

  setRotation(rotate: boolean, direction?: "ltr" | "rtl") {
    this._rotate = rotate;
    this._rotateDirection = direction === "rtl" ? -1 : 1;
  }

  setExplode(exploded: boolean, collidedPoint?: Point) {
    this._exploded = exploded;

    if (this._exploded) {
      this.explosionSprite.visible = true;
      this.explosionSprite.rotation = 0;

      this._rotate = false;
      this.projectileSprite.rotation = 0;

      if (collidedPoint) {
        const { x: x1, y: y1 } = this.explosionSprite.getGlobalPosition();
        const { x: x2, y: y2 } = collidedPoint;

        const collidedAngle = Math.atan2(y1 - y2, x1 - x2);
        this.explosionSprite.rotation = collidedAngle;
        this.explosionSprite.position.x += x2 - x1;
        this.explosionSprite.position.y += y2 - y1;
      }

      this.projectileSprite.texture = Texture.EMPTY;
      this.explosionEffectTween.start();
      this.sounds?.projectileExplode.play();
    } else {
      this.explosionSprite.visible = false;
      this.projectileSprite.texture = this.texture;
      this.explosionEffectTween.stop();
    }
  }

  get exploded() {
    return this._exploded;
  }
}

export default Projectile;
