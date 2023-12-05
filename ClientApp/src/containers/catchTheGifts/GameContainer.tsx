import { Container, useApp, _ReactPixi, useTick } from "@pixi/react";
import GiftEmitter, { GiftData, GiftTextures } from "./GiftEmitter";
import Bag, { BagRef } from "./Bag";
import { Texture, Resource, Ticker, Rectangle } from "pixi.js-legacy";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import InfoBox from "./InfoBox";
import { isCollided_RR } from "../../utils/collisionDetector";
import HealthBox, { HeartTextures } from "./HealthBox";
import Background from "./Background";
import { PAutosizeSprite } from "./helper/AutosizeSprite";
import Button from "./helper/Button";
import { Group } from "tweedle.js";
import Leaderboard from "./Leaderboard";
import Result, { PyroController } from "./Result";
import Splash, { SplashProps } from "./Splash";
import { getGameResultByScore } from "../../services/getGameResult";
import Over from "./Over";
import { storeScore } from "../../services/API";
import { useDelta } from "react-delta";
import CountdownStart from "./CountdownStart";

export type GameTextures = {
  background: Texture<Resource>;
  snow: Texture<Resource>;
  bunchOfGifts: Texture<Resource>;
  loadingSpinner: Texture<Resource>;
  tutorialPointer: Texture<Resource>;
  button: {
    home: Texture<Resource>;
    leaderboard: Texture<Resource>;
    play: Texture<Resource>;
    playAgain: Texture<Resource>;
  };
  frame: {
    gameOver: Texture<Resource>;
    score: Texture<Resource>;
    leaderboard: Texture<Resource>;
  };
  leaderboard: {
    scoreFrame: Texture<Resource>;
    user: Texture<Resource>;
  };
  splash: {
    baubles: Texture<Resource>;
    title: Texture<Resource>;
    chancesBox: Texture<Resource>;
  };
  catchInfo: {
    score: Texture<Resource>;
    timer: Texture<Resource>;
  };
  bag: {
    front: Texture<Resource>;
    back: Texture<Resource>;
  };
  gifts: GiftTextures;
  hearts: HeartTextures;
};

export type GameState =
  | "WAITING"
  | "TUTORIAL"
  | "COUNTDOWN_START"
  | "PLAYING"
  | "OVER"
  | "RESULT"
  | "LEADERBOARD";

type GameContextType = {
  state: GameState;
  screen: Rectangle;
  // Screen that contains the actual gameplay (constrainted to a ratio)
  mainScreen: Rectangle;
  // Helper to scale sprite size correctly. Please put this on every raw x, y, width and height's number
  s: {
    // Scale a number to real size
    (n: number): number;
    // Reverse scale a number to normalized size
    rev: (n: number) => number;
    // Scale all x, y, width and height in an object
    all: <
      T extends {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
      },
    >(
      obj: T
    ) => T;
    scale: number;
  };
  safeTop: number;
  fontFamily: string;
  bitmapFontFamily: string;
  textures: GameTextures;
};

export type GameContainerProps = _ReactPixi.IContainer & {
  textures: GameTextures;
  fontFamily: string;
  bitmapFontFamily: string;
  onTnC: () => void;
  onAllowPlay?: () => boolean | void;
  onResult?: (result: {
    isSuccess: boolean;
    content: string;
    data?: { MinusChance?: boolean };
  }) => void;
  pyroController?: PyroController;
  gameConfig: {
    winScore?: number;
    speed?: string;
  };
  enableLeaderboard?: boolean;
  chances: SplashProps["chances"];
} & (
    | {
        mode: "timeLimit";
        timeLimit: number; // s
      }
    | {
        mode: "endless";
      }
  );

export const GameContext = createContext<GameContextType>(
  {} as GameContextType // No need to worry about this
);

const GIFT_LAYER_ZINDEX = -2;
const HORIZONTAL_PADDING = 25;
const BAG_WIDTH = 140;
const BOTTOM_PADDING = 30;
const GAME_SCREEN_RATIO = 9 / 20;
const BASE_SCREEN_WIDTH = 390;

const SPACE_BETWEEN_GIFT_EMISSION = 280; // px
const ENDLESS_DIFFICULTY_INTERVAL = 20 * 1000; // ms
const ENDLESS_DIFFICULTY_TRANSITION_TIME = 15 * 1000; // ms
const TIME_LIMIT_DIFFICULTY_INTERVAL_PERCENT = 0.35;
const TIME_LIMIT_DIFFICULTY_TRANSITION_TIME_PERCENT = 0.27;
const MAX_HEALTH = 3;

