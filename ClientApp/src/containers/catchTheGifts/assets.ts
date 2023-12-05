import bagFront from "./assets/bag-front.png";
import bagBack from "./assets/bag-back.png";
import emptyHeart from "./assets/empty-heart.png";
import fullHeart from "./assets/full-heart.png";
import background from "./assets/background.png";
import splashBaubles from "./assets/splash/baubles.png";
import splashTitle from "./assets/splash/title.png";
import splashPlayButton from "./assets/splash/play-button.png";
import splashChancesBox from "./assets/splash/chances-box.png";
import catchScore from "./assets/catchInfo/score.png";
import catchTimer from "./assets/catchInfo/timer.png";
import snow from "./assets/snow.png";
import bunchOfGifts from "./assets/bunch-of-gifts.png";
import gameOverFrame from "./assets/frame/game-over.png";
import scoreFrame from "./assets/frame/score.png";
import leaderboardFrame from "./assets/frame/leaderboard.png";
import homeButton from "./assets/button/home.png";
import leaderboardButton from "./assets/button/leaderboard.png";
import playAgainButton from "./assets/button/play-again.png";
import leaderboardScoreFrame from "./assets/leaderboard/score-frame.png";
import leaderboardUser from "./assets/leaderboard/user.png";
import loadingSpinner from "./assets/loading-spinner.png";
import tutorialPointer from "./assets/tutorial-pointer.png";
import warning from "./assets/warning.png";

export const textureImgs = {
  background,
  snow,
  bunchOfGifts,
  loadingSpinner,
  tutorialPointer,
  button: {
    home: homeButton,
    leaderboard: leaderboardButton,
    play: splashPlayButton,
    playAgain: playAgainButton,
  },
  frame: {
    gameOver: gameOverFrame,
    score: scoreFrame,
    leaderboard: leaderboardFrame,
  },
  leaderboard: {
    scoreFrame: leaderboardScoreFrame,
    user: leaderboardUser,
  },
  splash: {
    baubles: splashBaubles,
    title: splashTitle,
    chancesBox: splashChancesBox,
  },
  bag: {
    front: bagFront,
    back: bagBack,
  },
  catchInfo: {
    score: catchScore,
    timer: catchTimer,
  },
  hearts: {
    empty: emptyHeart,
    full: fullHeart,
  },
};

export const imgs = {
  warning,
};

export const fontFamilies = {
  quicksand: "Quicksand",
};

export const bitmapFontFamilies = {
  quicksandBitmap: "/assets/QuicksandBitmap.xml",
};
