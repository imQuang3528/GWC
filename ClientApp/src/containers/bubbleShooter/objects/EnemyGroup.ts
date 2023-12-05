import { Rectangle } from "pixi.js-legacy";
import RandomPick from "../utils/helpers/RandomPick";
import Enemy, { EnemyConfig } from "./Enemy";
import GameObject from "./GameObject";

type EnemyGroupConfig = {
  maxQuantity: number;
  speedRange: RandomPick<number>;
  spawnDelayRange: RandomPick<number>;
  row: number;
  rowGap: number;
  initialDelay?: number;
} & EnemyConfig;

class EnemyGroup extends GameObject {
  public readonly enemies: Enemy[] = [];
  private delayTick = 0;
  private directionRange = new RandomPick<(-1 | 1)[]>([-1, 1]);
  private rowRange = new RandomPick<number[]>([]);

  constructor(
    public bounds: Rectangle,
    private textures: Enemy["textures"],
    protected config: EnemyGroupConfig
  ) {
    super(bounds);
  }

  setup(): void {
    super.setup();

    for (let i = 0; i < this.config.row; i++) {
      this.rowRange.array.push(
        i * (this.config.diameter + this.config.rowGap) + this.config.rowGap
      );
    }

    this.enemies.length = 0;
    for (let i = 0; i < this.config.maxQuantity; i++) {
      const enemy = new Enemy(this.textures, this.config);
      enemy.onFallingFinish = () => this.resetEnemy(enemy);
      this.resetEnemy(enemy);
      enemy.setup();

      this.enemies.push(enemy);
    }

    this.addChild(this.enemies);
  }

  update(delta: number): void {
    super.update(delta);

    let start = true;
    if (this.delayTick < (this.config.initialDelay || 0)) {
      this.delayTick += delta / 1000;
      start = false;
    }

    this.enemies.forEach(enemy => {
      enemy.container.visible = start;

      if (start) {
        const enemyBounds = enemy.bodySprite.getBounds();

        if (
          enemy.direction === 1
            ? enemyBounds.left > this.bounds.right
            : enemyBounds.right < this.bounds.left
        ) {
          this.resetEnemy(enemy);
        }

        enemy.update(delta);
      }
    });
  }

  private resetEnemy(enemy: Enemy) {
    const speed = this.config.speedRange.getRandom();
    const delay = this.config.spawnDelayRange.getRandom();
    const direction = this.directionRange.getRandom();
    const startX =
      -direction * (speed * delay + enemy.config.diameter / 2) +
      (direction === 1 ? 0 : this.bounds.right);
    const row = this.rowRange.getRandom();

    enemy.reset();
    enemy.speed = speed;
    enemy.direction = direction;
    enemy.container.x = startX;
    enemy.container.y = row;
  }
}

export default EnemyGroup;
