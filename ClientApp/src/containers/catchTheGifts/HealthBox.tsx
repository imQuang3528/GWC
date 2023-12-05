import { Container, Sprite, _ReactPixi } from "@pixi/react";
import { Texture, Resource } from "pixi.js-legacy";
import { useContext } from "react";
import { GameContext } from "./GameContainer";

export type HeartTextures = {
  empty: Texture<Resource>;
  full: Texture<Resource>;
};

export interface InfoBoxProps extends _ReactPixi.IContainer {
  maxHealth: number;
  health: number;
  heartTextures: HeartTextures;
}

const HEART_SIZE = 50;
const HEART_GAP = 10;

function HealthBox({
  maxHealth,
  health,
  heartTextures,
  ...origRest
}: InfoBoxProps) {
  const { s } = useContext(GameContext);
  const rest = s.all(origRest);
  const { width } = rest;
  const heartSize = s(HEART_SIZE);
  const heartGap = s(HEART_GAP);

  const horizontalPadding =
    width === undefined
      ? 0
      : (width - (heartSize * maxHealth + heartGap * (maxHealth - 1))) / 2;

  return (
    <Container {...rest}>
      {Array(maxHealth)
        .fill(undefined)
        .map((_, i) => (
          <Sprite
            key={i}
            texture={heartTextures[i < health ? "full" : "empty"]}
            width={heartSize}
            height={heartSize}
            x={i * (heartSize + heartGap) + horizontalPadding}
          />
        ))}
    </Container>
  );
}

export default HealthBox;
