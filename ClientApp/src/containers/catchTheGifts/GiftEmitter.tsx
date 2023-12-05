import { Container, useTick } from "@pixi/react";
import { Texture, Resource, Ticker } from "pixi.js-legacy";
import { useContext, useMemo, useRef } from "react";
import Gift, { GiftProps } from "./Gift";
import { getRandomChoose, getRandomFloat } from "../../utils/random";
import { GameContext } from "./GameContainer";

export type GiftTextures = {
  [key: string]: Texture<Resource>[];
};

export interface GiftData extends GiftProps {
  value: number;
}

export interface GiftEmitterProps {
  gifts: GiftData[];
  onGiftsUpdated: (gifts: GiftData[]) => void;
  giftTextures: GiftTextures;
  maxSize: number;
  maxRandomAngle: number;
  emitRate: number; // gift/s
  fallingSpeed: number; // px/s
  doubleEmitChance: number;
  escapeGap: number; // px
  horizontalPadding?: number; // px
  zIndex?: number;
}

function GiftEmitter({
  gifts,
  onGiftsUpdated,
  giftTextures,
  maxSize,
  maxRandomAngle,
  emitRate,
  fallingSpeed,
  doubleEmitChance,
  escapeGap,
  horizontalPadding = 0,
  zIndex,
}: GiftEmitterProps) {
  const { state, mainScreen } = useContext(GameContext);
  const lastEmitTime = useRef(-emitRate * 1000);
  const elapsed = useRef(0);

  const giftData = useMemo(
    () =>
      Object.entries(giftTextures).map(([key, textures]) => {
        const [value, weight] = key.split("_").map(Number);
        return {
          textures,
          value,
          weight,
        };
      }),
    [giftTextures]
  );

  function createGift(emitTimeDeltaOvershoot: number = 0): GiftData {
    const totalWeight = giftData
      .map(data => data.weight)
      .reduce((sum, weight) => sum + weight, 0);
    const typeWeight = getRandomFloat(totalWeight);

    let chosenGiftData;
    let accumulateWeight = 0,
      i = 0;
    while (true) {
      const lastAccumulateWeight = accumulateWeight;
      accumulateWeight += giftData[i].weight;

      if (typeWeight >= lastAccumulateWeight && typeWeight < accumulateWeight) {
        chosenGiftData = giftData[i];
        break;
      }

      i++;
    }

    const texture = getRandomChoose(chosenGiftData.textures);
    const angle = getRandomFloat(-maxRandomAngle, maxRandomAngle);

    const [width, height] =
      texture.width > texture.height
        ? [maxSize, (maxSize / texture.width) * texture.height]
        : [(maxSize / texture.height) * texture.width, maxSize];

    return {
      value: chosenGiftData.value,
      type: chosenGiftData.value >= 0 ? "good" : "bad",
      texture,
      angle,
      alpha: 0,
      width,
      height,
      x: getRandomFloat(
        horizontalPadding,
        mainScreen.width - width - horizontalPadding
      ),
      y:
        -maxSize / 2 -
        getRandomFloat(height) +
        (fallingSpeed * emitTimeDeltaOvershoot) / 1000,
    };
  }

  useTick(tick => {
    const delta = tick / Ticker.targetFPMS;
    const newGifts = [...gifts];

    // Filter overbound gifts
    while (newGifts[0]?.y >= mainScreen.height) {
      newGifts.shift();
    }

    // Create new gifts
    const emitTimeDeltaOvershoot =
      elapsed.current - lastEmitTime.current - emitRate * 1000;

    if (emitTimeDeltaOvershoot >= 0) {
      const newGift1 = createGift(emitTimeDeltaOvershoot);
      newGifts.push(newGift1);

      if (Math.random() < doubleEmitChance) {
        let tries = 0;
        while (tries < 10) {
          const newGift2 = createGift(emitTimeDeltaOvershoot);
          const [leftGift, rightGift] =
            newGift2.x > newGift1.x
              ? [newGift1, newGift2]
              : [newGift2, newGift1];

          if (
            [
              leftGift.x - horizontalPadding,
              rightGift.x - (leftGift.x + maxSize),
              mainScreen.width -
                maxSize -
                horizontalPadding -
                (rightGift.x + maxSize),
            ].some(gap => Math.abs(gap) >= escapeGap) &&
            Math.hypot(leftGift.x - rightGift.x, leftGift.y - rightGift.y) >=
              100
          ) {
            newGifts.push(newGift2);
            break;
          }

          tries++;
        }
      }

      lastEmitTime.current = elapsed.current - emitTimeDeltaOvershoot;
    }

    // Update the gifts
    newGifts.forEach(gift => {
      gift.alpha =
        gift.y < 0 ? (gift.alpha || 0) + (fallingSpeed * delta) / 1000 / 50 : 1;

      gift.y += (fallingSpeed * delta) / 1000;
    });

    onGiftsUpdated(newGifts);

    elapsed.current += delta;
  }, state === "PLAYING");

  return (
    <Container interactiveChildren={false} zIndex={zIndex}>
      {gifts.map((gift, i) => (
        <Gift key={i} {...gift} />
      ))}
    </Container>
  );
}

export default GiftEmitter;
