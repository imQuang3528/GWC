import { Point, Rectangle } from "pixi.js-legacy";
import Enemy from "./Enemy";
import Projectile from "./Projectile";

class ProjectileCollisionHandler {
  constructor(
    public bounds: Rectangle,
    public projectile: Projectile,
    public enemies: Enemy[]
  ) {}

  public onCollide?: () => void;

  update() {
    if (!this.projectile.exploded) {
      const projectilePos =
        this.projectile.projectileSprite.getGlobalPosition();

      // if (inBound(this.bounds, projectileBounds)) {
      for (const enemy of this.enemies) {
        if (!enemy.hit) {
          const enemyPos = enemy.bodySprite.getGlobalPosition();

          // if (inBound(this.bounds, enemyBounds)) {
          // Assuming that the projectile and the enemies are circles
          const r1 = this.projectile.config.diameter / 2;
          const { x: x1, y: y1 } = projectilePos;
          const r2 = enemy.config.diameter / 2;
          const { x: x2, y: y2 } = enemyPos;

          const isCollided =
            Math.abs((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) <
            (r1 + r2) * (r1 + r2);

          if (isCollided) {
            const collidedPoint = new Point((x1 + x2) / 2, (y1 + y2) / 2);

            this.projectile.setExplode(true, collidedPoint);
            enemy.setHit(true, collidedPoint);
            this.onCollide?.();

            break;
          }
        }
      }
      //   }
      // }
    }
  }
}

export default ProjectileCollisionHandler;
