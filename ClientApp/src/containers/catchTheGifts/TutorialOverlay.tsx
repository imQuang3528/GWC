import { Resource, Texture, Graphics as PixiGraphics } from "pixi.js-legacy";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "./GameContainer";
import { Container, Graphics } from "@pixi/react";
import AutosizeSprite from "./helper/AutosizeSprite";
import { Easing, Tween } from "tweedle.js";

export interface TutorialOverlayProps {
  texture: Texture<Resource>;
  tutorialInterval: number; // s
  // All raw numbers, not normalized numbers
  bag: {
    x: number;
    y: number;
    width: number;
    height: number;
    horizontalPadding: number;
  };
  onRequestOffset?: (xOffset: number) => void;
}

const HAND_WIDTH = 70;

function TutorialOverlay({
  texture,
  tutorialInterval,
  bag,
  onRequestOffset,
}: TutorialOverlayProps) {
  const { s, mainScreen } = useContext(GameContext);
  const [directionOverlayAlpha, setDirectionOverlayAlpha] = useState(0);
  const [handStyle, setHandStyle] = useState<{
    offsetY?: number;
    alpha?: number;
    scale?: number;
  }>({ alpha: 0 });
  const tweens = useRef<
    | {
        handVisibilityTween: Tween<{ offsetY: number; alpha: number }>;
        handInteractingTween: Tween<{ scale: number; overlayAlpha: number }>;
        leftSideMoveTween: Tween<{ x: number }>;
        rightSideMoveTween: Tween<{ x: number }>;
      }
    | undefined
  >();

  const fullScale = HAND_WIDTH / texture.width;

  const runStartEndAnimation = useCallback(
    (mode: "start" | "end", onComplete?: () => void) => {
      if (!tweens.current) {
        onComplete?.();
        return;
      }

      const { handVisibilityTween, handInteractingTween } = tweens.current;

      const [point1, point2] =
        mode === "start"
          ? (["from", "to"] as const)
          : (["to", "from"] as const);

      handVisibilityTween[point1]({ offsetY: 20, alpha: 0 })
        [point2]({ offsetY: 0, alpha: 1 })
        .duration(300)
        .easing(Easing.Cubic[mode === "start" ? "Out" : "In"])
        .onUpdate(val => setHandStyle({ ...val }));
      handInteractingTween[point1]({ scale: fullScale, overlayAlpha: 0 })
        [point2]({ scale: fullScale * 0.9, overlayAlpha: 0.7 })
        .duration(500)
        .easing(Easing.Back.InOut)
        .onUpdate(val => {
          setHandStyle(pre => ({ ...pre, scale: val.scale }));
          setDirectionOverlayAlpha(val.overlayAlpha);
        });

      if (mode === "start") {
        handInteractingTween.chain();
        handVisibilityTween.chain(handInteractingTween).start();
      } else {
        handVisibilityTween.chain();
        handInteractingTween.chain(handVisibilityTween).start();
      }

      if (onComplete) {
        const lastTween =
          mode === "start" ? handInteractingTween : handVisibilityTween;
        lastTween.onComplete(() => {
          lastTween.onComplete(() => {});
          onComplete();
        });
      }
    },
    [fullScale]
  );

  const runTutorialAnimation = useCallback(
    (onComplete?: () => void) => {
      if (!tweens.current) {
        onComplete?.();
        return;
      }

      const { leftSideMoveTween, rightSideMoveTween } = tweens.current;

      leftSideMoveTween
        .to({
          x: s((mainScreen.width - bag.width) / 2 - bag.horizontalPadding),
        })
        .duration(800)
        .easing(Easing.Quadratic.InOut)
        .yoyo(true)
        .yoyoEasing(Easing.Cubic.In)
        .repeat(1)
        .reset();
      rightSideMoveTween
        .to({
          x: -s((mainScreen.width - bag.width) / 2 - bag.horizontalPadding),
        })
        .duration(800)
        .yoyo(true)
        .easing(Easing.Cubic.Out)
        .yoyoEasing(Easing.Quadratic.InOut)
        .repeat(1)
        .reset();

      runStartEndAnimation("start", () => {
        const handleComplete = () => {
          rightSideMoveTween.onComplete(() => {});
          runStartEndAnimation("end", onComplete);
        };

        if (onRequestOffset) {
          let lastX = 0;
          const handleUpdate = ({ x }: { x: number }) => {
            onRequestOffset?.(x - lastX);
            lastX = x;
          };

          leftSideMoveTween.onUpdate(handleUpdate);
          rightSideMoveTween.onUpdate(handleUpdate);

          leftSideMoveTween.chain(rightSideMoveTween).start(200);
          rightSideMoveTween.onComplete(handleComplete);
        } else {
          handleComplete();
        }
      });
    },
    [
      bag.horizontalPadding,
      bag.width,
      mainScreen.width,
      onRequestOffset,
      runStartEndAnimation,
      s,
    ]
  );

  useEffect(() => {
    let timeout: NodeJS.Timer;
    const allTweens = {
      handVisibilityTween: new Tween({ offsetY: 0, alpha: 0 }),
      handInteractingTween: new Tween({ scale: 1, overlayAlpha: 0 }),
      leftSideMoveTween: new Tween({ x: 0 }),
      rightSideMoveTween: new Tween({ x: 0 }),
    };
    tweens.current = allTweens;

    const run = () => {
      timeout = setTimeout(() => {
        runTutorialAnimation(run);
      }, tutorialInterval * 1000);
    };
    run();

    return () => {
      timeout && clearTimeout(timeout);
      for (const tween of Object.values(allTweens)) {
        tween.stop();
      }
    };
  }, [runTutorialAnimation, tutorialInterval]);

  const drawArrow = useCallback((g: PixiGraphics) => {
    const factor = 0.5;
    g.clear()
      .beginFill("#cbebca")
      .moveTo(0 * factor, 40 * factor)
      .bezierCurveTo(
        60 * factor,
        6 * factor,
        120 * factor,
        12 * factor,
        120 * factor,
        20 * factor
      )
      .lineTo(110 * factor, 50 * factor)
      .bezierCurveTo(
        130 * factor,
        32 * factor,
        150 * factor,
        14 * factor,
        180 * factor,
        0 * factor
      )
      .bezierCurveTo(
        150 * factor,
        -14 * factor,
        130 * factor,
        -32 * factor,
        110 * factor,
        -50 * factor
      )
      .lineTo(120 * factor, -20 * factor)
      .bezierCurveTo(
        120 * factor,
        -12 * factor,
        60 * factor,
        -6 * factor,
        0 * factor,
        -40 * factor
      )
      .bezierCurveTo(
        15 * factor,
        0 * factor,
        15 * factor,
        0 * factor,
        0 * factor,
        40 * factor
      )
      .endFill();
  }, []);

  const x = bag.x + bag.width / 2;
  const y = bag.y + bag.height / 2;

  return (
    <Container interactiveChildren={false}>
      <Container alpha={directionOverlayAlpha}>
        <Graphics draw={drawArrow} cacheAsBitmap x={x + 25} y={y} />
        <Graphics
          draw={drawArrow}
          cacheAsBitmap
          x={x - 25}
          y={y}
          pivot={[0, 0.5]}
          angle={180}
        />
        <Graphics
          draw={useCallback((g: PixiGraphics) => {
            g.clear().beginFill("#cbebca").drawCircle(0, 0, 20).endFill();
          }, [])}
          cacheAsBitmap
          x={x}
          y={y}
        />
      </Container>

      <AutosizeSprite
        texture={texture}
        scale={fullScale}
        angle={-45}
        x={x}
        y={y + (handStyle.offsetY || 0)}
        anchor={[0.5, 0.05]}
        {...handStyle}
      />
    </Container>
  );
}

export default TutorialOverlay;
