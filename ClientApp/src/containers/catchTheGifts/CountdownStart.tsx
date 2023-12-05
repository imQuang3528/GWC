import { TextStyle } from "pixi.js-legacy";
import { useContext, useEffect, useState } from "react";
import { GameContext } from "./GameContainer";
import { PText } from "./helper/AutoscaleLayoutable";
import { Easing, Tween } from "tweedle.js";

export interface OverProps {
  countdownStartNumber: number;
  onCountdownOver?: () => void;
}

function CountdownStart({ countdownStartNumber, onCountdownOver }: OverProps) {
  if (countdownStartNumber < 0) {
    throw new Error("Cannot countdown to 0 from " + countdownStartNumber);
  }

  const [countdownText, setCountdownText] = useState(countdownStartNumber + "");
  const [style, setStyle] = useState({ alpha: 0, scale: 0 });
  const { screen, fontFamily } = useContext(GameContext);

  useEffect(() => {
    const fadeoutTween = new Tween({ alpha: 1 })
      .to({ alpha: 0 })
      .delay(200)
      .duration(250)
      .easing(Easing.Quadratic.Out)
      .onUpdate(val => setStyle({ scale: 1, ...val }));

    const appearTween = new Tween({ alpha: 0, scale: 0 })
      .to({ alpha: 1, scale: 1 })
      .duration(400)
      .easing(Easing.Back.Out)
      .onUpdate(val => setStyle({ ...val }))
      .onComplete(() => fadeoutTween.start());

    const run = async () => {
      for (let i = countdownStartNumber; i >= 0; i--) {
        setCountdownText(i === 0 ? "GO!" : i + "");
        await new Promise(resolve => {
          fadeoutTween.onComplete(resolve);
          appearTween.start();
        });

        if (i === 0) {
          onCountdownOver?.();
        }
      }
    };
    run();

    return () => {
      appearTween.stop();
      fadeoutTween.stop();
    };
  }, [countdownStartNumber, onCountdownOver]);

  return (
    <>
      <PText
        boundary={screen}
        text={countdownText}
        style={
          new TextStyle({
            fontFamily,
            fontSize: 85,
            fontWeight: "bold",
            fill: "#ff4cb2",
            stroke: "#ffffff",
            strokeThickness: 8,
            lineJoin: "round",
          })
        }
        flow="center"
        flowMode="dynamic"
        {...style}
      />
    </>
  );
}

export default CountdownStart;
