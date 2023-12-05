import { soundAsset } from "@pixi/sound";
import { Application, Text, Texture, Ticker, extensions } from "pixi.js-legacy";
import { useCallback, useEffect, useRef, useState } from "react";
import { Group } from "tweedle.js";
import { getGameResult } from "../../services/getGameResult";
import Description from "../description";
import ErrorModal from "../errorModal";
import SuccessModal from "../successModal";
import TermCondition from "../termCondition";
import { FONT_FAMILIES, SOUNDS, TEXTURES } from "./const/assets";
import {
  CANNON_CONFIG,
  CLOUD_CONFIG,
  ENEMY_CONFIG,
  GROUND_COLOR,
  PROJECTILE_CONFIG,
} from "./const/objects";
import "./index.css";
import Background from "./objects/Background";
import Cannon from "./objects/Cannon";
import EnemyGroup from "./objects/EnemyGroup";
import GameObject from "./objects/GameObject";
import Ground from "./objects/Ground";
import ProjectileCollisionHandler from "./objects/ProjectileCollisionHandler";
import DynamicPoint from "./utils/helpers/DynamicPoint";
import DynamicRectangle from "./utils/helpers/DynamicRectangle";
import RandomPick from "./utils/helpers/RandomPick";
import { inBound } from "./utils/helpers/helpers";
import AssetsLoader from "../../utils/AssetsLoader";

// Pixi sound assets support
extensions.add(soundAsset);

type BubbleShooterProps = {
  finishGameLoading: () => void;
  gameInformation: {
    availableChances: number;
    description: string;
    chanceTextColor?: string;
    backgroundImage?: string;
  };
  termCondition: string;
};

const SAFE_AREA_TOP = 20;

