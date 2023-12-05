import { Point, Rectangle } from "pixi.js-legacy";
import RandomPick from "../utils/helpers/RandomPick";
import Cloud from "./Cloud";
import GameObject, { Drawable } from "./GameObject";

type CloudConfig = {
  quantity: number;
} & Pick<Cloud, "textures" | "speedRange" | "sizeRange">;

class Background extends GameObject {
  public readonly clouds: Cloud[] = [];
  private maxCloudWidth = 0;

  constructor(
    public bounds: Rectangle,
    public background?: Drawable,
    protected cloudConfig?: CloudConfig
  ) {
    super(bounds, background);
  }

  setup(): void {
    super.setup();

    if (this.cloudConfig) {
      this.maxCloudWidth = this.cloudConfig.sizeRange.end;

      // spawn clouds on screen
      const initSpawnRange = new RandomPick(
        new Point(-this.bounds.width / 3, 0),
        new Point(this.bounds.width, this.bounds.height / 3)
      );

      this.clouds.length = 0;
      for (let i = 0; i < this.cloudConfig.quantity; i++) {
        const cloud = new Cloud(
          this.cloudConfig.textures,
          initSpawnRange,
          this.cloudConfig.speedRange,
          this.cloudConfig.sizeRange
        );
        cloud.setup();

        this.clouds.push(cloud);
      }

      this.addChild(this.clouds);
    }
  }

  update(delta: number): void {
    super.update(delta);

    this.clouds.forEach(cloud => {
      if (cloud.container.x > this.bounds.width) {
        // spawn clouds from outside left of the background
        if (cloud.spawnRange.start && cloud.spawnRange.end) {
          cloud.spawnRange.start.x =
            -this.bounds.width / 2 - this.maxCloudWidth;
          cloud.spawnRange.end.x = -this.maxCloudWidth;
        }
        cloud.reset();
      }

      cloud.update(delta);
    });
  }
}

export default Background;
