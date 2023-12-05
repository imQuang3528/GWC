import { getGamePrize, playGame } from "./API";

// number of attempts to recall play game API if "MAXIMUM VOUCHER ISSUANCE LIMIT EXCEEDED" error shows up
const VOUCHER_ISSURANCE_EXCEEDED_ATTEMPTS = 4;

export const getGameResult = async () => {
  const query = new URLSearchParams(window.location.search);
  const tokenLocal = query.get("token");
  let res;

  for (let i = 0; i < VOUCHER_ISSURANCE_EXCEEDED_ATTEMPTS + 1; i++) {
    res = await playGame(tokenLocal);
    if (
      !res?.data?.error?.message
        ?.toLowerCase()
        .includes("maximum voucher issuance")
    )
      break;
  }

  return getResult(res.data);
};

export const getGameResultByScore = async score => {
  const res = await getGamePrize({ Point: score });

  if (res.data?.Success) {
    let content = "A Prize";
    const voucherList = res.data?.Data?.IssuedVoucherLists;

    if (Array.isArray(voucherList)) {
      content = voucherList.map(voucher => voucher?.VoucherTypeName).join(", ");
    }

    return { isSuccess: true, content, data: res.data?.Data };
  } else {
    try {
      const realRes = JSON.parse(res.data?.Message);
      return { ...getResult(realRes), data: res.data?.Data };
    } catch (e) {
      return { ...getResult({}), data: res.data?.Data };
    }
  }
};

const getResult = res => {
  let isSuccess, content;

  if (res?.success && res.result) {
    if (res.result.displayName?.toLowerCase() === "no prize") {
      isSuccess = false;
      content =
        "Oops, you have failed to get a prize. Please try again or come back tomorrow.";
    } else {
      isSuccess = true;
      content = res.result.displayName;
    }
  } else {
    if (res?.error?.message?.toLowerCase().includes("maximum tries per day")) {
      isSuccess = false;
      content =
        "You have reached the maximum number of tries per day. Please try again tomorrow.";
    } else if (
      res?.error?.message?.toLowerCase().includes("maximum voucher issuance")
    ) {
      isSuccess = false;
      content =
        "This prize reaches to maximum redemption limit. Please play again to get another one.";
    } else {
      isSuccess = false;
      content =
        res?.error?.message ||
        res?.message ||
        "Oops, something went wrong. Please try again later.";
    }
  }

  return { isSuccess, content };
};
