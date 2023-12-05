import { Color } from "pixi.js-legacy";
import RandomPick from "../utils/helpers/RandomPick";
import { degToRad } from "../utils/helpers/helpers";

export const CLOUD_CONFIG = {
  quantity: 10,
  sizeRange: new RandomPick(70, 200), // px
  speedRange: new RandomPick(12, 120), // px/s
};

export const CANNON_CONFIG = {
  cannonWidth: 85, // px
  cannonHeight: 110, // px
  wheelDiameter: 55, // px
  angleLimit: degToRad(50), // rad

  cannonFirePushBackLength: 50, // px
  cannonFirePushBackDuration: 0.3, // s
  cannonFireEffectScale: 1.6,
  cannonFireEffectDuration: 0.6, // s

  resetCannonDuration: 0.5, // s
  resetProjectileDuration: 0.3, // s
  projectileSpawnDepth: 50, // px
};

export const PROJECTILE_CONFIG = {
  diameter: 59, // px
  speed: 900, // px/s
  rotationSpeed: degToRad(900), // rad/s
  explosionDuration: 0.5, // s
  explosionMaxScale: 4,
};

export const ENEMY_CONFIG = {
  diameter: 60, // px
  floatingDelta: 35, // px
  floatingDurationSpeedRatio: 280,
  floatingDurationNoise: new RandomPick(0, 0.6), // %
  speedRange: new RandomPick(250, 600), // px/s
  spawnDelayRange: new RandomPick(2, 7), // px/s
  maxQuantity: 8,
  row: 3,
  rowGap: 40, // px

  fallingDuration: 1.5, //s
  fallingPeak: 300, // px
  fallingDrift: 50, // px
};

export const GROUND_COLOR = new Color("#929aa0");
