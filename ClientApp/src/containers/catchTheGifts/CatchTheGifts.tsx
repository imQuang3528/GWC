import { Stage } from "@pixi/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./styles.css";
import AssetsLoader from "../../utils/AssetsLoader";
import Header, { hideNativeHeader } from "../header";
import { bitmapFontFamilies, fontFamilies, imgs, textureImgs } from "./assets";
import TermCondition from "../termCondition";
import Description from "../description";
import GameContainer, {
  GameContainerProps,
  GameTextures,
} from "./GameContainer";
import { URL_API } from "../../App";
import {
  addNativeEventListener,
  removeNativeEventListener,
} from "../../utils/nativeCommunicator";
import ErrorModal from "../errorModal";

type CatchTheGiftsProps = {
  finishGameLoading: () => void;
  gameInformation: {
    availableChances: number;
    description: string;
    chanceTextColor?: string;
    leadershipBoard?: boolean;
    trueIconType?: { urls: string[] };
    countdownTimer?: number;
    speed?: string;
  };
  termCondition: string;
};

function CatchTheGift({
  finishGameLoading,
  gameInformation,
  termCondition,
}: CatchTheGiftsProps) {
  const [showPopupTC, setShowPopupTC] = useState(false);
  const [showPopupDesc, setShowPopupDesc] = useState(false);
  const [chances, setChances] = useState(gameInformation.availableChances);
  const [showNoChances, setShowNoChances] = useState(false);
  const [showFirework, setShowFirework] = useState(false);
  const [textures, setTextures] = useState<GameTextures>();
  const [bitmapFonts, setBitmapFonts] =
    useState<{ [K in keyof typeof bitmapFontFamilies]: string }>();

  useEffect(() => {
    const giftImgs = gameInformation.trueIconType?.urls || [];
    const giftImgObj: { [key: string]: string[] } = {};

    for (const gift of giftImgs) {
      let [giftValue, giftWeight] = gift
        .trim()
        .replace(/^.*[\\/]/, "")
        .replace(/\.[^/.]+$/, "")
        .trim()
        .split("_")
        .map(Number);
      if (isNaN(giftValue) || isNaN(giftWeight))
        throw new Error("Invalid gift value or weight");

      const giftKey = giftValue + "_" + giftWeight;
      if (!giftImgObj[giftKey]) giftImgObj[giftKey] = [];
      giftImgObj[giftKey].push(
        URL_API +
          "/mallsmobile/api/media/" +
          encodeURIComponent(gift.replace(/^\//, "")).replaceAll("%", "=") // the backend is a bit wacky
      );
    }

    Promise.all([
      AssetsLoader.loadTextures({ ...textureImgs, gifts: giftImgObj }),
      AssetsLoader.loadImages(imgs),
      AssetsLoader.loadFontFamilies(fontFamilies),
      AssetsLoader.loadBitmapFonts(bitmapFontFamilies),
    ]).then(([texturesResult, _imgs, _fonts, bitmapFontsResult]) => {
      setTextures(texturesResult);
      setBitmapFonts(bitmapFontsResult);
      finishGameLoading();
      hideNativeHeader();
    });
  }, [finishGameLoading, gameInformation.trueIconType?.urls]);

  const [gameWidth, gameHeight] = useMemo(
    () => [window.innerWidth, window.innerHeight],
    []
  );

  useEffect(() => {
    const onBackPress = () => {
      setShowPopupTC(false);
      setShowPopupDesc(false);
      return showPopupTC || showPopupDesc;
    };

    addNativeEventListener("hardwareBackPress", onBackPress);

    return () => removeNativeEventListener("hardwareBackPress", onBackPress);
  }, [showPopupDesc, showPopupTC]);

  const handleResult = useCallback(
    ({
      isSuccess,
      data,
    }: Parameters<NonNullable<GameContainerProps["onResult"]>>["0"]) => {
      if (isSuccess || data?.MinusChance) {
        setChances(pre => pre - 1);
      }
    },
    []
  );

  const pyroController = useMemo(
    () => ({
      ignite: () => setShowFirework(true),
      extinguish: () => setShowFirework(false),
    }),
    []
  );

  return (
    <>
      <Stage
        width={gameWidth}
        height={gameHeight}
        options={{
          sharedTicker: true,
          resolution: Math.floor(window.devicePixelRatio || 1),
          autoDensity: true,
          backgroundAlpha: 1,
          antialias: false,
        }}
      >
        {!!textures && !!bitmapFonts && (
          <GameContainer
            mode="timeLimit"
            timeLimit={gameInformation.countdownTimer ?? 60}
            textures={textures}
            fontFamily={fontFamilies.quicksand}
            bitmapFontFamily={bitmapFonts.quicksandBitmap}
            onAllowPlay={() => {
              if (chances <= 0) {
                setShowNoChances(true);
                return false;
              }

              return true;
            }}
            onResult={handleResult}
            onTnC={() => setShowPopupTC(true)}
            enableLeaderboard={gameInformation.leadershipBoard}
            gameConfig={{
              winScore: 1,
              speed: gameInformation.speed,
            }}
            pyroController={pyroController}
            chances={{
              available: chances,
              textColor: gameInformation.chanceTextColor,
            }}
          />
        )}
      </Stage>

      {showFirework && (
        <div className="pyro">
          <div className="before" />
          <div className="after" />
        </div>
      )}

      <Header
        showDescBtn
        onDescBtnPress={() => {
          setShowPopupDesc(true);
        }}
      />
      <TermCondition
        onlyPopup
        showPopup={showPopupTC}
        termCondition={termCondition}
        onClose={() => setShowPopupTC(false)}
      />
      <Description
        onlyPopup
        showPopup={showPopupDesc}
        description={gameInformation.description}
        onClose={() => setShowPopupDesc(false)}
      />

      <ErrorModal
        showModal={showNoChances}
        errorMsg="Oops, you do not have sufficient chance(s) to play this game."
        onClose={() => setShowNoChances(false)}
        route40={"route40"}
        opaciti01={"opaciti01"}
        image={imgs.warning}
      />
    </>
  );
}

export default CatchTheGift;
