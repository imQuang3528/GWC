import {
  Common,
  Composite,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  Runner,
  World,
} from "matter-js";
import { Texture } from "pixi.js-legacy";
import { Emitter } from "@pixi/particle-emitter";
import { useCallback, useEffect, useRef, useState } from "react";
import ErrorModal from "../errorModal";
import SuccessModal from "../successModal";
import { getGameResult } from "../../services/getGameResult";
import gameContentBgImg from "./assets/backgroupContentInGift.png";
import leverTopImg from "./assets/lever_top.png";
import grabBtnImg from "./assets/button.png";
import gameFooterImg from "./assets/control_pad.png";
import gameHeaderImg from "./assets/roof.png";
import clawzLogoImg from "./assets/Clawzlogo.png";
import GRLogoImg from "./assets/GRlogo.png";
import leftFrameImg from "./assets/background_middle_left_frame.png";
import rightFrameImg from "./assets/background_middle_right_frame.png";
import reflectionLayerImg from "./assets/reflection_layer.png";
import splashTopImg from "./assets/splash_top.png";
import splashLogoImg from "./assets/splash_GRlogo.png";
import splashBottomImg from "./assets/splash_bottom.png";
import splashBgImg from "./assets/splash_background.png";
import playBtnImg from "./assets/play_button.png";
import glowStarImg from "./assets/star.png";
import "./claw-machine.css";
import TermCondition from "../termCondition";
import PixiRender from "./renderers/pixiRenderer";
import { GrabbingState, createOptions } from "./configs/general";
import {
  createParticlesConfig,
  explosion,
  glowStars,
} from "./configs/particles";
import { clawSpritesheet, giftsSpritesheet } from "./configs/spritesheets";
import {
  createBoundaries,
  createCrane,
  createGifts,
  setupCreation,
} from "./core/creation";
import {
  checkGift,
  closeClaw,
  dropGrabbingGiftRandomly,
  entranceLowerCrane,
  helpSurvivedGiftFitInsideCrane,
  lowerClaw,
  maintainFingersGap,
  moveCrane,
  openClaw,
  pause,
  raiseClaw,
  removeExtraGrabbingGifts,
  revealGift,
  setupAction,
  shakeGifts,
  updateTweens,
} from "./core/action";
import Description from "../description";
import Header, { hideNativeHeader } from "../header";
import {
  addNativeEventListener,
  removeNativeEventListener,
} from "../../utils/nativeCommunicator";
import AssetsLoader from "../../utils/AssetsLoader";

// module aliases
const Render = PixiRender;
Common.setDecomp(require("poly-decomp"));

const gameImgs = {
  gameContentBgImg,
  claw: clawSpritesheet,
  gifts: giftsSpritesheet,
  glowStarImg,
};

const imgs = {
  gameHeaderImg,
  gameFooterImg,
  leverTopImg,
  grabBtnImg,
  clawzLogoImg,
  GRLogoImg,
  leftFrameImg,
  rightFrameImg,
  reflectionLayerImg,
  splashTopImg,
  splashLogoImg,
  splashBottomImg,
  splashBgImg,
  playBtnImg,
};

const DEBUG = false;

const CONTAINER_MAX_WIDTH = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue(
    "--container-max-width"
  )
);
const CANVAS_SCALING_FACTOR = 0.00075;
const MAX_SCALING = 0.35;

