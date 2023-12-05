import { Resource, Texture } from "pixi.js-legacy";
import { PAutosizeSprite } from "./helper/AutosizeSprite";
import { useContext, useEffect, useState } from "react";
import { GameContext } from "./GameContainer";
import LoadingSpinner from "./helper/LoadingSpinner";

export interface OverProps {
  textures: {
    gameOver: Texture<Resource>;
    loadingSpinner: Texture<Resource>;
  };
}

const SHOW_SPIN_WAIT_TIME = 3; //s

function Over({ textures }: OverProps) {
  const [showSpinner, setShowSpinner] = useState(false);
  const { screen, safeTop } = useContext(GameContext);

  useEffect(() => {
    const timeout = setTimeout(
      () => setShowSpinner(true),
      SHOW_SPIN_WAIT_TIME * 1000
    );

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <PAutosizeSprite
        boundary={screen}
        texture={textures.gameOver}
        top={safeTop + 100}
        flow="centerHorizontal"
        width={300}
      />

      {showSpinner && (
        <LoadingSpinner
          boundary={screen}
          top={safeTop + 330}
          flow="centerHorizontal"
          flowMode="dynamic"
        />
      )}
    </>
  );
}

export default Over;
