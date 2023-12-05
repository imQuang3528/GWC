import React, { useCallback, useEffect, useRef, useState } from "react";
import PopUp from "../../assets/SpinWheelPictures/AssesntissGIft.png";
import SadFace from "../../assets/SpinWheelPictures/Sadface.png";
import cardImage from "../../assets/SpinWheelPictures/ScratchCard.jpg";
import * as API from "../../services/API";
import ErrorModal from "../errorModal/index";
import "./GWCGame2.css";
import ScratchCard from "./ScratchCard";
import AssetsLoader from "../../utils/AssetsLoader";
import Header, { hideNativeHeader } from "../header";
import Description from "../description";
import {
  addNativeEventListener,
  removeNativeEventListener,
} from "../../utils/nativeCommunicator";
import {
  REACT_APP_BACKEND_URL,
  REACT_APP_BACKEND_URL_UAT,
} from "../../services/API";

const FINISH_PERCENT = 50;

const GWCGame2 = props => {
  const wrapperGame = useRef();
  const [gameData, setGameData] = useState({
    title: "",
    description: "",
    availableChances: 0,
    listPrizesDisplay: [],
    buttonColor: "",
    buttonTextColor: "",
    chanceTextColor: "",
    chancesColor: "",
    descriptionTextColor: "",
    scratchImage: "",
    ...props.gameInformation,
  });

  const [errorPlay, setErrorPlay] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successPlay, setSuccessPlay] = useState(false);
  const [prize, setPrize] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [Congratulations, setCongratulations] = useState("");
  const [Congratulations1, setCongratulations1] = useState("");
  const [showPopupDesc, setShowPopupDesc] = useState(false);
  const [scratchImgLoaded, setScratchImgLoaded] = useState(false);

  const ScratchContentRef = useRef();
  const ScratchChildrenRef = useRef();
  const ScratchCardRef = useRef();
  const resultContainer = useRef();
  const progressIndicator = useRef();
  const notHavePrize = !prize || prize === "Better Luck Next Time";

  // eslint-disable-next-line no-restricted-globals
  const width = window.innerWidth > 0 ? window.innerWidth : screen.width;
  // eslint-disable-next-line no-restricted-globals
  const height = window.innerHeight > 0 ? window.innerHeight : screen.height;

  useEffect(() => {
    if (props.gameInformation) {
      setGameData(props.gameInformation);
    }
  }, [props]);

  useEffect(() => {
    const onBackPress = () => {
      setShowPopupDesc(false);
      return showPopupDesc;
    };
    addNativeEventListener("hardwareBackPress", onBackPress);

    return () => removeNativeEventListener("hardwareBackPress", onBackPress);
  }, [showPopupDesc]);

  const handleComplete = async () => {
    // animationRoute();
    if (props.gameInformation) {
      setLoading(true);

      const query = new URLSearchParams(window.location.search);
      const tokenLocal = query.get("token");
      const playGame = await API.playGame(tokenLocal);
      console.log("play game", playGame);

      setLoading(false);
      if (playGame.data.success === false) {
        if (playGame.data.error) {
          if (playGame.data.error.code === 0) {
            setErrorPlay(true);
            setErrorMsg(playGame.data.error.message);
          }
        }
        return;
      } else {
        resultContainer.current?.classList.remove("hide-text");
        resultContainer.current?.classList.add("hide");
        resultContainer.current?.addEventListener(
          "transitionend",
          () => {
            const prizeName = `${playGame.data.result.displayName}` || "";
            setSuccessPlay(true);
            setPrize(prizeName);

            if (!prizeName || prizeName === "Better Luck Next Time") {
              setCongratulations("");
              setCongratulations1("");
            } else {
              setCongratulations("before");
              setCongratulations1("after");
            }
          },
          { once: true }
        );
      }
      //scratch scuccess - 1 chances
      setGameData(pre => {
        return {
          ...pre,
          availableChances: pre.availableChances - 1,
        };
      });
    }
  };

  useEffect(() => {
    if (successPlay) {
      resultContainer.current?.classList.remove("hide");
      resultContainer.current?.classList.add("show");
    }
  }, [successPlay]);

  const handleProgress = useCallback(
    p =>
      progressIndicator?.current &&
      (progressIndicator.current.style.width =
        (p / FINISH_PERCENT) * 100 + "%"),
    []
  );

  const animationRoute = () => {
    ScratchContentRef.current.classList.add("route20");
  };

  const replaceScratchCard = callback => {
    const duration = 500;

    const scratch = ScratchContentRef.current;
    if (scratch) {
      const outAni = scratch.animate(
        {
          transform: ["translateX(0)", "translateX(150%)"],
        },
        {
          duration,
          easing: "cubic-bezier(0.36, 0, 0.66, -0.66)",
          fill: "forwards",
        }
      );

      outAni.addEventListener(
        "finish",
        () => {
          callback?.();

          outAni.cancel();
          const inAni = scratch.animate(
            {
              transform: ["translateX(-150%)", "translateX(0)"],
            },
            {
              duration,
              easing: "cubic-bezier(0.34, 1.66, 0.64, 1)",
            }
          );
        },
        { once: true }
      );
    } else {
      callback?.();
    }
  };

  const reset = () => {
    setSuccessPlay(false);

    replaceScratchCard(() => {
      ScratchCardRef.current?.reset();
      setPrize(undefined);
      setCongratulations("");
      setCongratulations1("");

      resultContainer.current?.classList.remove("show");
      resultContainer.current?.classList.add("hide-text");
    });
  };

  const size = Math.floor(Math.min(width * 0.7, height * 0.4));

  const settings = {
    height: size,
    width: size,
    image: gameData.scratchImage
      ? `${
          window.location.hostname.includes("uat")
            ? REACT_APP_BACKEND_URL_UAT
            : REACT_APP_BACKEND_URL
        }/mallsmobile/media?uri=${gameData.scratchImage}`
      : cardImage,
    finishPercent: FINISH_PERCENT,
    onComplete: handleComplete,
    onProgress: handleProgress,
    onImageLoaded: () => setScratchImgLoaded(true),
  };

  useEffect(() => {
    if (gameData && scratchImgLoaded) {
      wrapperGame.current.style.setProperty(
        "background-image",
        `url("${gameData.backgroundImage}")`,
        "important"
      );

      AssetsLoader.loadImages({
        ...(gameData.backgroundImage
          ? { backgroundImg: gameData.backgroundImage }
          : undefined),
        PopUp,
        SadFace,
      }).then(() => {
        hideNativeHeader();
        props.finishGameLoading();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData, scratchImgLoaded, props.finishGameLoading]);

  const checkError = () => {
    if (gameData.availableChances === 0 && !successPlay) {
      setErrorPlay(true);
    } else {
      setErrorPlay(false);
    }
  };

  useEffect(() => {
    if (gameData.availableChances === 0) {
      ScratchChildrenRef.current.style.setProperty(
        "pointer-events",
        "none",
        "important"
      );
    } else {
      ScratchChildrenRef.current.style.setProperty(
        "pointer-events",
        "auto",
        "important"
      );
    }
  }, [gameData.availableChances]);

  return (
    <div ref={wrapperGame} className="wrapper-sratch">
      <div className="scratch-container">
        <div className="main-game-container">
          <h1 className="game-title" style={{ color: gameData.gameNameColor }}>
            {gameData.gameName}
          </h1>

          <div ref={ScratchContentRef} className="scratch-content">
            <div onTouchStart={checkError}>
              <div className="pyro" ref={ScratchChildrenRef}>
                <div className={Congratulations} />
                <div className={Congratulations1} />

                <ScratchCard ref={ScratchCardRef} {...settings}>
                  <div
                    style={{
                      height: settings.height,
                      width: settings.width,
                      position: "relative",
                    }}
                  >
                    <div
                      ref={resultContainer}
                      className="result-container hide-text"
                    >
                      {/* <img
                      style={{ width: "100%", height: "100%", borderRadius: 20 }}
                     src={require("../../assets/SpinWheelPictures/giftForScratch.jpg")}
                      alt=""
                    ></img> */}
                      <div className="result-header">
                        <h2 className="text-gradient1 text-cg1">
                          {notHavePrize ? prize : "Congratulations!"}
                        </h2>
                        {/* <div className="progress-container">
                          <div ref={progressIndicator} className="progress-indicator" />
                        </div> */}
                      </div>
                      <div className="result-body">
                        <p className="text-gradient1">
                          {notHavePrize ? "" : "You have won"}
                        </p>
                        <p className="text-gradient1 popup-body-prize1">
                          {notHavePrize ? "" : prize}
                        </p>
                        <img
                          className="result-img"
                          key={prize && notHavePrize ? SadFace : PopUp}
                          src={prize && notHavePrize ? SadFace : PopUp}
                          alt={prize && notHavePrize ? "sad face" : "gift box"}
                        />
                      </div>
                    </div>

                    {loading && (
                      <div className="loader-overlay">
                        <div className="loader" />
                      </div>
                    )}
                  </div>
                </ScratchCard>
              </div>
            </div>
          </div>
          <div className="chance-content">
            <div
              style={{
                backgroundColor: `${gameData.chancesColor}`,
                color: `${gameData.chanceTextColor}`,
              }}
              className="chance-box"
            >
              <span className="chance-text-content">
                Chance{gameData.availableChances === 1 ? "" : "s"}:{" "}
                {gameData.availableChances}
              </span>
            </div>
          </div>

          <div
            className={`chance-content ${
              successPlay && gameData.availableChances > 0 ? "" : "hidden"
            }`}
          >
            <button
              disabled={!(successPlay && gameData.availableChances > 0)}
              onClick={reset}
              className="button-play-again"
            >
              Play Again
            </button>
          </div>
        </div>

        <Header
          showDescBtn
          onDescBtnPress={() => {
            setShowPopupDesc(true);
          }}
        />

        {props.children}

        <Description
          onlyPopup
          showPopup={showPopupDesc}
          description={gameData.description}
          onClose={() => setShowPopupDesc(false)}
        />

        <ErrorModal
          showModal={errorPlay}
          errorMsg={
            errorMsg || (
              <div>
                You do not have sufficient chances
                <br /> to play this game
              </div>
            )
          }
          onClose={() => setErrorPlay(false)}
          route40={"route40"}
          opaciti01={"opaciti01"}
        />
        {/* {successPlay ? (
          <SuccessModal
            prize={prize}
            route40={"route40"}
            opaciti01={"opaciti01"}
            onClose={() => setSuccessPlay(false)}
            onAgain={() => window.location.reload()}
          />
        ) : (
          <></>
        )} */}
      </div>
    </div>
  );
};

export default GWCGame2;
