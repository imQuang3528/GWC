import { Sprite as SpriteRef, Texture } from "pixi.js-legacy";
import { Sprite, _ReactPixi } from "@pixi/react";
import { forwardRef } from "react";
import { Layout, PSprite } from "./AutoscaleLayoutable";

const AutosizeSprite = forwardRef<SpriteRef, _ReactPixi.ISprite>(
  ({ texture, width, height, ...rest }, ref) => {
    return (
      <Sprite
        ref={ref}
        texture={texture}
        {...getAutosize({ texture, width, height })}
        {...rest}
      />
    );
  }
);

export const PAutosizeSprite = forwardRef<
  SpriteRef,
  _ReactPixi.ISprite & Layout
>(({ texture, width, height, ...rest }, ref) => {
  return (
    <PSprite
      ref={ref}
      texture={texture}
      {...getAutosize({ texture, width, height })}
      {...rest}
    />
  );
});

export default AutosizeSprite;

export function getAutosize({
  texture,
  width,
  height,
}: {
  texture?: Texture;
  width?: number;
  height?: number;
}) {
  const res: { texture?: Texture; width?: number; height?: number } = {};
  let realWidth = width,
    realHeight = height;

  if (texture) {
    if (width === undefined && height !== undefined) {
      realWidth = (texture.width * height) / texture.height;
    }

    if (height === undefined && width !== undefined) {
      realHeight = (texture.height * width) / texture.width;
    }
  }

  if (texture !== undefined) res.texture = texture;
  if (realWidth !== undefined) res.width = realWidth;
  if (realHeight !== undefined) res.height = realHeight;

  return res;
}
