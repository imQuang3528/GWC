import { Sound } from "@pixi/sound";
import {
  AlphaFilter,
  Color,
  Container,
  FederatedPointerEvent,
  Point,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js-legacy";
import { Easing, Interpolation, Tween } from "tweedle.js";
import GameObject from "./GameObject";
import GuideArrow from "./GuideArrow";
import Projectile, { ProjectileConfig } from "./Projectile";

export type CannonConfig = {
  cannonWidth: number;
  cannonHeight: number;
  wheelDiameter: number;
  angleLimit: number;
  resetCannonDuration: number;
  resetProjectileDuration: number;
  projectileSpawnDepth: number;
  cannonFirePushBackLength: number;
  cannonFirePushBackDuration: number;
  cannonFireEffectScale: number;
  cannonFireEffectDuration: number;
  projectileConfig: {
    texture: Texture;
    explosionTexture: Texture;
    speed: number;
  } & ProjectileConfig;
};

class Cannon extends GameObject {
  public readonly frontSprite: Sprite;
  public readonly backSprite: Sprite;
  public readonly wheelSprite: Sprite;
  public readonly fireEffectSprite: Sprite;
  public readonly projectile: Projectile;
  public readonly frontBody: Container;
  public readonly backBody: Container;
  public readonly guideArrow: GuideArrow;

  public rotation = 0;
  public groundPoint = new Point(0, 0);
  public projectilePoint = new Point(0, 0);
  public readonly pivot = new Point(0, 0);

  private fireCannonTween: Tween<Container>;
  private fireEffectTween: Tween<Container>;
  private resetCannonTween: Tween<{ rotation: number }>;
  private resetProjectileTween: Tween<Container>;
  private guideArrowTween: Tween<AlphaFilter>;
  private guideArrowFilter: AlphaFilter;

  private _fired = false;
  private _resetting = false;
  private _interaction = true;
  private _guideArrowShown = false;
  private _guideArrowHidden = false;

  private readonly GUIDE_ARROW_COLOR = new Color("#ffffff");
  private readonly GUIDE_ARROW_LENGTH = 180;
  private readonly GUIDE_ARROW_APPEAR_DURATION = 350;
  private readonly GUIDE_ARROW_APPEAR_DELAY = 50;
  private readonly GUIDE_ARROW_APPEAR_ALPHA = 0.8;

  get fired(): boolean {
    return this._fired;
  }

  public checkInBounds?: (projectileBounds: Rectangle) => boolean;

  // Should interactions be allowed
  public onInteraction?: () => boolean;

  constructor(
    textures: {
      front: Texture;
      back: Texture;
      wheel: Texture;
      fireEffect: Texture;
    },
    public readonly config: CannonConfig,
    public readonly interactionContainer?: Container,
    public readonly sounds?: {
      fire: Sound;
      projectileExplode: Sound;
      reload: Sound;
    }
  ) {
    super();

    this.frontSprite = new Sprite(textures.front);
    this.backSprite = new Sprite(textures.back);
    this.wheelSprite = new Sprite(textures.wheel);
    this.fireEffectSprite = new Sprite(textures.fireEffect);
    this.frontBody = new Container();
    this.backBody = new Container();
    this.projectile = new Projectile(
      config.projectileConfig.texture,
      config.projectileConfig.explosionTexture,
      this.projectilePoint,
      config.projectileConfig,
      sounds
    );
    this.guideArrow = new GuideArrow(
      this.GUIDE_ARROW_COLOR,
      this.GUIDE_ARROW_LENGTH
    );

    this.frontBody.addChild(this.frontSprite);
    this.backBody.addChild(this.backSprite);

    this.addChild([
      this.backBody,
      this.guideArrow,
      this.fireEffectSprite,
      this.projectile,
      this.frontBody,
      this.wheelSprite,
    ]);

    const fireCannonTo = { y: [this.config.cannonFirePushBackLength, 0] };
    const fireCannonDuration = this.config.cannonFirePushBackDuration * 1000;
    const fireCannonEasing = Easing.Exponential.Out;
    const fireCannonInterpolation = Interpolation.Geom.Bezier;

    const fireCannonTweenBack = new Tween(this.backSprite)
      .to(fireCannonTo)
      .duration(fireCannonDuration)
      .easing(fireCannonEasing)
      .interpolation(fireCannonInterpolation);
    this.fireCannonTween = new Tween(this.frontSprite)
      .to(fireCannonTo)
      .duration(fireCannonDuration)
      .easing(fireCannonEasing)
      .interpolation(fireCannonInterpolation)
      .onStart(() => fireCannonTweenBack.start());

    this.fireEffectTween = new Tween(this.fireEffectSprite)
      .duration(this.config.cannonFireEffectDuration * 1000)
      .easing(Easing.Exponential.Out);

    this.resetProjectileTween = new Tween(this.projectile.projectileSprite)
      .to({ y: 0 })
      .duration(this.config.resetProjectileDuration * 1000)
      .easing(Easing.Back.Out);
    this.resetCannonTween = new Tween(this)
      .to({ rotation: 0 })
      .duration(this.config.resetCannonDuration * 1000)
      .easing(Easing.Back.InOut)
      .chain(this.resetProjectileTween);

    this.guideArrowFilter = new AlphaFilter();
    this.guideArrowTween = new Tween(this.guideArrowFilter)
      .duration(this.GUIDE_ARROW_APPEAR_DURATION)
      .delay(this.GUIDE_ARROW_APPEAR_DELAY)
      .easing(Easing.Quadratic.InOut);
  }

  setup(): void {
    super.setup();

    this.frontSprite.anchor.set(0.5, 1);
    this.frontSprite.width = this.config.cannonWidth;
    this.frontSprite.height = this.config.cannonHeight;

    this.backSprite.anchor.set(0.5, 1);
    this.backSprite.width = this.config.cannonWidth;
    this.backSprite.height = this.config.cannonHeight;

    this.wheelSprite.anchor.set(0.5, 1);
    this.wheelSprite.width = this.config.wheelDiameter;
    this.wheelSprite.height = this.config.wheelDiameter;

    this.projectile.setup();

    this.guideArrowFilter.alpha = 0;
    this.guideArrow.container.filters = [this.guideArrowFilter];
    this.guideArrow.setup();

    this.fireEffectSprite.anchor.set(0.5);
    const ratio = this.fireEffectSprite.height / this.fireEffectSprite.width;
    this.fireEffectSprite.width = this.projectile.config.diameter;
    this.fireEffectSprite.height = this.fireEffectSprite.width * ratio;
    this.fireEffectSprite.alpha = 0;

    this.fireEffectTween.from({ alpha: 1 }).to({
      scale: {
        x: this.fireEffectSprite.scale.x * this.config.cannonFireEffectScale,
        y: this.fireEffectSprite.scale.y * this.config.cannonFireEffectScale,
      },
      alpha: 0,
    });

    this.addInteraction();
  }

  update(delta: number): void {
    super.update(delta);

    this.wheelSprite.position = this.groundPoint;

    this.pivot.x =
      this.wheelSprite.x +
      this.wheelSprite.width * (0.5 - this.wheelSprite.anchor.x);
    this.pivot.y =
      this.wheelSprite.y +
      this.wheelSprite.height * (0.5 - this.wheelSprite.anchor.y);

    this.frontBody.position = this.pivot;
    this.backBody.position = this.pivot;

    this.frontBody.rotation = this.rotation;
    this.backBody.rotation = this.rotation;

    // Projectile
    this.projectilePoint.copyFrom(this.pivot);

    this.fireEffectSprite.position = this.pivot;
    this.fireEffectSprite.pivot.y = this.pivot.y + this.frontBody.height;
    this.fireEffectSprite.rotation = this.rotation;

    if (!this._fired) {
      this.projectile.container.rotation = this.rotation;
      this.projectile.container.pivot.y =
        this.backSprite.height - this.config.projectileConfig.diameter / 4; // TODO: remove hardcoded 4
    } else {
      if (
        this.checkInBounds?.(this.projectile.projectileSprite.getBounds()) ??
        true
      ) {
        if (!this.projectile.exploded) {
          this.projectile.projectileSprite.y -=
            (this.config.projectileConfig.speed * delta) / 1000;
        }
      } else if (!this._resetting) {
        this.reset();
      }
    }

    this.projectile.update(delta);

    this.guideArrow.container.position = this.pivot;
    this.guideArrow.container.pivot.y = this.pivot.y + this.GUIDE_ARROW_LENGTH;
    this.guideArrow.container.rotation = this.rotation;

    this.guideArrow.update(delta);
  }

  private fire() {
    if (!this._fired) {
      this._fired = true;
      this.projectile.setRotation(true, this.rotation >= 0 ? "ltr" : "rtl");
      this.fireCannonTween.restart();
      this.fireEffectTween.start();
      this.sounds?.fire.play();
    }
  }

  reset() {
    this._resetting = true;
    this._fired = false;
    this._interaction = false;

    this.projectile.projectileSprite.y = this.config.projectileSpawnDepth;
    this.projectile.reset();
    this.projectile.container.visible = false;

    this.resetProjectileTween.onComplete(() => {
      this._interaction = true;
      this._resetting = false;
    });
    this.resetCannonTween
      .onComplete(() => {
        this.projectile.container.visible = true;
        this.willFire = false;
        this.sounds?.reload.play();
      })
      .restart();
  }

  private bindedOnDragStart = this.onDragStart.bind(this);
  private bindedOnDragMove = this.onDragMove.bind(this);
  private bindedOnDragEnd = this.onDragEnd.bind(this);
  private startPos = new Point(0, 0);
  private willRotate = false;
  private willFire = false;

  private addInteraction() {
    if (this.interactionContainer) {
      this.interactionContainer.on("pointerdown", this.bindedOnDragStart);
      this.interactionContainer.on("pointerup", this.bindedOnDragEnd);
      this.interactionContainer.on("pointerupoutside", this.bindedOnDragEnd);
    }
  }

  private onDragStart(e: FederatedPointerEvent) {
    if (this._interaction && this.interactionContainer) {
      if (this.onInteraction?.() ?? true) {
        this.startPos = this.container.toLocal(e.global);

        this.bindedOnDragMove(e);
        this.interactionContainer.on("pointermove", this.bindedOnDragMove);
      }
    }
  }

  private onDragMove(e: FederatedPointerEvent) {
    if (this._interaction) {
      const mousePos = this.container.toLocal(e.global);

      if (mousePos.y > this.pivot.y) {
        // if mouse only moves under the pivot, don't do anything
        if (!this.willRotate && this.startPos.y > this.pivot.y) {
          this.willRotate = false;
        }
        this.willFire = false;
      } else {
        this.willRotate = true;
        this.willFire = true;
      }

      if (this.willRotate) {
        const { x: x1, y: y1 } = this.pivot;
        let { x: x2, y: y2 } = mousePos;

        // reverse the mouse y position if it's below the pivot
        if (y1 < y2) {
          y2 = y1 - (y2 - y1);
        }

        let newRotation = -Math.atan((x2 - x1) / (y2 - y1));
        if (Math.abs(newRotation) >= this.config.angleLimit) {
          newRotation = this.config.angleLimit * Math.sign(newRotation);
        }

        this.rotation = newRotation;
      }

      if (!this._fired) {
        if (this.willFire) {
          if (!this._guideArrowShown) {
            this._guideArrowShown = true;
            this._guideArrowHidden = false;
            this.guideArrowTween
              .from({ alpha: this.guideArrowFilter.alpha })
              .to({ alpha: this.GUIDE_ARROW_APPEAR_ALPHA })
              .start();
          }
        } else if (!this._guideArrowHidden) {
          this._guideArrowShown = false;
          this._guideArrowHidden = true;
          this.guideArrowTween
            .from({ alpha: this.guideArrowFilter.alpha })
            .to({ alpha: 0 })
            .start();
        }
      }
    }
  }

  private onDragEnd() {
    if (this._interaction && this.interactionContainer) {
      this.willRotate = false;
      this.interactionContainer.off("pointermove", this.bindedOnDragMove);

      this._guideArrowShown = false;
      this._guideArrowHidden = false;
      this.guideArrowTween.stop();
      this.guideArrowFilter.alpha = 0;

      if (this.willFire) this.fire();
    }
  }
}

export default Cannon;
