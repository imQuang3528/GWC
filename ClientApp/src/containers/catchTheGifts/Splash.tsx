import { Resource, TextStyle, Texture } from "pixi.js-legacy";
import { PAutosizeSprite } from "./helper/AutosizeSprite";
import { useContext } from "react";
import { GameContext } from "./GameContainer";
import Button from "./helper/Button";
import { PText } from "./helper/AutoscaleLayoutable";

export interface SplashProps {
  textures: {
    baubles: Texture<Resource>;
    title: Texture<Resource>;
    playButton: Texture<Resource>;
    chancesBox: Texture<Resource>;
  };
  chances: {
    available: number;
    textColor?: string;
  };
  onPlay?: () => void;
  onTnC?: () => void;
}

function Splash({ textures, chances, onPlay, onTnC }: SplashProps) {
  const { screen, mainScreen, safeTop, s, fontFamily } =
    useContext(GameContext);

  return (
    <>
      <PAutosizeSprite
        boundary={screen}
        texture={textures.baubles}
        top={0}
        flow="centerHorizontal"
        width={mainScreen.width}
      />
      <PAutosizeSprite
        boundary={screen}
        texture={textures.title}
        top={safeTop + 80}
        flow="centerHorizontal"
        width={mainScreen.width}
      />

      <Button
        boundary={screen}
        texture={textures.playButton}
        flow="centerHorizontal"
        bottom={90}
        width={200}
        onPress={onPlay}
        intriguingAnimation
      />

      <PAutosizeSprite
        boundary={screen}
        texture={textures.chancesBox}
        bottom={60}
        height={26}
        flow="centerHorizontal"
      />
      <PText
        boundary={screen}
        text={`${chances.available} Chance(s)`}
        style={
          new TextStyle({
            fontFamily,
            fontSize: s(16),
            lineHeight: s(20),
            fill: chances.textColor || "#000000",
          })
        }
        flow="centerHorizontal"
        flowMode="dynamic"
        bottom={63}
        height={20}
      />

      <Button
        boundary={screen}
        text="Terms & conditions apply."
        textStyle={
          new TextStyle({
            fontFamily,
            fontSize: s(12),
            lineHeight: s(15),
            fill: "#b2000f",
          })
        }
        textHitPadding={25}
        flow="centerHorizontal"
        flowMode="dynamic"
        bottom={35}
        height={15}
        onPress={onTnC}
      />
    </>
  );
}

export default Splash;
