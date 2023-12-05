import { Rectangle } from "pixi.js-legacy";

export function degToRad(deg: number) {
  return deg * (Math.PI / 180);
}

export function inBound(containerBounds: Rectangle, objBounds: Rectangle) {
  return (
    objBounds.left <= containerBounds.right &&
    objBounds.right >= containerBounds.left &&
    objBounds.top <= containerBounds.bottom &&
    objBounds.bottom >= containerBounds.top
  );
}