const STOP_EMIT_TIME = 1.5; // s
const MIN_OVER_WAIT = 2; // s

function GameContainer(props: GameContainerProps) {
  const {
    textures,
    fontFamily,
    bitmapFontFamily,
    mode,
    onTnC,
    onAllowPlay,
    onResult,
    pyroController,
    enableLeaderboard,
    gameConfig: { winScore = 1, speed: speedStr },
    chances,
    ...rest
  } = props;
  const app = useApp();
  (globalThis as any).__PIXI_APP__ = app; // for debug devtool

  // constraint the screen to the aspect ratio
  const { screen, mainScreen, scale } = useMemo(() => {
    if (GAME_SCREEN_RATIO === undefined) {
      return { screen: app.screen, mainScreen: app.screen, scale: 1 };
    }

    const baseScreenHeight = BASE_SCREEN_WIDTH / GAME_SCREEN_RATIO;
    let mainScreen, scale;

    if (app.screen.width / app.screen.height < GAME_SCREEN_RATIO) {
      scale = app.screen.width / BASE_SCREEN_WIDTH;
      mainScreen = new Rectangle(
        0,
        app.screen.height / scale - baseScreenHeight,
        app.screen.width / scale,
        baseScreenHeight
      );
    } else {
      scale = app.screen.height / baseScreenHeight;
      mainScreen = new Rectangle(
        (app.screen.width / scale - BASE_SCREEN_WIDTH) / 2,
        0,
        BASE_SCREEN_WIDTH,
        app.screen.height / scale
      );
    }

    const screen = new Rectangle(
      app.screen.x / scale,
      app.screen.y / scale,
      app.screen.width / scale,
      app.screen.height / scale
    );

    return { screen, mainScreen, scale };
  }, [app.screen]);

  const s = useMemo(() => {
    const _s: GameContextType["s"] = n => n * scale;
    _s.scale = scale;
    _s.rev = n => n / scale;
    _s.all = obj => ({
      ...obj,
      ...("x" in obj
        ? { x: obj.x !== undefined ? _s(obj.x) : obj.x }
        : undefined),
      ...("y" in obj
        ? { y: obj.y !== undefined ? _s(obj.y) : obj.y }
        : undefined),
      ...("width" in obj
        ? { width: obj.width !== undefined ? _s(obj.width) : obj.width }
        : undefined),
      ...("height" in obj
        ? { height: obj.height !== undefined ? _s(obj.height) : obj.height }
        : undefined),
    });

    return _s;
  }, [scale]);

  const [safeTop, setSafeTop] = useState(0);
  useEffect(() => {
    let statusBarHeight = parseInt(
      getComputedStyle(document.body).getPropertyValue("--safe-top")
    );
    if (!statusBarHeight && statusBarHeight !== 0) statusBarHeight = 50;
    const headerHeight = 40;

    setSafeTop(s.rev(statusBarHeight + headerHeight));
  }, [s]);

  const [result, setResult] =
    useState<Parameters<NonNullable<GameContainerProps["onResult"]>>["0"]>();
  const [gifts, setGifts] = useState<GiftData[]>([]);
  const [bagX, setBagX] = useState(mainScreen.width / 2 - BAG_WIDTH / 2);
  const [state, setState] = useState<GameState>("WAITING");
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [health, setHealth] = useState(MAX_HEALTH);
  const [elapsed, setElapsed] = useState(0);

  const bagHeight =
    (BAG_WIDTH * textures.bag.back.height) / textures.bag.back.width;
  const bag = {
    width: BAG_WIDTH,
    height: bagHeight,
    x: bagX,
    y: mainScreen.height - bagHeight - BOTTOM_PADDING,
  };

  const bagRef = useRef<BagRef>(null);
  const scoreDelta = useDelta(score);
  const stateDelta = useDelta(state);

  useEffect(() => {
    if (scoreDelta && scoreDelta.prev !== undefined && !stateDelta) {
      bagRef.current?.showScoreGain(scoreDelta.curr - scoreDelta.prev);
    }
  }, [scoreDelta, state, stateDelta]);

  useTick(tick => {
    const delta = tick / Ticker.targetFPMS;

    setGifts(prevGifts => {
      let newGifts: typeof gifts | undefined;
      let newScore = score;
      prevGifts.forEach((gift, i) => {
        if (isCollided_RR(bag, gift)) {
          newScore += Number(gift.value) || 0;

          if (!newGifts) {
            newGifts = gifts.slice(0, i);
          }
        } else {
          newGifts?.push(gift);
        }
      });

      setScore(newScore);

      return newGifts || prevGifts;
    });

    const newElapsed = elapsed + delta;
    let newDifficulty = difficulty;
    let difficultyInterval, difficultyTransitionTime;

    if (mode === "endless") {
      difficultyInterval = ENDLESS_DIFFICULTY_INTERVAL;
      difficultyTransitionTime = ENDLESS_DIFFICULTY_TRANSITION_TIME;
    } else {
      difficultyInterval =
        TIME_LIMIT_DIFFICULTY_INTERVAL_PERCENT * props.timeLimit * 1000;
      difficultyTransitionTime =
        TIME_LIMIT_DIFFICULTY_TRANSITION_TIME_PERCENT * props.timeLimit * 1000;
    }

    newDifficulty = newElapsed / difficultyInterval;
    if (
      newElapsed % difficultyInterval <
      difficultyInterval - difficultyTransitionTime
    ) {
      newDifficulty = Math.trunc(newDifficulty);
    }
    setDifficulty(newDifficulty);

    if (mode === "timeLimit" && props.timeLimit * 1000 - newElapsed <= 0) {
      setState("OVER");
    }

    setElapsed(newElapsed);
  }, state === "PLAYING");

  useTick(tick => {
    const delta = tick / Ticker.targetFPMS;
    Group.shared.update(delta);
  });

  useEffect(() => {
    if (health === 0) setState("OVER");
  }, [health]);

  useEffect(() => {
    if (state === "OVER") {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - elapsed);

      const timeout = setTimeout(async () => {
        try {
          const getResult = async () => {
            const gameResult = await getGameResultByScore(score);
            setResult(gameResult);
          };
          const saveScore = async () => {
            if (enableLeaderboard) {
              await storeScore({
                CurrentHighestScore: score,
                StartTimeGame: startTime,
                EndTimeGame: endTime,
              });
            }
          };

          await Promise.all([getResult(), saveScore()]);
        } catch (e) {
          setResult({ isSuccess: false, content: "" });
        }

        setState(pre => (pre === "OVER" ? "RESULT" : pre));
      }, MIN_OVER_WAIT * 1000);

      return () => clearTimeout(timeout);
    }
  }, [elapsed, enableLeaderboard, score, state, winScore]);

  useEffect(() => {
    if (result) {
      onResult?.(result);
    }
  }, [onResult, result]);

  const handleBagXOffset = useCallback(
    (xOffset: number) => setBagX(pre => pre + xOffset),
    []
  );

  const [haveUserUnderstoodHowToPlay, setHaveUserUnderstoodHowToPlay] =
    useState(false);
  const startCountdown = useCallback(() => {
    setHaveUserUnderstoodHowToPlay(true);

    // Let the user be ready
    setTimeout(() => {
      setState("COUNTDOWN_START");
    }, 500);
  }, []);
  const startGame = useCallback(() => {
    setState("PLAYING");
  }, []);

  const handlePlay = () => {
    if (!(onAllowPlay?.() ?? true)) {
      return;
    }

    setGifts([]);
    setBagX(mainScreen.width / 2 - BAG_WIDTH / 2);
    setScore(0);
    setDifficulty(0);
    setHealth(MAX_HEALTH);
    setElapsed(0);

    if (haveUserUnderstoodHowToPlay) {
      setState("COUNTDOWN_START");
    } else {
      setState("TUTORIAL");
    }
  };

  const displayElapsed = elapsed / 1000;
  let displayTime =
    mode === "timeLimit" ? props.timeLimit - displayElapsed : displayElapsed;
  if (displayTime < 0 || state === "OVER") displayTime = 0;

  let [startSpeed, increaseSpeed] =
    speedStr?.split("_").map(speed => Number(speed)) || [];
  if (startSpeed === undefined || isNaN(startSpeed)) startSpeed = 200;
  if (increaseSpeed === undefined || isNaN(increaseSpeed)) increaseSpeed = 160;

  const giftFallingSpeed = startSpeed + increaseSpeed * difficulty;

  return (
    <GameContext.Provider
      value={{
        state,
        screen,
        mainScreen,
        s,
        safeTop,
        fontFamily,
        bitmapFontFamily,
        textures,
      }}
    >
      <Container interactiveChildren={false}>
        <Background texture={textures.background} {...s.all(screen)} />

        <PAutosizeSprite
          boundary={screen}
          texture={textures.snow}
          width={screen.width}
          bottom={
            state === "WAITING"
              ? -20
              : state === "RESULT" || state === "LEADERBOARD"
              ? -160
              : -280
          }
        />

        {(state === "WAITING" ||
          state === "RESULT" ||
          state === "LEADERBOARD") && (
          <PAutosizeSprite
            boundary={screen}
            texture={textures.bunchOfGifts}
            width={screen.width * (state === "WAITING" ? 0.9 : 0.7)}
            flow="centerHorizontal"
            bottom={state === "WAITING" ? 110 : 60}
          />
        )}
      </Container>

      <Container {...s.all(mainScreen)} {...rest} sortableChildren>
        <GiftEmitter
          key={(state === "PLAYING") + ""}
          gifts={gifts}
          onGiftsUpdated={setGifts}
          giftTextures={textures.gifts}
          zIndex={GIFT_LAYER_ZINDEX}
          maxSize={40}
          maxRandomAngle={45}
          emitRate={
            displayTime > STOP_EMIT_TIME
              ? SPACE_BETWEEN_GIFT_EMISSION / giftFallingSpeed
              : Infinity
          }
          fallingSpeed={giftFallingSpeed}
          doubleEmitChance={0.1 + 0.15 * difficulty}
          escapeGap={BAG_WIDTH + 30}
          horizontalPadding={HORIZONTAL_PADDING}
        />
        {["TUTORIAL", "COUNTDOWN_START", "PLAYING", "OVER"].includes(state) && (
          <Bag
            ref={bagRef}
            textures={textures.bag}
            middleZIndex={GIFT_LAYER_ZINDEX}
            horizontalPadding={HORIZONTAL_PADDING}
            {...bag}
            onXOffset={handleBagXOffset}
            enableTutorial={!haveUserUnderstoodHowToPlay}
            tutorialPointer={textures.tutorialPointer}
            haveUserUnderstood={haveUserUnderstoodHowToPlay}
            onMaybeUserHaveUnderstoodHowToPlayTheGame={startCountdown}
          />
        )}

        {mode === "endless" && (
          <HealthBox
            x={mainScreen.x + mainScreen.width * 0.2}
            y={25}
            width={mainScreen.width * 0.6}
            height={50}
            maxHealth={MAX_HEALTH}
            health={health}
            heartTextures={textures.hearts}
          />
        )}
      </Container>

      <InfoBox
        content={displayTime.toFixed(2).padStart(5, "0")}
        boundary={screen}
        bgTexture={textures.catchInfo.timer}
        contentStyle={{ tint: "#ff1ba3" }}
        contentPadding={{ left: 30, top: -4 }}
        height={40}
        top={safeTop + 10}
        left={12}
        alpha={state === "WAITING" ? 0 : 1}
        interactiveChildren={false}
      />
      <InfoBox
        content={score}
        boundary={screen}
        bgTexture={textures.catchInfo.score}
        contentStyle={{ tint: "#ff1ba3" }}
        contentPadding={{ left: 87, top: -4 }}
        height={40}
        top={safeTop + 10}
        right={12}
        alpha={state === "WAITING" ? 0 : 1}
        interactiveChildren={false}
      />

      {state === "WAITING" && (
        <Splash
          textures={{ ...textures.splash, playButton: textures.button.play }}
          chances={chances}
          onPlay={handlePlay}
          onTnC={onTnC}
        />
      )}

      {state === "COUNTDOWN_START" && (
        <CountdownStart countdownStartNumber={3} onCountdownOver={startGame} />
      )}

      {state === "OVER" && (
        <Over
          textures={{
            gameOver: textures.frame.gameOver,
            loadingSpinner: textures.loadingSpinner,
          }}
        />
      )}

      {state === "RESULT" && (
        <Result
          frameTexture={textures.frame.score}
          score={score}
          winScore={winScore}
          isSuccess={result?.isSuccess}
          content={result?.content}
          pyroController={pyroController}
        />
      )}

      {state === "LEADERBOARD" && (
        <Leaderboard
          textures={{
            frame: textures.frame.leaderboard,
            ...textures.leaderboard,
          }}
        />
      )}

      {(state === "RESULT" || state === "LEADERBOARD") &&
        (chances.available > 0 ? (
          <Button
            boundary={screen}
            texture={textures.button.playAgain}
            height={40}
            flow="centerHorizontal"
            bottom={85}
            onPress={handlePlay}
          />
        ) : (
          <Button
            boundary={screen}
            texture={textures.button.home}
            height={40}
            flow="centerHorizontal"
            bottom={85}
            onPress={() => {
              setState("WAITING");
            }}
          />
        ))}
      {enableLeaderboard && state === "RESULT" && (
        <Button
          boundary={screen}
          texture={textures.button.leaderboard}
          height={50}
          flow="centerHorizontal"
          bottom={30}
          onPress={() => {
            setState("LEADERBOARD");
          }}
        />
      )}
    </GameContext.Provider>
  );
}

export default GameContainer;
