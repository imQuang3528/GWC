import { lazy, useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  BUBBLE_SHOOTER_GAME_TYPE,
  CLAW_MACHINE_GAME_TYPE,
  GIFT_CATCHER_GAME_TYPE,
  PICKUP_CARD_GAME_TYPE,
  SCRATCH_CARD_GAME_TYPE,
  SPIN_AND_WIN_GAME_TYPE,
} from "./Constant";
import TermCondition from "./containers/termCondition";
import * as API from "./services/API";
import { ErrorBoundary } from "react-error-boundary";
import { showNativeHeader } from "./containers/header";

// Lazy loading games helps game's CSS styles from overwriting each other
const GWCGame1 = lazy(() => import("./containers/GWCGame1"));
const GWCGame2 = lazy(() => import("./containers/gwcGame2/index"));
const PickupCard = lazy(() => import("./containers/pickupCard"));
const ClawMachine = lazy(() => import("./containers/clawMachine/claw-machine"));
const BubbleShooter = lazy(() => import("./containers/bubbleShooter"));
const CatchTheGift = lazy(() =>
  import("./containers/catchTheGifts/CatchTheGifts")
);

export const URL_API = window.location.hostname.includes("uat")
  ? API.REACT_APP_BACKEND_URL_UAT
  : API.REACT_APP_BACKEND_URL;

export const URL_MEDIA = window.location.hostname.includes("uat")
  ? process.env.REACT_APP_MEDIA_URL_NO_SLASH_UAT
  : process.env.REACT_APP_MEDIA_URL_NO_SLASH;

const App = () => {
  const [isAPILoading, setIsAPILoading] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [isGameError, setIsGameError] = useState(false);
  const [termCondition, setTermCondition] = useState("");
  const [gameInformation, setGameInformation] = useState();
  const [gameTypeParam, setGameTypeParam] = useState("");

  useEffect(() => {
    console.log("1.0.6");
    async function fetchData() {
      //Get Params from url search
      const query = new URLSearchParams(window.location.search);
      const tokenLocal = query.get("token");
      const gameCode = query.get("idGameCode");

      //save params to localStorage
      window.localStorage.setItem("token", tokenLocal);

      //get Game Infomation
      const getGameCMS = (await API.getGameCMS()).data.gameSetting;
      const gameData = getGameCMS.find(item => item.gameCode === gameCode);
      if (gameData) {
        let iconTypeObj = {
          urls: [],
        };
        if (
          gameData.iconType &&
          gameData.iconType.urls.length > 0 &&
          gameData.iconType.urls.length < 8
        ) {
          let maxCount = gameData.iconType.urls.length;
          let count = 0;
          while (iconTypeObj.urls.length < 8) {
            if (count === maxCount) {
              count = 0;
            }
            iconTypeObj.urls.push(gameData.iconType.urls[count]);
            count++;
          }
        }
        const getPublicGames = (await API.getPublicGames(tokenLocal)).data
          .result.items;
        const item = getPublicGames.find(item => item.code === gameCode);

        if (item) {
          window.localStorage.setItem("idGameInfo", item.id);
          const getGameInfo = (await API.getGameInfo(tokenLocal)).data.result;

          window.localStorage.setItem(
            "chanceValueTypeCode",
            getGameInfo.chanceValueTypeCode
          );

          setGameTypeParam(gameData.gameType);
          const termCondition = gameData.termsConditions;
          if (termCondition) {
            setTermCondition(termCondition);
          }

          const listPrizesGameInfo = getGameInfo.prizeConfigs.map(
            config => config.displayName
          );

          setGameInformation({
            listPrizesDisplay: listPrizesGameInfo,
            availableChances: getGameInfo.availableChances,
            ...gameData,
            title: gameData.gameName,
            description: gameData.gameDescription,
            buttonColor: gameData.buttonColor,
            buttonTextColor: gameData.buttonTextColor,
            chanceTextColor: gameData.chanceTextColor,
            chancesColor: gameData.chancesColor,
            descriptionTextColor: gameData.descriptionTextColor,
            scratchImage: gameData.scratchImage.urls[0]
              ? URL_MEDIA + gameData.scratchImage.urls[0]
              : undefined,
            backgroundImage: gameData.backgroundImage.urls[0]
              ? URL_MEDIA + gameData.backgroundImage.urls[0]
              : undefined,
            iconType: iconTypeObj,
            trueIconType: gameData.iconType,
          });
        }
      }
    }
    fetchData()
      .catch(() => setIsGameError(true))
      .finally(() => setIsAPILoading(false));
  }, []);

  useEffect(() => {
    window.addEventListener("error", () => setIsGameError(true));
    window.addEventListener("unhandledrejection", () => setIsGameError(true));
  }, []);

  const finishGameLoading = useCallback(() => setIsGameLoading(false), []);

  useEffect(() => {
    if (!isAPILoading && !isGameLoading) {
      document.querySelector("#loading-overlay")?.remove();
    }
  }, [isAPILoading, isGameLoading]);

  const component = useMemo(() => {
    if (!isAPILoading) {
      if (isGameError) {
        showNativeHeader();
        finishGameLoading();
        return (
          <p className="info-line">An error has occurred! Please try again.</p>
        );
      } else if (gameInformation && gameTypeParam) {
        switch (gameTypeParam) {
          case SPIN_AND_WIN_GAME_TYPE:
            return (
              <GWCGame1
                finishGameLoading={finishGameLoading}
                gameInformation={gameInformation}
              >
                <TermCondition termCondition={termCondition} />
              </GWCGame1>
            );
          case SCRATCH_CARD_GAME_TYPE:
            return (
              <GWCGame2
                finishGameLoading={finishGameLoading}
                gameInformation={gameInformation}
              >
                <TermCondition termCondition={termCondition} />
              </GWCGame2>
            );
          case PICKUP_CARD_GAME_TYPE:
            return (
              <PickupCard
                finishGameLoading={finishGameLoading}
                gameInformation={gameInformation}
                termCondition={termCondition}
              />
            );
          case CLAW_MACHINE_GAME_TYPE:
            return (
              <ClawMachine
                finishGameLoading={finishGameLoading}
                gameInformation={gameInformation}
                termCondition={termCondition}
              />
            );
          case BUBBLE_SHOOTER_GAME_TYPE:
            return (
              <BubbleShooter
                finishGameLoading={finishGameLoading}
                gameInformation={gameInformation}
                termCondition={termCondition}
              />
            );
          case GIFT_CATCHER_GAME_TYPE:
            return (
              <CatchTheGift
                finishGameLoading={finishGameLoading}
                gameInformation={gameInformation}
                termCondition={termCondition}
              />
            );
          default:
            showNativeHeader();
            finishGameLoading();
            return <p className="info-line">Game not found.</p>;
        }
      } else {
        showNativeHeader();
        finishGameLoading();
        return <p className="info-line">Game not found.</p>;
      }
    }
  }, [
    finishGameLoading,
    gameInformation,
    gameTypeParam,
    isAPILoading,
    isGameError,
    termCondition,
  ]);

  return (
    <ErrorBoundary
      fallback={
        <p className="info-line">An error has occurred! Please try again.</p>
      }
      onError={showNativeHeader}
    >
      {component}
    </ErrorBoundary>
  );
};

export default App;
