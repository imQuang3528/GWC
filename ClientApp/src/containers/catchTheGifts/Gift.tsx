import { Resource, Texture, Graphics as PixiGraphics } from "pixi.js-legacy";
import { useCallback, useContext } from "react";
import { GameContext } from "./GameContainer";
import { Graphics, Sprite, _ReactPixi } from "@pixi/react";

export interface GiftProps extends _ReactPixi.ISprite {
  type: "good" | "bad";
  texture: Texture<Resource>;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

const GIFT_ANCHOR = { x: 0.5, y: 0.5 };

function Gift({ type, x, y, width, height, alpha, ...rest }: GiftProps) {
  const { s } = useContext(GameContext);

  return (
    <>
      <Graphics
        draw={useCallback(
          (g: PixiGraphics) => {
            g.clear();
            g.beginFill(type === "good" ? "#01913c" : "#e72029");
            g.drawCircle(
              s(width * GIFT_ANCHOR.x),
              s(height * GIFT_ANCHOR.y),
              s(Math.max(width, height) + 30) / 2
            );
            g.endFill();
          },
          [height, s, type, width]
        )}
        x={s(x)}
        y={s(y)}
        alpha={(alpha || 1) * 0.3}
      />
      <Sprite
        anchor={GIFT_ANCHOR}
        x={s(x + width * GIFT_ANCHOR.x)}
        y={s(y + height * GIFT_ANCHOR.y)}
        width={s(width)}
        height={s(height)}
        alpha={alpha}
        {...rest}
      />
    </>
  );
}

export default Gift;
