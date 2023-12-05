import { Sprite, Text, useApp } from "@pixi/react";
import {
  Resource,
  Texture,
  FederatedPointerEvent,
  TextStyle,
} from "pixi.js-legacy";
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { GameContext } from "./GameContainer";
import { Easing, Group, Tween } from "tweedle.js";
import TutorialOverlay from "./TutorialOverlay";

type BagTextures = {
  front: Texture<Resource>;
  back: Texture<Resource>;
};

export interface BagProps {
  x: number;
  y: number;
  onXOffset: (offsetXChange: number) => void;
  textures: BagTextures;
  width: number;
  height: number;
  horizontalPadding: number;
  middleZIndex: number; // zIndex of the middle layer
  enableTutorial?: boolean;
  tutorialPointer?: Texture<Resource>;
  haveUserUnderstood?: boolean;
  onMaybeUserHaveUnderstoodHowToPlayTheGame?: () => void;
}

export interface BagRef {
  showScoreGain: (scoreGain: number) => void;
}

const Bag = forwardRef<BagRef, BagProps>(
  (
    {
      onXOffset,
      textures,
      middleZIndex,
      enableTutorial,
      tutorialPointer,
      haveUserUnderstood,
      onMaybeUserHaveUnderstoodHowToPlayTheGame,
      ...origRest
    },
    ref
  ) => {
    const app = useApp();
    const { screen, stage } = app;
    const { s, mainScreen, fontFamily } = useContext(GameContext);
    const movementRef = useRef<{
      pressed: boolean;
      data?: FederatedPointerEvent;
      lastX: number;
      offsetX: number;
    }>({ pressed: false, lastX: 0, offsetX: 0 });

    const {
      x,
      y,
      width,
      height = (s(origRest.width) * textures.back.height) / textures.back.width,
      ...rest
    } = s.all(origRest);
    const horizontalPadding = s(rest.horizontalPadding);

    useEffect(() => {
      const handlePointerup = () => {
        movementRef.current.pressed = false;
      };
      const handlePointermove = () => {
        if (movementRef.current.pressed && movementRef.current.data) {
          let pointerX = movementRef.current.data.globalX;
          const leftLimit =
            s(mainScreen.left) +
            horizontalPadding +
            movementRef.current.offsetX;
          const rightLimit =
            s(mainScreen.right) -
            horizontalPadding -
            (width - movementRef.current.offsetX);

          if (movementRef.current.data.globalX < leftLimit) {
            pointerX = leftLimit;
          }

          if (movementRef.current.data.globalX > rightLimit) {
            pointerX = rightLimit;
          }

          onXOffset((pointerX - movementRef.current.lastX) / s(1));
          movementRef.current.lastX = pointerX;
        }
      };
      const handlePointerleave = () => {
        movementRef.current.pressed = false;
      };

      stage.eventMode = "static";
      stage.hitArea = screen;
      stage.on("pointerup", handlePointerup);
      stage.on("pointerupoutside", handlePointerup);
      stage.on("pointermove", handlePointermove);
      stage.on("pointerleave", handlePointerleave);

      return () => {
        stage.off("pointerup", handlePointerup);
        stage.off("pointerupoutside", handlePointerup);
        stage.off("pointermove", handlePointermove);
        stage.off("pointerleave", handlePointerleave);
      };
    }, [
      mainScreen.left,
      mainScreen.right,
      mainScreen.x,
      horizontalPadding,
      onXOffset,
      s,
      screen,
      stage,
      width,
    ]);

    const handlePointerdown = (e: FederatedPointerEvent) => {
      movementRef.current.offsetX = e.globalX - s(mainScreen.x) - x;
      movementRef.current.lastX = e.globalX;
      movementRef.current.data = e;
      movementRef.current.pressed = true;

      if (enableTutorial && !haveUserUnderstood) {
        onMaybeUserHaveUnderstoodHowToPlayTheGame?.();
      }
    };

    // Score Gain
    const [scoreGain, setScoreGain] = useState<number>();
    const [scoreGainStyle, setScoreGainStyle] = useState({
      y: y + height / 3,
      alpha: 0,
    });
    const scoreGainAppearTween = useRef<Tween<{ y: number; alpha: number }>>();
    const scoreGainFadeOutTween = useRef<Tween<{ alpha: number }>>();

    useEffect(() => {
      setScoreGainStyle({ y: y + height / 3, alpha: 0 });

      const fadeOutTween = new Tween({ alpha: 1 })
        .to({ alpha: 0 })
        .easing(Easing.Exponential.Out)
        .duration(300)
        .onUpdate(({ alpha }) => {
          setScoreGainStyle(pre => ({ ...pre, alpha }));
        })
        .onComplete(() => {
          setScoreGain(undefined);
        });

      const appearTween = new Tween({ y: y + height / 3, alpha: 0 })
        .to({ y: y - 40, alpha: 1 })
        .easing(Easing.Elastic.Out)
        .duration(400)
        .onUpdate(val => {
          setScoreGainStyle({ ...val });
        })
        .onComplete(() => {
          fadeOutTween.rewind().start();
        });

      scoreGainFadeOutTween.current = fadeOutTween;
      scoreGainAppearTween.current = appearTween;

      return () => {
        fadeOutTween.stop();
        appearTween.stop();
        Group.shared.remove(appearTween);
      };
    }, [height, y]);

    useImperativeHandle(ref, () => ({
      showScoreGain: scoreGain => {
        scoreGainFadeOutTween.current?.stop();
        scoreGainAppearTween.current?.stop().start();
        setScoreGain(scoreGain);
      },
    }));

    const handleTutorialOffset = useCallback(
      (xOffset: number) => {
        onXOffset(xOffset);
      },
      [onXOffset]
    );

    const positiveScoreGain = (scoreGain || 0) >= 0;
    const scoreGainTextStyle = useMemo(
      () =>
        new TextStyle({
          fontFamily,
          fontSize: 30,
          fontWeight: "bold",
          fill: positiveScoreGain ? "#01913c" : "#e72029",
          stroke: "white",
          strokeThickness: 5,
          lineJoin: "round",
        }),
      [fontFamily, positiveScoreGain]
    );

    return (
      <>
        <Sprite
          texture={textures.back}
          zIndex={middleZIndex - 1}
          x={x}
          y={y}
          height={height}
          width={width}
          {...rest}
        />

        {!!scoreGain && (
          <Text
            key={scoreGain}
            isSprite
            zIndex={middleZIndex}
            text={(scoreGain <= 0 ? "" : "+") + scoreGain}
            x={x + width / 2}
            {...scoreGainStyle}
            anchor={[0.25, 0]}
            scale={s.scale}
            style={scoreGainTextStyle}
          />
        )}

        <Sprite
          texture={textures.front}
          zIndex={middleZIndex + 1}
          x={x}
          y={y}
          height={height}
          width={width}
          eventMode="static"
          onpointerdown={handlePointerdown}
          {...rest}
        />

        {enableTutorial && !!tutorialPointer && !haveUserUnderstood && (
          <TutorialOverlay
            texture={tutorialPointer}
            tutorialInterval={1.5}
            bag={{
              x,
              y,
              width,
              height,
              horizontalPadding,
            }}
            onRequestOffset={handleTutorialOffset}
          />
        )}
      </>
    );
  }
);

export default Bag;
