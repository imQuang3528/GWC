import { PAutosizeSprite } from "./AutosizeSprite";
import { Layout, PText } from "./AutoscaleLayoutable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FederatedPointerEvent,
  Resource,
  TextStyle,
  Texture,
  Text,
  Rectangle,
} from "pixi.js-legacy";
import { Easing, Tween } from "tweedle.js";

export interface ButtonProps extends Layout {
  texture?: Texture<Resource>;
  text?: string;
  textStyle?: TextStyle;

  // Hit area padding only for text
  textHitPadding?: number;
  onPress?: () => void;
  intriguingAnimation?: boolean;
}

const ALLOWED_POINTER_DELTA = 10; // px

function Button({
  texture,
  text,
  textStyle,
  textHitPadding,
  onPress,
  intriguingAnimation,
  ...rest
}: ButtonProps) {
  if (texture && text) {
    throw new Error("Button can only be sprite or text, not both.");
  }

  const pressing = useRef(false);
  const pressingPos = useRef({ x: 0, y: 0 });

  const [scale, setScale] = useState(1);
  const buttonPressingTween = useRef(
    new Tween({ scale }).onUpdate(val => {
      setScale(val.scale);
    })
  );

  const [alpha, setAlpha] = useState(1);
  const textPressingTween = useRef(
    new Tween({ alpha })
      .easing(Easing.Cubic.Out)
      .duration(100)
      .onUpdate(val => {
        setAlpha(val.alpha);
      })
  );

  const startIntriguingAnimation = () => {
    buttonPressingTween.current
      .easing(Easing.Quadratic.InOut)
      .from({ scale: 1 })
      .dynamicTo({ scale: 1.15 })
      .yoyo(true)
      .repeat(Infinity)
      .duration(1100)
      .restart();
  };

  const handlePointerDown = useCallback(
    (e: FederatedPointerEvent) => {
      if (texture) {
        buttonPressingTween.current
          .easing(Easing.Cubic.Out)
          .yoyo(false)
          .repeat(0)
          .duration(100)
          .dynamicTo({ scale: 0.85 })
          .onComplete(() => {})
          .restart();
      } else {
        textPressingTween.current.dynamicTo({ alpha: 0.6 }).restart();
      }

      pressing.current = true;
      pressingPos.current.x = e.clientX;
      pressingPos.current.y = e.clientY;
    },
    [texture]
  );
  const handlePointerUp = useCallback(() => {
    if (texture) {
      buttonPressingTween.current
        .dynamicTo({ scale: 1 })
        .restart()
        .onComplete(() => {
          if (intriguingAnimation) {
            requestAnimationFrame(() => {
              startIntriguingAnimation();
            });
          }
        });
    } else {
      textPressingTween.current.dynamicTo({ alpha: 1 }).restart();
    }

    if (pressing.current) onPress?.();

    pressing.current = false;
  }, [intriguingAnimation, onPress, texture]);
  const handlePointerUpOutside = useCallback(
    (e: FederatedPointerEvent) => {
      if (texture) {
        buttonPressingTween.current
          .dynamicTo({ scale: 1 })
          .restart()
          .onComplete(() => {
            if (intriguingAnimation) {
              requestAnimationFrame(() => {
                startIntriguingAnimation();
              });
            }
          });
      } else {
        textPressingTween.current.dynamicTo({ alpha: 1 }).restart();
      }

      if (
        pressing.current &&
        Math.abs(e.clientX - pressingPos.current.x) < ALLOWED_POINTER_DELTA &&
        Math.abs(e.clientY - pressingPos.current.y) < ALLOWED_POINTER_DELTA
      ) {
        onPress?.();
      }

      pressing.current = false;
    },
    [intriguingAnimation, onPress, texture]
  );

  useEffect(() => {
    if (intriguingAnimation && texture) {
      const tween = buttonPressingTween.current;
      startIntriguingAnimation();

      return () => {
        tween.stop();
      };
    }
  }, [intriguingAnimation, texture]);

  const [textRef, setTextRef] = useState<Text | null>(null);
  const textHitArea = useMemo(() => {
    if (textRef && textHitPadding) {
      const currentBounds = textRef?.getBounds();
      const paddedBounds = new Rectangle(
        -currentBounds.width * textRef.anchor.x - textHitPadding,
        -currentBounds.height * textRef.anchor.y - textHitPadding,
        currentBounds.width + textHitPadding * 2,
        currentBounds.height + textHitPadding * 2
      );

      return paddedBounds;
    }

    return null;
  }, [textHitPadding, textRef]);

  return (
    <>
      {!!texture && (
        <PAutosizeSprite
          {...rest}
          texture={texture}
          goodScale={scale}
          goodScaleAnchor={0.5}
          eventMode="static"
          onpointerdown={handlePointerDown}
          onpointerup={handlePointerUp}
          onpointerupoutside={handlePointerUpOutside}
        />
      )}

      {!!text && (
        <PText
          ref={ref => setTextRef(ref)}
          {...rest}
          text={text}
          style={textStyle}
          alpha={alpha}
          hitArea={textHitArea}
          eventMode="static"
          onpointerdown={handlePointerDown}
          onpointerup={handlePointerUp}
          onpointerupoutside={handlePointerUpOutside}
        />
      )}
    </>
  );
}

export default Button;
