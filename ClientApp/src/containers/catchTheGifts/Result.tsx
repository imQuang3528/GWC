import { Resource, TextStyle, Texture } from "pixi.js-legacy";
import { PText } from "./helper/AutoscaleLayoutable";
import { PAutosizeSprite } from "./helper/AutosizeSprite";
import { useContext, useEffect } from "react";
import { GameContext } from "./GameContainer";

export interface PyroController {
  ignite: () => void;
  extinguish: () => void;
}

export interface ResultProps {
  frameTexture: Texture<Resource>;
  score: number;
  winScore: number;
  isSuccess?: boolean;
  content?: string;
  pyroController?: PyroController;
}

function Result({
  frameTexture,
  score,
  winScore,
  isSuccess,
  content,
  pyroController,
}: ResultProps) {
  const { screen, safeTop, s, fontFamily } = useContext(GameContext);

  useEffect(() => {
    if (
      pyroController &&
      score >= winScore &&
      isSuccess &&
      content !== "Better Luck Next Time"
    ) {
      pyroController.ignite();
      return () => pyroController.extinguish();
    }
  }, [content, isSuccess, pyroController, score, winScore]);

  return (
    <>
      <PAutosizeSprite
        boundary={screen}
        texture={frameTexture}
        top={safeTop + 100}
        flow="centerHorizontal"
        width={300}
      />
      <PText
        boundary={screen}
        top={safeTop + 156}
        flow="centerHorizontal"
        flowMode="dynamic"
        scale={s.scale}
        text={score.toString()}
        style={
          new TextStyle({
            fontFamily,
            fontSize: 100,
            fontWeight: "bold",
            fill: "#ff1f00",
          })
        }
      />

      <PText
        boundary={screen}
        top={safeTop + 285}
        flow="centerHorizontal"
        flowMode="dynamic"
        scale={s.scale}
        text={
          isSuccess !== false && content !== "Better Luck Next Time"
            ? score >= winScore
              ? `HO-HO-HO!\nYou have won ${content}`
              : "Give it another try,\nand thank you!"
            : content || "There was an error occurred."
        }
        style={
          new TextStyle({
            fontFamily,
            fontSize: 24,
            fontWeight: "bold",
            fill: "#ff1f00",
            align: "center",
            wordWrap: true,
            wordWrapWidth: screen.width - 24,
          })
        }
      />
    </>
  );
}

export default Result;
