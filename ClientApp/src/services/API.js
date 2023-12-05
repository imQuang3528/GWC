import axios from "axios";

export const REACT_APP_BACKEND_URL = "https://members.greatrewards.com.sg/";
export const REACT_APP_BACKEND_URL_UAT = "https://gwc-uat.ascentis.com.sg/";

const instance = axios.create({
  baseURL: window.location.hostname.includes("uat")
    ? REACT_APP_BACKEND_URL_UAT
    : REACT_APP_BACKEND_URL,
});

instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error?.response?.status === 401) {
      window.localStorage.clear();
      document.querySelector(".button-spin").disabled = true;
      const invalidModal = document.querySelector(".invalidModal");
      invalidModal.style.display = "block";
    }
    if (error?.response?.status === 404) {
      document.querySelector(".button-spin").disabled = true;
    }

    return error;
  }
);

const dataCache = {};

export const getPublicGames = async token => {
  if (dataCache.publicGames) {
    return dataCache.publicGames;
  }

  const url = "/api/services/app/LuckyDip/GetPublicGames?token=" + token;

  const config = {
    headers: {
      "Content-Type": "application/json",
      "Asc.PosID": process.env.REACT_APP_MMS_AscPosID,
      Authorization: "VJD4zFiTJ6OHm6XVEu2P",
    },
  };

  const result = instance.get(url, config);
  dataCache.publicGames = result;

  return result;
};

export const getGameInfo = async token => {
  if (dataCache.gameInfo) {
    return dataCache.gameInfo;
  }

  const url = "/api/services/app/LuckyDip/GetGameInfo?token=" + token;
  const config = {
    headers: {
      "Content-Type": "application/json",
      "Asc.PosID": process.env.REACT_APP_MMS_AscPosID,
      Authorization: "VJD4zFiTJ6OHm6XVEu2P",
    },
    params: {
      LuckyDipId: window.localStorage.getItem("idGameInfo"),
      IncludeChances: true,
    },
  };

  const result = instance.get(url, config);
  dataCache.gameInfo = result;

  return result;
};

export const playGame = async token => {
  const tokenHeaders = {
    headers: {
      "Content-Type": "application/json",
      "Asc.PosID": process.env.REACT_APP_MMS_AscPosID,
      Authorization: "VJD4zFiTJ6OHm6XVEu2P",
    },
  };
  const tokenBody = JSON.stringify({
    chanceValueTypeCode: window.localStorage.getItem("chanceValueTypeCode"),
    luckyDipId: window.localStorage.getItem("idGameInfo"),
    clientSeed:
      Math.random().toString(36).substring(2, 7) + new Date().getTime(),
    token: token,
  });
  return instance.post(
    "/api/services/app/LuckyDip/PlayGame",
    tokenBody,
    tokenHeaders
  );
};

export const getGameCMS = async () => {
  const url = "/mallsmobile/api/graphql";
  const tokenHeaders = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "VJD4zFiTJ6OHm6XVEu2P",
    },
  };
  const gameData = {
    query: `{
        gameSetting {
          termsConditions
          displayText
          gameDescription
          gameCode
          gameEndDate
          gameName
          gameNameColor
          gameStartDate
          backgroundImage {
            paths
            urls
          }
          buttonColor
          buttonTextColor
          chanceTextColor
          chancesColor
          gameType
          descriptionTextColor
          scratchImage {
            paths
            urls
          }
          iconType {
            urls
          }
          catchingProbability
          leadershipBoard
          countdownTimer
          speed
        }
      }`,
  };
  return instance.post(url, gameData, tokenHeaders);
};

export const getProfile = async () => {
  if (dataCache.profile) {
    return dataCache.profile;
  }

  const query = new URLSearchParams(window.location.search);
  const tokenLocal = query.get("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      "Asc.PosID": process.env.REACT_APP_MMS_AscPosID,
      Authorization: "VJD4zFiTJ6OHm6XVEu2P",
    },
    params: { token: tokenLocal },
  };

  const result = await instance.get(
    "/api/services/app/Membership/GetProfile",
    config
  );
  dataCache.profile = result;

  return result;
};

export const storeScore = async data => {
  const tokenHeaders = {
    headers: {
      "Content-Type": "application/json",
      "Asc.PosID": process.env.REACT_APP_MMS_AscPosID,
      Authorization: "VJD4zFiTJ6OHm6XVEu2P",
    },
  };

  const [profile, gameInfo] = await Promise.all([getProfile(), getGameInfo()]);
  const tokenBody = JSON.stringify({
    MemberId: profile.data.Data.MemberId,
    GameId: gameInfo.data.result.code,
    MemberName: profile.data.Data.SurName + " " + profile.data.Data.Name,
    ...data,
  });

  return instance.post(
    "/api/GameScore/store-game-score",
    tokenBody,
    tokenHeaders
  );
};

export const getLeaderboard = async () => {
  const [profile, gameInfo] = await Promise.all([getProfile(), getGameInfo()]);
  const tokenBody = {
    headers: {
      "Content-Type": "application/json",
      "Asc.PosID": process.env.REACT_APP_MMS_AscPosID,
      Authorization: "VJD4zFiTJ6OHm6XVEu2P",
    },
    params: {
      memberId: profile.data.Data.MemberId,
      gameId: gameInfo.data.result.code,
    },
  };

  return instance.get("/api/GameScore/get-game-score", tokenBody);
};

export const getGamePrize = async data => {
  const query = new URLSearchParams(window.location.search);
  const tokenLocal = query.get("token");

  const tokenHeaders = {
    headers: {
      "Content-Type": "application/json",
      "Asc.PosID": process.env.REACT_APP_MMS_AscPosID,
      Authorization: "VJD4zFiTJ6OHm6XVEu2P",
    },
  };

  const gameInfo = await getGameInfo();
  const tokenBody = JSON.stringify({
    GameCode: gameInfo.data.result.code,
    AccessToken: tokenLocal,
    ChanceValueTypeCode: window.localStorage.getItem("chanceValueTypeCode"),
    LuckyDipId: window.localStorage.getItem("idGameInfo"),
    ClientSeed:
      Math.random().toString(36).substring(2, 7) + new Date().getTime(),
    ...data,
  });

  return instance.post(
    "/api/game/issued-game-voucher",
    tokenBody,
    tokenHeaders
  );
};
