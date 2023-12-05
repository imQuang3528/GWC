import cannonFireSound from "../assets/sounds/cannon_fire.mp3";
import cannonReloadSound from "../assets/sounds/cannon_reload.mp3";
import projectileExplodeSound from "../assets/sounds/projectile_explode.mp3";
import backgroundImg from "../assets/textures/background.png";
import ball1Img from "../assets/textures/ball1.png";
import ball2Img from "../assets/textures/ball2.png";
import ball3Img from "../assets/textures/ball3.png";
import ball4Img from "../assets/textures/ball4.png";
import projectileImg from "../assets/textures/bullet.png";
import cannonBackImg from "../assets/textures/cannon_back.png";
import cannonFrontImg from "../assets/textures/cannon_front.png";
import cannonWheelImg from "../assets/textures/cannon_wheel.png";
import cloud1Img from "../assets/textures/cloud1.png";
import cloud2Img from "../assets/textures/cloud2.png";
import cloud3Img from "../assets/textures/cloud3.png";
import cloud4Img from "../assets/textures/cloud4.png";
import sparkImg from "../assets/textures/spark.png";

export const TEXTURES = {
  background: backgroundImg,
  ball1: ball1Img,
  ball2: ball2Img,
  ball3: ball3Img,
  ball4: ball4Img,
  projectile: projectileImg,
  cannonBack: cannonBackImg,
  cannonFront: cannonFrontImg,
  cannonWheel: cannonWheelImg,
  cloud1: cloud1Img,
  cloud2: cloud2Img,
  cloud3: cloud3Img,
  cloud4: cloud4Img,
  spark: sparkImg,
} as const;

export const SOUNDS = {
  cannonFire: cannonFireSound,
  projectileExplode: projectileExplodeSound,
  cannonReload: cannonReloadSound,
} as const;

export const FONT_FAMILIES = {
  tiltWarp: "Tilt Warp",
};