function BubbleShooter({
  finishGameLoading,
  gameInformation,
  termCondition,
}: BubbleShooterProps) {
  const [gameContainer, setGameContainer] = useState<HTMLDivElement | null>();

  const [backgroundImg, setbackgroundImg] = useState("");
  const [chancesText, setChancesText] = useState<Text>();
  const [cannon, setCannon] = useState<Cannon>();
  const [gameChances, setGameChances] = useState(
    gameInformation.availableChances
  );
  const allowPlayRef = useRef(false);

  const [prize, setPrize] = useState("");
  const [shouldResetGame, setShouldResetGame] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopupTC, setShowPopupTC] = useState(false);
  const [showPopupDesc, setShowPopupDesc] = useState(false);
  const [isShowErrorPopup, setIsShowErrorPopup] = useState(false);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [isGettingGift, setIsGettingGift] = useState(false);

  useEffect(() => {
    if (chancesText) chancesText.text = `You have ${gameChances} chances`;
    allowPlayRef.current = gameChances > 0;
  }, [chancesText, gameChances]);

  const getPrize = async () => {
    let loading = true;
    setTimeout(() => {
      if (loading) setIsGettingGift(true);
    }, 2000);

    const { isSuccess, content } = await getGameResult();

    if (isSuccess) {
      setPrize(content);
      setIsShowPopup(true);
    } else {
      setErrorMessage(content);
      setIsShowErrorPopup(true);
    }

    setShouldResetGame(true);
    loading = false;
    setIsGettingGift(false);
  };

  const loadAssets = useCallback(async () => {
    const images = {
      background: gameInformation?.backgroundImage || TEXTURES.background,
    };

    return {
      images: await AssetsLoader.loadImages(images),
      textures: await AssetsLoader.loadTextures(TEXTURES),
      sounds: await AssetsLoader.loadSounds(SOUNDS),
      fontFamilies: await AssetsLoader.loadFontFamilies(FONT_FAMILIES),
    };
  }, [gameInformation.backgroundImage]);

  useEffect(() => {
    if (gameContainer) {
      const game = new Application<HTMLCanvasElement>({
        resizeTo: window,
        resolution: Math.floor(window.devicePixelRatio || 1),
        autoDensity: true,
        backgroundAlpha: 0,
      });
      gameContainer.appendChild(game.view);

      // For debugging tool: https://chrome.google.com/webstore/detail/pixijs-devtools/aamddddknhcagpehecnhphigffljadon
      (globalThis as any).__PIXI_APP__ = game;

      const stage = new GameObject(game.stage);
      stage.container.eventMode = "static";
      stage.container.hitArea = game.screen;

      loadAssets().then(({ images, textures, sounds, fontFamilies }) => {
        setbackgroundImg(images.background.src);

        finishGameLoading();

        // Background
        const background = new Background(game.screen, Texture.EMPTY, {
          textures: new RandomPick([
            textures.cloud1,
            textures.cloud2,
            textures.cloud3,
            textures.cloud4,
          ]),
          ...CLOUD_CONFIG,
        });

        // Enemies
        const enemyGroup = new EnemyGroup(
          new DynamicRectangle(rect => {
            rect.x = 0;
            rect.y = SAFE_AREA_TOP;
            rect.width = game.screen.width;
            rect.height = game.screen.height * 0.4;
          }, game.ticker),
          new RandomPick([
            textures.ball1,
            textures.ball2,
            textures.ball3,
            textures.ball4,
          ]),
          { ...ENEMY_CONFIG, fallingStopY: game.screen.height }
        );

        // Ground
        const ground = new Ground(
          new DynamicRectangle(rect => {
            rect.width = game.screen.width;
            rect.height = 150;
            rect.x = 0;
            rect.y = game.screen.height - rect.height;
          }, game.ticker),
          GROUND_COLOR
        );

        stage.addChild(background, enemyGroup, ground);

        // Cannon
        const cannon = new Cannon(
          {
            front: textures.cannonFront,
            back: textures.cannonBack,
            wheel: textures.cannonWheel,
            fireEffect: textures.spark,
          },
          {
            ...CANNON_CONFIG,
            projectileConfig: {
              texture: textures.projectile,
              explosionTexture: textures.spark,
              ...PROJECTILE_CONFIG,
            },
          },
          stage.container,
          {
            fire: sounds.cannonFire,
            projectileExplode: sounds.projectileExplode,
            reload: sounds.cannonReload,
          }
        );
        cannon.groundPoint = new DynamicPoint(p => {
          if (ground.bounds) {
            p.x = ground.bounds.width / 2;
            p.y = ground.bounds.height / 3;
          }
        }, game.ticker);
        cannon.checkInBounds = projectile => inBound(game.screen, projectile);
        cannon.onInteraction = () => {
          if (!allowPlayRef.current) {
            setIsShowErrorPopup(true);
            setErrorMessage(
              "Oops, you do not have sufficient chance(s) to play this game."
            );
            setShouldResetGame(false);
          }

          return allowPlayRef.current;
        };

        setCannon(cannon);

        ground.addChild(cannon);

        // Chances text
        const chancesTextObj = new Text("", {
          fontFamily: fontFamilies.tiltWarp,
          fontSize: 16,
          fill: gameInformation?.chanceTextColor || "white",
          align: "center",
        });

        const chancesText = {
          setup: () => {},
          update: () => {
            chancesTextObj.anchor.set(0.5);
            chancesTextObj.x = ground.backgroundSprite.width / 2;
            chancesTextObj.y = 65;
          },
        };
        setChancesText(chancesTextObj);

        ground.addChild(chancesTextObj);

        // Collision handling
        const collisionHandler = new ProjectileCollisionHandler(
          game.screen,
          cannon.projectile,
          enemyGroup.enemies
        );
        collisionHandler.onCollide = () => {
          getPrize();
        };

        // Setup
        const gameObjs = [background, enemyGroup, ground, cannon, chancesText];
        gameObjs.forEach(o => o.setup());

        // Game loop
        game.ticker.add(tick => {
          const delta = tick / Ticker.targetFPMS;
          gameObjs.forEach(o => o.update(delta));
          collisionHandler.update();
          Group.shared.update();
        });
      });

      return () => {
        Group.shared.removeAll();
        stage.container.removeAllListeners();
        game.destroy(true, true);
      };
    }
  }, [
    finishGameLoading,
    gameContainer,
    gameInformation?.chanceTextColor,
    loadAssets,
  ]);

  return (
    <>
      {isGettingGift && (
        <div className="loading-overlay">
          <div className="loading-ring" />
        </div>
      )}

      <div
        ref={setGameContainer}
        id="game-container"
        style={{ backgroundImage: `url("${backgroundImg}")` }}
      />

      <div className="bottom-box-term">
        <button
          className="button-footer button-gradient termBtn"
          onClick={() => {
            setShowPopupDesc(true);
          }}
        >
          Description
        </button>

        <button
          className="button-footer button-gradient termBtn"
          onClick={() => {
            setShowPopupTC(true);
          }}
        >
          Terms & Conditions
        </button>
      </div>

      <Description
        onlyPopup
        showPopup={showPopupDesc}
        description={gameInformation.description}
        onClose={() => {
          setShowPopupDesc(false);
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

      <SuccessModal
        showModal={isShowPopup}
        prize={prize}
        route40={"route40"}
        onAgain={() => {
          if (shouldResetGame) cannon?.reset();
          setIsShowPopup(false);
          setGameChances(pre => pre - 1);
        }}
      />
      <ErrorModal
        showModal={isShowErrorPopup}
        route40={"route40"}
        errorMsg={errorMessage}
        onClose={() => {
          if (shouldResetGame) cannon?.reset();
          setIsShowErrorPopup(false);
        }}
      />
    </>
  );
}

export default BubbleShooter;
