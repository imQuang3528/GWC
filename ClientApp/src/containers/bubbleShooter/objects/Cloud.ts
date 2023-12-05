import { Point, Resource, Texture } from "pixi.js-legacy";
import RandomPick from "../utils/helpers/RandomPick";
import GameObject from "./GameObject";

class Cloud extends GameObject {
  private ratio = 1;
  private speed = 0;
  private size = 1;

  constructor(
    public textures: RandomPick<Texture<Resource>[]>,
    public spawnRange: RandomPick<Point>,
    public speedRange: RandomPick<number>,
    public sizeRange: RandomPick<number>
  ) {
    super();
  }

  setup(): void {
    super.setup();
    this.reset();
  }

  reset() {
    this.backgroundSprite.texture = this.textures.getRandom();
    this.container.position = this.spawnRange.getRandom();
    this.speed = this.speedRange.getRandom();
    this.size = this.sizeRange.getRandom();
    this.ratio =
      this.backgroundSprite.texture.height /
      this.backgroundSprite.texture.width;
  }

  update(delta: number): void {
    super.update(delta);

    this.backgroundSprite.width = this.size;
    this.backgroundSprite.height = this.size * this.ratio;

    this.container.x += (this.speed * delta) / 1000;
  }
}

export default Cloud;
