import { useContext, useRef, useState } from "react";
import { GameContext } from "../GameContainer";
import { PAutosizeSprite } from "./AutosizeSprite";
import { _ReactPixi, useTick } from "@pixi/react";
import { Layout } from "./AutoscaleLayoutable";
import { Ticker } from "pixi.js-legacy";

export interface LoadingSpinnerProps extends _ReactPixi.ISprite, Layout {}

const SPIN_INTERVAL = 100; //ms

function LoadingSpinner(props: LoadingSpinnerProps) {
  const { textures } = useContext(GameContext);
  const [spinnerAngle, setSpinnerAngle] = useState(0);
  const totalTime = useRef(0);

  useTick(tick => {
    const delta = tick / Ticker.targetFPMS;

    setSpinnerAngle(Math.trunc(totalTime.current / SPIN_INTERVAL) * 45);
    totalTime.current += delta;
  });

  return (
    <>
      <PAutosizeSprite
        texture={textures.loadingSpinner}
        width={50}
        anchor={0.5}
        angle={spinnerAngle}
        {...props}
      />
    </>
  );
}

export default LoadingSpinner;
