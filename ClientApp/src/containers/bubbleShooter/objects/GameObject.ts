import {
  Color,
  Container,
  DisplayObject,
  Rectangle,
  Resource,
  Sprite,
  Texture,
} from "pixi.js-legacy";

export type Drawable = Texture<Resource> | Color;

class GameObject {
  public readonly container: Container;
  public readonly backgroundSprite: Sprite;
  public bounds?: Rectangle;

  constructor(container: Container, bounds?: Rectangle, background?: Drawable);
  constructor(bounds?: Rectangle, background?: Drawable);
  constructor(
    containerOrBounds?: Container | Rectangle,
    boundsOrBackground?: Rectangle | Drawable,
    background?: Drawable
  ) {
    let container: Container, bounds: Rectangle, trueBackground: Drawable;

    if (containerOrBounds instanceof Container) {
      container = containerOrBounds;
      bounds = boundsOrBackground as Rectangle;
      trueBackground = background as Drawable;
    } else {
      container = new Container();
      bounds = containerOrBounds as Rectangle;
      trueBackground = boundsOrBackground as Drawable;
    }

    this.container = container;
    this.bounds = bounds;

    if (trueBackground instanceof Color) {
      this.backgroundSprite = new Sprite(Texture.WHITE);
      this.backgroundSprite.tint = trueBackground;
    } else {
      this.backgroundSprite = new Sprite(trueBackground);
    }

    this.addChild(this.backgroundSprite);
  }

  // Setup the game object (should run only once)
  setup() {}

  // Update the game object (run every tick)
  update(delta: number) {
    if (this.bounds) {
      this.container.x = this.bounds.x;
      this.container.y = this.bounds.y;
    }

    if (this.backgroundSprite.texture) {
      this.backgroundSprite.x = 0;
      this.backgroundSprite.y = 0;
      this.backgroundSprite.width = this.bounds?.width || 0;
      this.backgroundSprite.height = this.bounds?.height || 0;
    }
  }

  // Convinience shortcut method
  addChild<T extends DisplayObject | GameObject = DisplayObject | GameObject>(
    ...children: (T | T[])[]
  ) {
    for (const child of children) {
      const subChildren = Array.isArray(child) ? child : [child];

      for (const subChild of subChildren) {
        if (subChild instanceof DisplayObject) {
          this.container.addChild(subChild);
        } else {
          this.container.addChild(subChild.container);
        }
      }
    }

    return Array.isArray(children[0]) ? children[0][0] : children[0];
  }
}

export default GameObject;
