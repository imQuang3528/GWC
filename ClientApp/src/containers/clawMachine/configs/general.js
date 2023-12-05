export const createOptions = S => ({
  screenMaxWidth: 0, // will be set later
  wall: {
    width: 500,
    height: 1_000_000, // no roof, so make sure that no gifts is flying away

    leftAffectedWidth: 0, // will be calculated
    rightAffectedWidth: 0, // will be calculated
  },
  ground: {
    thickness: 500,
  },
  gift: {
    size: 175 * S,
    gap: 10 * S,
    maxRow: 5,
    giftsSpawnY: 600 * S,
  },
  base: {
    width: 350 * S,
    height: 40 * S,
    barrierThickness: 150 * S,
    barrierRopeSpace: 10 * S, // space between the barrier and the rope
    preEntranceHeightOffset: -600 * S,
  },
  ropeSegment: {
    width: 15 * S,
    height: 2000 * S,
    quantity: 0, // will be calculated
    rootY: 0, // will be calculated
    exposeLength: 100 * S,
  },
  body: {
    upperWidth: 100 * S,
    upperHeight: (227 / 185) * 100 * S,
    lowerWidth: 100 * S,
    lowerHeight: (185 / 164) * 100 * S,

    cylinderThickness: 35 * S,
    ropeSinkLength: 30 * S,
    stabilityHeight: 200 * S,
  },
  hand: {
    upperWidth: 20 * S,
    upperHeight: 130 * S,
    lowerScale: 0.35 * S,
    lowerTextureScale: 0.675 * S,

    upperOffset: 50 * S,
    lowerOffsetX: 70 * S,
    lowerOffsetY: 60 * S,
    lowerLeftTextureOffsetX: -0.33,

    lowerHighAxisX: -12 * S,
    lowerHighAxisY: -70 * S,
    lowerLowAxisX: -72 * S,
    lowerLowAxisY: -20 * S,
    lowerTipX: -27 * S,
    lowerTipY: 120 * S,

    axisRadius: 6 * S,
    upperAxisOffsetY: -8 * S,
    maxFingersGap: 150 * S,
    fingerStabilityLength: 115 * S,

    handOpenConstraintLength: 55 * S,
    handCloseConstraintLength: 0 * S,

    giftDropLimitHeight: 370 * S,
    giftDropHeightPadding: 5 * S,
  },
  giftDetector: {
    width: 170 * S,
    height: 170 * S,
    handConstraintLength: 100 * S,
  },
  craneStopDetector: {
    width: 170 * S,
    height: 200 * S,
    giftDetectStartPoint: -160 * S, // start point to grow upward relative to the crane body
    groundDetectStartPoint: -350 * S, // start point to grow upward relative to the crane body
  },
  speed: {
    move: 1.1 * S, // px/ms
    ropeMove: 1.4 * S, // px/ms
    ropeMoveXRL8Duration: 200, // ms
    craneEntranceLowerDuration: 700, // ms
    clawGrab: 0.05, // (piston move up length) px/ms
    clawLowerPause: 100, // ms
    clawGrabPause: 200, // ms
    clawRaisePause: 400, // ms
    checkGiftPause: 1100, // ms
    missGrabPause: 200, // ms
  },
  shake: {
    throttleInterval: 2000, // ms
    maxEffectDistance: 2000 * S,
  },
  collisionFilter: {
    gift: {
      category: 0b00000001,
      mask: 0b11001011,
    },
    base: {
      category: 0b00000010,
      mask: 0b11110001,
    },
    baseBarrier: {
      category: 0b00000100,
      mask: 0b00001000,
    },
    ropeSegment: {
      category: 0b00001000,
      mask: 0b11101101,
    },
    upperBody: {
      category: 0b00010000,
      mask: 0b00110010,
    },
    lowerBody: {
      category: 0b00100000,
      mask: 0b00111010,
    },
    fingerLeft: {
      category: 0b01000000,
      mask: 0b10001011,
    },
    fingerRight: {
      category: 0b10000000,
      mask: 0b01001011,
    },
  },
});

export const GrabbingState = {
  ENTRANCE: 0,
  OPEN_CLAW: 1,
  IDLE: 2,
  LOWER_CLAW: 3,
  CLOSE_CLAW: 4,
  RAISE_CLAW: 5,
  CHECK_GIFT: 6,
  FINISH: 7,
};

export const ALMOST_ZERO = 0.0000001;