const ClawMachine = ({ finishGameLoading, gameInformation, termCondition }) => {
  const container = useRef();
  const header = useRef();
  const footer = useRef();
  const shakeGiftsBtn = useRef();

  const controlStickRef = useRef();
  const moveSpeedScaleRef = useRef(0);
  const grabbingRef = useRef({
    grabbingState: GrabbingState.OPEN_CLAW,
    pauseStartTime: 0,
  });
  const shouldKickGift = useRef(false);

  const setGrabbingState = state => {
    grabbingRef.current.grabbingState = state;
    grabbingRef.current.pauseStartTime = 0;
    setControlEnabled(state === GrabbingState.IDLE);
  };

  const gameContent = useRef();
  const gameCores = useRef();
  const gameContentWrapper = useRef();
  const gameApp = useRef();
  const reflectionGlass = useRef();
  const [gameData, setGameData] = useState({ ...gameInformation });
  const [controlEnabled, setControlEnabled] = useState(true);

  const textures = useRef();
  const particles = useRef({});

  const [imgsLoaded, setImgsLoaded] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [isGettingGift, setIsGettingGift] = useState(false);
  const [isShowErrorPopup, setIsShowErrorPopup] = useState(false);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [showPopupTC, setShowPopupTC] = useState(false);
  const [showPopupDesc, setShowPopupDesc] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [successModalGrowPos, setSuccessModalGrowPos] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const onBackPress = () => {
      setShowPopupDesc(false);
      setShowPopupTC(false);

      return showPopupTC || showPopupDesc;
    };
    addNativeEventListener("hardwareBackPress", onBackPress);

    return () => removeNativeEventListener("hardwareBackPress", onBackPress);
  }, [showPopupDesc, showPopupTC]);

  // Better Luck Next Time
  const [prize, setPrize] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [shouldResetGame, setShouldResetGame] = useState(true);

  const [gameKey, setGameKey] = useState(0);
  const optionsRef = useRef({});
  const options = optionsRef.current;

  const checkAvailable = useCallback(
    (showErrPopup = false) => {
      //number play game
      if (gameData.availableChances <= 0) {
        if (showErrPopup) {
          setIsShowErrorPopup(true);
          setErrorMessage(
            "Oops, you do not have sufficient chance(s) to play this game."
          );
          setShouldResetGame(false);
        }

        return false;
      }

      return true;
    },
    [gameData.availableChances]
  );

  const onPick = () => {
    if (grabbingRef.current.grabbingState === GrabbingState.IDLE) {
      if (checkAvailable(true)) {
        setControlEnabled(false);
        shouldKickGift.current =
          Math.random() >= (gameInformation.catchingProbability ?? 100) / 100;
        grabbingRef.current.grabbingState = GrabbingState.LOWER_CLAW;
      }
    }
  };

  const getPrize = async gift => {
    revealGift(gift, getGameResult, ({ isSuccess, content }) => {
      playParticleAtPos(particles.current.explosion, gift.position);

      if (isSuccess) {
        setPrize(content);
        setIsShowPopup(true);
      } else {
        setErrorMessage(content);
        setIsShowErrorPopup(true);
      }

      setShouldResetGame(true);
      setIsGettingGift(false);
    });
  };

  // load all images
  useEffect(() => {
    Promise.all([
      AssetsLoader.loadImages(imgs),
      AssetsLoader.loadTextures(gameImgs),
    ]).then(([_, loadedTextures]) => {
      textures.current = loadedTextures;
      setImgsLoaded(true);
    });
  }, []);

  // Control event listeners
  useEffect(() => {
    const controlStick = controlStickRef?.current;
    if (controlStick) {
      const MAX_CONTROL_STICK_ANGLE = 30;
      let angle, controlStickRect, axis, offsetAngle;
      let isControlling = false;
      let controlStickAnimation = null;

      const getAngle = touchPoint =>
        Math.abs(
          (Math.atan2(
            axis.y - touchPoint.clientY,
            axis.x - touchPoint.clientX
          ) *
            180) /
            Math.PI
        ) - 90;

      const handleMouseDown = e => {
        angle = 0;
        controlStickRect = controlStick.getBoundingClientRect();
        axis = {
          x: controlStickRect.x + controlStickRect.width / 2,
          y: controlStickRect.bottom,
        };

        const touchPoint = "changedTouches" in e ? e.changedTouches[0] : e;
        offsetAngle = getAngle(touchPoint);

        if (
          checkAvailable(true) &&
          grabbingRef.current.grabbingState <= GrabbingState.IDLE &&
          !controlStickAnimation
        )
          isControlling = true;
      };
      const handleMouseMove = e => {
        if (
          grabbingRef.current.grabbingState <= GrabbingState.IDLE &&
          isControlling
        ) {
          const touchPoint = "changedTouches" in e ? e.changedTouches[0] : e;

          angle = Common.clamp(
            getAngle(touchPoint) - offsetAngle,
            -MAX_CONTROL_STICK_ANGLE,
            MAX_CONTROL_STICK_ANGLE
          );

          controlStick.style.transform = `rotate(${angle}deg)`;
          moveSpeedScaleRef.current = angle / MAX_CONTROL_STICK_ANGLE;
        }
      };
      const handleMouseUp = () => {
        if (
          grabbingRef.current.grabbingState <= GrabbingState.IDLE &&
          isControlling
        ) {
          const strength = angle / MAX_CONTROL_STICK_ANGLE;

          isControlling = false;
          moveSpeedScaleRef.current = 0;
          controlStickAnimation = controlStick.animate(
            [
              { transform: `rotate(${angle}deg)` },
              { transform: `rotate(${strength * -10}deg)`, offset: 0.175 },
              { transform: `rotate(${strength * 5}deg)`, offset: 0.3812 },
              { transform: `rotate(${strength * -2}deg)`, offset: 0.6875 },
              { transform: "rotate(0deg)" },
            ],
            {
              duration: 300,
              fill: "forwards",
            }
          );
          controlStickAnimation.onfinish = () => {
            controlStickAnimation?.cancel();
            controlStick.style.transform = "";
            controlStickAnimation = null;
          };
        }
      };

      controlStick.addEventListener("mousedown", handleMouseDown);
      controlStick.addEventListener("touchstart", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);

      return () => {
        controlStick.removeEventListener("mousedown", handleMouseDown);
        controlStick.removeEventListener("touchstart", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [checkAvailable]);

  // Physics
  const setup = useCallback(canvas => {
    const containerHeight = container.current.getBoundingClientRect().height;
    const headerHeight = header.current.getBoundingClientRect().height;
    const footerHeight = footer.current.getBoundingClientRect().height;

    const gameContentWidth = Math.min(window.innerWidth, CONTAINER_MAX_WIDTH);
    const gameContentHeight = containerHeight - (headerHeight + footerHeight);

    gameContentWrapper.current.style.width = gameContentWidth + "px";
    gameContentWrapper.current.style.height = gameContentHeight + "px";

    const engine = Engine.create();
    const render = Render.create({
      canvas: canvas,
      engine: engine,
      renderer: gameApp.current,
      pixiOptions: {
        resizeTo: gameContentWrapper.current,
        useContextAlpha: false,
      },
      options: {
        width: gameContentWidth,
        height: gameContentHeight,
        pixelRatio: DEBUG ? 1 : "auto",
        wireframes: false,
        wireframeBackground: false,
        ...(DEBUG
          ? {
              showAngleIndicator: true,
              showCollisions: true,
            }
          : {
              background: gameContentBgImg,
            }),
      },
    });
    const runner = Runner.create();

    // Particle effects
    const explosionEmitter = new Emitter(
      render.frontParticleContainer,
      createParticlesConfig(explosion, Texture.WHITE)
    );
    particles.current.explosion = explosionEmitter;

    const glowStartEmitter = new Emitter(
      render.backParticleContainer,
      createParticlesConfig(glowStars, textures.current.glowStarImg)
    );
    particles.current.glowStars = glowStartEmitter;

    if (!gameApp.current) {
      gameApp.current = render.renderer;
    }

    // Setup options with scaling
    const scaling = Math.min(
      render.renderer.screen.width * CANVAS_SCALING_FACTOR,
      render.renderer.screen.height * CANVAS_SCALING_FACTOR,
      MAX_SCALING
    );
    Object.assign(optionsRef.current, createOptions(scaling));
    optionsRef.current.screenMaxWidth = CONTAINER_MAX_WIDTH;

    setupCreation(optionsRef.current, textures.current, DEBUG);
    setupAction(optionsRef.current, moveSpeedScaleRef, grabbingRef);

    return { engine, render, runner };
  }, []);

  const checkGiftAndFinish = (giftDetector, gifts) => {
    checkGift(
      giftDetector,
      gifts,
      () => setGrabbingState(GrabbingState.FINISH),
      async (isCollided, collidedGift) => {
        if (isCollided) {
          const { top, left } = gameContent.current.getBoundingClientRect();

          setSuccessModalGrowPos({
            x: left + giftDetector.position.x,
            y: top + giftDetector.position.y,
          });

          playParticleAtPos(particles.current.glowStars, giftDetector.position);
          await getPrize(collidedGift);
        } else {
          setGrabbingState(GrabbingState.OPEN_CLAW);
        }
      }
    );
  };

  useEffect(() => {
    if (imgsLoaded && container.current && header.current && footer.current) {
      finishGameLoading();
      hideNativeHeader();
      setGameLoaded(true);
    }
  }, [finishGameLoading, imgsLoaded, setup]);

  useEffect(() => {
    if (!gameLoaded) return;

    const canvas = gameContent.current;
    const { engine, render, runner } = (gameCores.current = setup(canvas));

    const gifts = createGifts(gameApp.current.screen);
    const boundaries = createBoundaries(gameApp.current.screen);
    const crane = createCrane(gameApp.current.screen, engine);

    setGrabbingState(GrabbingState.ENTRANCE);

    const stopDetector = crane.hand.stopDetector;
    Events.on(engine, "collisionStart", e => {
      for (const pair of e.pairs) {
        stopDetector.giftDetected =
          (pair.bodyA === stopDetector.giftDetector &&
            pair.bodyB.label === "gift") ||
          (pair.bodyB === stopDetector.giftDetector &&
            pair.bodyA.label === "gift");

        if (stopDetector.giftDetected) break;
      }

      for (const pair of e.pairs) {
        stopDetector.groundDetected =
          (pair.bodyA === stopDetector.groundDetector &&
            pair.bodyB.label === "ground") ||
          (pair.bodyB === stopDetector.groundDetector &&
            pair.bodyA.label === "ground");

        if (stopDetector.groundDetected) break;
      }
    });

    Events.on(engine, "beforeUpdate", e => {
      updateTweens(e.delta);
      maintainFingersGap(crane.hand);

      switch (grabbingRef.current.grabbingState) {
        case GrabbingState.ENTRANCE:
          if (
            !entranceLowerCrane(crane, e.delta) & !openClaw(crane.hand, e.delta)
          )
            setGrabbingState(GrabbingState.IDLE);
          break;
        case GrabbingState.OPEN_CLAW:
          if (!openClaw(crane.hand, e.delta))
            setGrabbingState(GrabbingState.IDLE);
          break;
        case GrabbingState.IDLE:
          moveCrane(gameApp.current.screen, crane.base, e.delta);
          break;
        case GrabbingState.LOWER_CLAW:
          if (
            !pause(options.speed.clawLowerPause, e.delta) &&
            !lowerClaw(crane.rope, crane.hand.stopDetector, e.delta)
          )
            setGrabbingState(GrabbingState.CLOSE_CLAW);
          break;
        case GrabbingState.CLOSE_CLAW:
          if (
            !pause(options.speed.clawGrabPause, e.delta) &&
            !closeClaw(crane.hand, e.delta)
          )
            setGrabbingState(GrabbingState.RAISE_CLAW);
          break;
        case GrabbingState.RAISE_CLAW:
          if (
            !pause(options.speed.clawRaisePause, e.delta) &&
            !raiseClaw(crane.rope, e.delta)
          )
            setGrabbingState(GrabbingState.CHECK_GIFT);
          break;
        case GrabbingState.CHECK_GIFT:
          checkGiftAndFinish(crane.hand.giftDetector, gifts.bodies);
          break;
        default: // do nothing
      }

      removeExtraGrabbingGifts(
        shouldKickGift.current,
        crane.hand,
        gifts.bodies,
        e.delta
      );

      dropGrabbingGiftRandomly(
        shouldKickGift.current,
        crane.hand,
        gifts.bodies,
        e.delta
      );

      helpSurvivedGiftFitInsideCrane();
    });

    // shake event
    const shakeListener = throttle(e => {
      if (
        checkAvailable() &&
        grabbingRef.current.grabbingState === GrabbingState.IDLE
      ) {
        let pos;
        if (e) {
          pos = { x: e.offsetX, y: e.offsetY };
          playParticleAtPos(particles.current.explosion, pos);
        }

        shakeGifts(engine, gifts.bodies, crane.hand.lower, pos);
        setControlEnabled(false);
        setTimeout(
          () => setControlEnabled(true),
          options.shake.throttleInterval
        );
      }
    }, options.shake.throttleInterval);
    const debugShakeBtn = shakeGiftsBtn.current;
    const reflectionRef = reflectionGlass.current;
    const debugShakeListener = () => {
      shakeGifts(engine, gifts.bodies, crane.hand.lower);
    };

    reflectionRef?.addEventListener("click", shakeListener);

    if (DEBUG) {
      debugShakeBtn?.addEventListener("click", debugShakeListener);

      // mouse control
      const mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
          mouse: mouse,
          constraint: {
            stiffness: 0.2,
            render: {
              visible: false,
            },
          },
        });

      Composite.add(engine.world, mouseConstraint);
      render.mouse = mouse;
    }

    World.add(engine.world, [boundaries, crane, gifts]);
    Render.run(render);

    return () => {
      Events.off(render);
      Events.off(engine);

      debugShakeBtn?.removeEventListener("click", debugShakeListener);
      reflectionRef?.removeEventListener("click", shakeListener);

      World.remove(engine.world, engine.world, true);
      World.clear(engine.world, false, true);
      Engine.clear(engine);

      gameApp.current?.stage.removeAllListeners();
      gameApp.current?.stage.removeChildren(0);
      Render.clear(render);

      Runner.stop(runner);

      gameCores.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup, checkAvailable, gameKey, gameLoaded]);

  useEffect(() => {
    if (!showSplash && gameLoaded && gameCores.current) {
      const { runner, engine } = gameCores.current;
      Runner.run(runner, engine);
    }
  }, [showSplash, gameKey, gameLoaded]);

  return (
    <div ref={container} className="game-container">
      {isGettingGift && (
        <div className="loading-overlay">
          <div className="loading-ring" />
        </div>
      )}
      <div ref={header} className="game-header">
        <img
          draggable="false"
          className="game-header-img"
          src={gameHeaderImg}
          alt="game header background"
        />

        <img className="game-header-logo" src={clawzLogoImg} alt="game logo" />

        {DEBUG && (
          <button className="debug__shake-btn" ref={shakeGiftsBtn}>
            Shake gifts
          </button>
        )}
      </div>

      <div ref={gameContentWrapper} className="game-content-wrapper">
        <canvas ref={gameContent} className="game-content" />

        <img
          ref={reflectionGlass}
          style={DEBUG ? { display: "none" } : undefined}
          draggable="false"
          className="game-reflection-layer"
          src={reflectionLayerImg}
          alt="game reflection layer"
        />
        <img
          style={DEBUG ? { display: "none" } : undefined}
          draggable="false"
          className="game-frame game-frame-left"
          src={leftFrameImg}
          alt="game frame left"
        />
        <img
          style={DEBUG ? { display: "none" } : undefined}
          draggable="false"
          className="game-frame game-frame-right"
          src={rightFrameImg}
          alt="game frame right"
        />
      </div>

      <div ref={footer} className="game-footer">
        <img
          className="game-footer-bg"
          alt="game footer background"
          src={gameFooterImg}
        />

        <div className="game-footer-main">
          <div className="control-area">
            <div className="control-part">
              <div className="control-stick-base">
                <div className="control-stick-mask">
                  <img
                    ref={controlStickRef}
                    draggable="false"
                    className="control-stick"
                    src={leverTopImg}
                    alt="control lever"
                  />
                </div>
              </div>

              <p className="control-guide-text">Move &#60; &#62;</p>
            </div>

            <div
              className="text-chance"
              style={{ color: gameData.chanceTextColor }}
            >
              <p className="chance-num">{gameData.availableChances}</p>
              <p className="chance">
                {gameData.availableChances === 1 ? "token" : "tokens"}
              </p>
            </div>

            <div className="control-part">
              <button
                className={`button-grab ${controlEnabled ? "" : "disabled"}`}
                onClick={onPick}
              />

              <p className="control-guide-text">Catch</p>
            </div>
          </div>

          <div className="info-area">
            <img
              className="gr-logo-img"
              src={GRLogoImg}
              alt="Great Rewards logo"
            />
          </div>
        </div>
      </div>

      <SuccessModal
        showModal={isShowPopup}
        prize={prize}
        growPos={successModalGrowPos}
        route40={"route40"}
        onAgain={() => {
          if (shouldResetGame) setGameKey(key => key + 1);
          setIsShowPopup(false);
          setGameData(pre => ({
            ...pre,
            availableChances: pre.availableChances - 1,
          }));
        }}
      />
      <ErrorModal
        showModal={isShowErrorPopup}
        route40={"route40"}
        opaciti01={"opaciti01"}
        errorMsg={errorMessage}
        onClose={() => {
          if (shouldResetGame) setGameKey(key => key + 1);
          setIsShowErrorPopup(false);
        }}
      />

      <svg width="0" height="0">
        <defs>
          <clipPath id="controlLeverBasePath" clipPathUnits="objectBoundingBox">
            <path d="m 0,-0.03226722 h 1 v 0.9578797 H 0 Z m 0.59934945,0.95417868 c 0,0.025284 -0.0443779,0.045822 -0.0991568,0.045822 -0.0547789,0 -0.0991568,-0.020538 -0.0995421,-0.045822 z" />
          </clipPath>
        </defs>
      </svg>

      {showSplash && (
        <div className="splash-screen">
          <img className="splash-img" src={splashTopImg} alt="Splash top" />
          <img
            className="splash-img"
            src={splashLogoImg}
            alt="Great Rewards splash logo"
          />
          <img
            className="splash-img"
            src={splashBottomImg}
            alt="Splash bottom"
          />

          <button
            className="image-button play-button"
            onClick={() => setShowSplash(false)}
          >
            <img src={playBtnImg} alt="Play button" />
          </button>
          <button
            className="image-button tnc-button"
            onClick={() => setShowPopupTC(true)}
          >
            Terms & conditions apply.
          </button>
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
        onClose={() => {
          setShowPopupTC(false);
        }}
      />

      <Description
        onlyPopup
        showPopup={showPopupDesc}
        description={gameInformation.description}
        onClose={() => {
          setShowPopupDesc(false);
        }}
      />
    </div>
  );
};

export default ClawMachine;

const throttle = (func, delay) => {
  let prev = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - prev > delay) {
      prev = now;
      return func(...args);
    }
  };
};

const playParticleAtPos = (particle, pos) => {
  particle.resetPositionTracking();
  particle.updateSpawnPos(pos.x, pos.y);
  particle.playOnce();
};
