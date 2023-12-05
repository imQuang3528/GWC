import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { getGameResult } from "../../services/getGameResult";
import ErrorModal from "../errorModal";
import TermCondition from "../termCondition";
import card1Img from "./assets/card/card1.png";
import card2Img from "./assets/card/card2.png";
import card3Img from "./assets/card/card3.png";
import card4Img from "./assets/card/card4.png";
import card5Img from "./assets/card/card5.png";
import backgroundImg from "./assets/background.png";
import chancesBoxImg from "./assets/chances_box.png";
import playBtnImg from "./assets/play_button.png";
import splashCardsImg from "./assets/splash_cards.png";
import splashGameTitleImg from "./assets/splash_game_title.png";
import CardCarousel from "./components/cardCarousel";
import { CardCarouselRef } from "./components/cardCarousel/header";
import ErrorContent from "./components/errorContent";
import SuccessContent from "./components/successContent";
import "./index.css";
import AssetsLoader from "../../utils/AssetsLoader";
import {
  addNativeEventListener,
  removeNativeEventListener,
} from "../../utils/nativeCommunicator";
import Header, { hideNativeHeader } from "../header";
import Description from "../description";

type PickupCardProps = {
  finishGameLoading: () => void;
  gameInformation: {
    listPrizesDisplay: string[];
    availableChances: number;
    title: string;
    description: string;
    buttonColor?: string;
    buttonTextColor?: string;
    chanceTextColor?: string;
    chancesColor?: string;
    descriptionTextColor?: string;
    backgroundImage?: string;
  };
  termCondition: string;
};

const MAX_CARD_DISTANCE = 200;
const CARD_REVEAL_DURATION = 0.5;

const rawImgs = {
  card1Img,
  card2Img,
  card3Img,
  card4Img,
  card5Img,
  backgroundImg,
  chancesBoxImg,
  playBtnImg,
  splashBackgroundImg: backgroundImg,
  splashCardsImg,
  splashGameTitleImg,
};

function PickupCard({
  finishGameLoading,
  gameInformation,
  termCondition,
}: PickupCardProps) {
  const carouselRef = useRef<CardCarouselRef>(null);
  const [main, setMain] = useState<HTMLDivElement | null>(null);
  const handleMain = useCallback((el: HTMLDivElement) => setMain(el), []);
  const [cardDistance, setCardDistance] = useState(
    Math.min(MAX_CARD_DISTANCE, window.innerWidth / 3)
  );
  const [chances, setChances] = useState(gameInformation.availableChances);
  const [showNoChances, setShowNoChances] = useState(false);
  const [imgs, setImgs] = useState(rawImgs);
  const [showSplash, setShowSplash] = useState(true);
  const [showPopupTC, setShowPopupTC] = useState(false);
  const [showPopupDesc, setShowPopupDesc] = useState(false);

  useEffect(() => {
    const trueRawImgs = gameInformation.backgroundImage
      ? { ...rawImgs, backgroundImg: gameInformation.backgroundImage }
      : rawImgs;

    setImgs(trueRawImgs);

    AssetsLoader.loadImages(trueRawImgs).then(() => {
      finishGameLoading();
      hideNativeHeader();
    });
  }, [finishGameLoading, gameInformation.backgroundImage]);

  useEffect(() => {
    const handleResize = () => {
      setCardDistance(Math.min(MAX_CARD_DISTANCE, window.innerWidth / 3));
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  });

  useEffect(() => {
    const onBackPress = () => {
      setShowPopupTC(false);
      setShowPopupDesc(false);
      return showPopupTC || showPopupDesc;
    };
    addNativeEventListener("hardwareBackPress", onBackPress);

    return () => removeNativeEventListener("hardwareBackPress", onBackPress);
  }, [showPopupDesc, showPopupTC]);

  const checkGameChances = useCallback(() => {
    if (chances === 0) {
      setShowNoChances(true);
      return false;
    }

    return true;
  }, [chances]);

  const getPrize = useCallback(async (): Promise<ReactNode> => {
    const { isSuccess, content } = await getGameResult();

    if (isSuccess) {
      return (
        <SuccessContent
          prize={content}
          onAgain={() => {
            setChances(pre => pre - 1);
            carouselRef.current?.closeRevealedCard();
          }}
        />
      );
    } else {
      return (
        <ErrorContent
          message={content}
          onClose={() => carouselRef.current?.closeRevealedCard()}
        />
      );
    }
  }, []);

  return (
    <>
      <main ref={handleMain}>
        {!!imgs.backgroundImg && (
          <img id="background" alt="Game Background" src={imgs.backgroundImg} />
        )}

        <div className="guide-text-box">
          <p className="guide-text">swipe and pick your lucky card!</p>
        </div>

        <CardCarousel
          ref={carouselRef}
          interactionContainerRef={main}
          numberOfCards={8}
          autoRotate={false}
          autoRotateTime={12}
          manualRotateDistance={1000}
          kineticRotateWeight={10}
          kineticDecelerationRate={325}
          numberOfShuffling={6}
          shufflingMaxDistance={70}
          shufflingHeight={100}
          shufflingDuration={0.18}
          dealingDuration={0.48}
          dealingDelay={0.16}
          dealingDeckDistanceFromCenter={220}
          dealingDirection="away"
          dealingFlyHeight={100}
          mixingDuration={0.9}
          mixingOvershoot={20}
          cardDistance={cardDistance}
          cardSnapping
          firstAnimation={false}
          redealingAnimation={false}
          cardSnappingTime={5}
          cardRevealingDuration={CARD_REVEAL_DURATION}
          cardRevealLimitDistance={70}
          shouldCardReveal={checkGameChances}
          cardSkew={8}
          cardBacks={[
            imgs.card1Img,
            imgs.card2Img,
            imgs.card3Img,
            imgs.card4Img,
            imgs.card5Img,
          ]}
          cardProps={{
            cardFloatingDelta: 12,
            cardFloatingTime: 3,
            cardShakingTime: 0.3,
          }}
          getRevealedCardContent={getPrize}
        />

        <footer>
          <div className="chances-box">
            <p
              className="text-chances"
              style={{
                color: gameInformation.chanceTextColor,
                backgroundImage: `url("${imgs.chancesBoxImg}")`,
              }}
            >
              {chances} Chance(s)
            </p>
          </div>
        </footer>
      </main>

      {showSplash && (
        <div
          className="splash-screen"
          style={{ backgroundImage: `url("${imgs.splashBackgroundImg}")` }}
        >
          <img
            className="splash-img"
            src={imgs.splashGameTitleImg}
            alt="Game Title"
          />
          <img
            className="splash-img"
            src={imgs.splashCardsImg}
            alt="Game Splash Bottom"
          />

          <div className="splash-interactive">
            <button
              className="image-button play-button"
              onClick={() => setShowSplash(false)}
            >
              <img src={imgs.playBtnImg} alt="Play button" draggable="false" />
            </button>
            <button
              className="image-button tnc-button"
              onClick={() => setShowPopupTC(true)}
            >
              Terms & conditions apply.
            </button>
          </div>
        </div>
      )}

      <div className="header-container">
        <Header
          showDescBtn
          onDescBtnPress={() => {
            setShowPopupDesc(true);
          }}
        />
      </div>

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
      />
    </>
  );
}

export default PickupCard;
