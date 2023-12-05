import { useEffect, useState } from "react";
import { TilingSprite, _ReactPixi } from "@pixi/react";
import { Easing, Tween } from "tweedle.js";

export type BackgroundProps = Omit<_ReactPixi.ITilingSprite, "tilePosition">;

function Background({ texture, ...rest }: BackgroundProps) {
  const [tilePosition, setTilePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const movingTween = new Tween({ x: 0, y: 0 })
      .easing(Easing.Linear.None)
      .duration(20000)
      .repeat(Infinity)
      .to({ x: texture?.width, y: texture?.height })
      .onUpdate(val => {
        setTilePosition({ ...val });
      })
      .start();

    return () => {
      movingTween.stop();
    };
  }, [texture?.height, texture?.width]);

  return (
    <TilingSprite texture={texture} tilePosition={tilePosition} {...rest} />
  );
}

export default Background;
