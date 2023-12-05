import { Body, Collision, Common, Composite, Sleeping } from "matter-js";
import { getRandomInt } from "../../../utils/random";
import { ALMOST_ZERO, GrabbingState } from "../configs/general";
import { Easing, Group, Tween } from "tweedle.js";
import { AdjustmentFilter } from "@pixi/filter-adjustment";

let options = {};
let moveSpeedScale = { current: 1 };
let grabbing = {};

const tweens = {};
const craneEntranceLowerTween = new Tween(tweens);
const ropeMoveStartTween = new Tween(tweens);
const ropeMoveEndTween = new Tween(tweens);
let distanceToStartRopeRaiseEnd = 0;

const activeTweenGroup = new Group();

export const setupAction = (options_, moveSpeedScale_, grabbing_) => {
  options = options_;
  moveSpeedScale = moveSpeedScale_;
  grabbing = grabbing_;

  // passive tweens
  craneEntranceLowerTween
    .easing(Easing.Quintic.Out)
    .duration(options.speed.craneEntranceLowerDuration)
    .from({ entranceOffset: options.base.preEntranceHeightOffset })
    .to({ entranceOffset: 0 })
    .rewind() // set start value to `tweens` right away
    .start();
  ropeMoveStartTween
    .easing(Easing.Quadratic.In)
    .duration(options.speed.ropeMoveXRL8Duration)
    .from({ ropeMove: 0 })
    .to({ ropeMove: options.speed.ropeMove })
    .start();
  ropeMoveEndTween
    .easing(Easing.Quadratic.Out)
    .duration(options.speed.ropeMoveXRL8Duration)
    .from({ ropeMove: options.speed.ropeMove })
    .to({ ropeMove: 0 })
    .start();
  distanceToStartRopeRaiseEnd = getApproximateTotalDistance(
    ropeMoveEndTween,
    "ropeMove"
  );
};

export const updateTweens = delta => {
  activeTweenGroup.update(delta);
};

export const moveCrane = (screen, craneBase, delta) => {
  let x = options.speed.move * moveSpeedScale.current * delta;

  if (x !== 0) {
    const bounds = Composite.bounds(craneBase);

    // If user attempted to go over bounds, set crane position to the bounds
    if (x < options.wall.leftAffectedWidth - bounds.min.x) {
      x = options.wall.leftAffectedWidth - bounds.min.x;
    } else if (
      x >
      screen.width - options.wall.rightAffectedWidth - bounds.max.x
    ) {
      x = screen.width - options.wall.rightAffectedWidth - bounds.max.x;
    }

    Composite.translate(craneBase, {
      x,
      y: 0,
    });
  }
};

export const entranceLowerCrane = (crane, delta) => {
  const lastEntranceOffset = tweens.entranceOffset;
  if (craneEntranceLowerTween.update(delta)) {
    Composite.translate(
      crane,
      {
        x: 0,
        y: tweens.entranceOffset - lastEntranceOffset,
      },
      true
    );

    return true;
  }

  return false;
};

export const openClaw = (hand, delta) => {
  const middle = hand.lower.pistonConstraint;
  const newLength = middle.length + delta * options.speed.clawGrab;

  if (newLength <= options.hand.handOpenConstraintLength) {
    middle.length = newLength;
    return true;
  } else {
    middle.length = options.hand.handOpenConstraintLength;
    return false;
  }
};

export const closeClaw = (hand, delta) => {
  const middle = hand.lower.pistonConstraint;
  const newLength = middle.length - delta * options.speed.clawGrab;

  if (newLength >= options.hand.handCloseConstraintLength) {
    middle.length = newLength;
    return true;
  } else {
    middle.length = options.hand.handCloseConstraintLength;
    return false;
  }
};

let craneLowerLength = 0;

let stopDetected = false;
export const lowerClaw = (rope, craneStopDetector, delta) => {
  let res = true;
  if (craneStopDetector.giftDetected || craneStopDetector.groundDetected) {
    stopDetected = true;
  }

  if (stopDetected && !ropeMoveEndTween.update(delta)) {
    res = false;
  } else {
    ropeMoveStartTween.update(delta);
  }

  let newY = rope.rootConstraint.pointA.y + tweens.ropeMove * delta;
  if (newY > 0) {
    newY = rope.rootConstraint.pointA.y;
    res = false;
  }

  rope.rootConstraint.pointA.y = newY;
  craneLowerLength = rope.rootConstraint.pointA.y - options.ropeSegment.rootY;

  if (!res) {
    stopDetected = false;
    ropeMoveStartTween.rewind().start();
    ropeMoveEndTween.rewind().start();
  }

  return res;
};

export const raiseClaw = (rope, delta) => {
  if (
    rope.rootConstraint.pointA.y <=
    options.ropeSegment.rootY + distanceToStartRopeRaiseEnd
  ) {
    ropeMoveEndTween.update(delta);
  } else {
    ropeMoveStartTween.update(delta);
  }

  let newY = rope.rootConstraint.pointA.y - tweens.ropeMove * delta;

  if (newY > options.ropeSegment.rootY) {
    rope.rootConstraint.pointA.y = newY;
    craneLowerLength = rope.rootConstraint.pointA.y - options.ropeSegment.rootY;

    return true;
  } else {
    rope.rootConstraint.pointA.y = options.ropeSegment.rootY;
    craneLowerLength = 0;

    ropeMoveStartTween.rewind().start();
    ropeMoveEndTween.rewind().start();

    return false;
  }
};

export const pause = (limit, delta) => {
  if (grabbing.current.pauseStartTime >= limit) {
    return false;
  }

  grabbing.current.pauseStartTime += delta;
  return true;
};

// https://github.com/liabru/matter-js/blob/master/examples/events.js#L110
export const shakeGifts = (engine, gifts, claw, touchPoint) => {
  const timeScale = 1000 / 60 / engine.timing.lastDelta;
  [...gifts, claw].forEach(body => {
    if (touchPoint) {
      const distance = Math.hypot(
        touchPoint.x - body.position.x,
        touchPoint.y - body.position.y
      );

      // scale force for mass and time applied
      const forceMagnitude =
        0.05 *
        body.mass *
        timeScale *
        ((options.shake.maxEffectDistance - distance) /
          options.shake.maxEffectDistance);

      // apply the force over a single update
      Body.applyForce(body, body.position, {
        x: ((body.position.x - touchPoint.x) / distance) * forceMagnitude,
        y: ((body.position.y - touchPoint.y) / distance) * forceMagnitude,
      });
    } else {
      // scale force for mass and time applied
      const forceMagnitude = 0.03 * body.mass * timeScale;

      // apply the force over a single update
      Body.applyForce(body, body.position, {
        x:
          (forceMagnitude + Common.random() * forceMagnitude) *
          Common.choose([1, -1]),
        y: -forceMagnitude + Common.random() * -forceMagnitude,
      });
    }
  });
};

let interceptLength; // crane length to drop the extra gifts
let grabbedGifts, kickedOutGifts, survivedGift;
let extraGiftsKicked = false;
export const removeExtraGrabbingGifts = (kickGift, hand, gifts, delta) => {
  const {
    giftDetector,
    lower: { pistonConstraint },
  } = hand;

  if (grabbing.current.grabbingState === GrabbingState.CLOSE_CLAW) {
    interceptLength = undefined;
    grabbedGifts = undefined;
    kickedOutGifts = undefined;
    survivedGift = undefined;
    extraGiftsKicked = false;
  }

  if (
    grabbing.current.grabbingState === GrabbingState.RAISE_CLAW &&
    grabbedGifts === undefined
  ) {
    grabbedGifts = [];
    gifts.forEach(gift => {
      const isCollided = Collision.collides(gift, giftDetector)?.collided;
      if (isCollided) grabbedGifts.push(gift);
    });

    if (interceptLength === undefined && grabbedGifts.length > 1) {
      const interceptMultiplyer = kickGift ? 0.5 : 1; // leave time for the random gift kicker
      interceptLength = getRandomInt(
        options.hand.giftDropLimitHeight,
        (craneLowerLength - options.hand.giftDropHeightPadding) *
          interceptMultiplyer
      );
    } else {
      interceptLength = -1;
    }

    if (grabbedGifts.length === 1) {
      survivedGift = grabbedGifts[0];
    }
  }

  if (
    !extraGiftsKicked &&
    (interceptLength >= craneLowerLength ||
      (interceptLength !== undefined &&
        grabbing.current.grabbingState === GrabbingState.CHECK_GIFT))
  ) {
    const collidedGifts = grabbedGifts.filter(
      gift => Collision.collides(gift, giftDetector)?.collided
    );
    if (collidedGifts.length > 1) {
      kickedOutGifts = [...grabbedGifts].sort(
        (a, b) => b.position.y - a.position.y
      );
      survivedGift = kickedOutGifts.pop();

      kickedOutGifts.forEach(gift => Body.setMass(gift, 100));
      pistonConstraint.stiffness = 0.5;
    } else {
      survivedGift = collidedGifts[0];
    }

    extraGiftsKicked = true;
  }

  if (kickedOutGifts?.length) {
    const otherGift = gifts.find(gift => !kickedOutGifts.includes(gift));

    kickedOutGifts = kickedOutGifts.filter(gift => {
      const isCollided = Collision.collides(gift, giftDetector)?.collided;

      if (!isCollided) {
        Body.setDensity(gift, otherGift.density);
        return false;
      }

      return true;
    });
    if (kickedOutGifts.length === 0) pistonConstraint.stiffness = 1;
  }
};

let kickLength,
  unluckyGiftKicked = false,
  unluckyGiftUnkicked = false;
export const dropGrabbingGiftRandomly = (kickGift, hand, gifts, delta) => {
  const {
    giftDetector,
    lower: { pistonConstraint },
  } = hand;

  if (grabbing.current.grabbingState === GrabbingState.CLOSE_CLAW) {
    kickLength = undefined;
    unluckyGiftKicked = false;
    unluckyGiftUnkicked = false;
  }

  if (
    grabbing.current.grabbingState === GrabbingState.RAISE_CLAW &&
    survivedGift
  ) {
    if (!unluckyGiftKicked && kickLength === undefined) {
      // if `craneLowerLength` < `giftDropLimitHeight`, the crane almost finish its trip,
      // so if we make the gift falls, it won't look believable
      if (
        kickGift &&
        craneLowerLength - options.hand.giftDropHeightPadding >=
          options.hand.giftDropLimitHeight
      ) {
        kickLength = getRandomInt(
          options.hand.giftDropLimitHeight,
          craneLowerLength - options.hand.giftDropHeightPadding
        );
      } else {
        kickLength = -1;
      }
    }

    if (kickLength >= craneLowerLength) {
      const isCollided = Collision.collides(
        survivedGift,
        giftDetector
      )?.collided;
      if (isCollided) {
        const newMass = survivedGift.mass + (600 / kickLength) * delta;
        const newStiffness =
          pistonConstraint.stiffness - (0.72 / kickLength) * delta;

        Body.setMass(survivedGift, newMass > 4000 ? 4000 : newMass);
        pistonConstraint.stiffness = newStiffness < 0.33 ? 0.33 : newStiffness;
        Body.applyForce(survivedGift, survivedGift.position, {
          x: 0,
          y: 0.2,
        });
      }

      unluckyGiftKicked = true;
    }
  }

  if (
    survivedGift &&
    (grabbing.current.grabbingState === GrabbingState.CHECK_GIFT || // lucky
      (unluckyGiftKicked &&
        !Collision.collides(survivedGift, giftDetector)?.collided))
  ) {
    if (!unluckyGiftUnkicked) {
      const otherGift = gifts.find(gift => gift !== survivedGift);
      Body.setDensity(survivedGift, otherGift.density);
      unluckyGiftUnkicked = true;
    }

    if (grabbing.current.grabbingState === GrabbingState.CHECK_GIFT) {
      pistonConstraint.stiffness = 1;
    } else {
      const newStiffness =
        pistonConstraint.stiffness + (0.72 / kickLength) * delta;
      pistonConstraint.stiffness = newStiffness > 1 ? 1 : newStiffness;
    }
  }
};

export const helpSurvivedGiftFitInsideCrane = () => {
  if (survivedGift) {
    if (
      (grabbing.current.grabbingState >= GrabbingState.OPEN_CLAW &&
        grabbing.current.grabbingState <= GrabbingState.LOWER_CLAW) ||
      unluckyGiftKicked
    ) {
      survivedGift.slop = 0.1;
    } else {
      survivedGift.slop =
        Math.min(survivedGift.width, survivedGift.height) * 0.005; // allow gift to sink into the crane

      // Only change gift density if it's not gonna be kicked out => not interfering with the kicking mechanism
      if (kickLength === -1) {
        Body.setDensity(survivedGift, 0.0001); // make gift light like a feather
      }
    }
  }
};

export const checkGift = (
  giftDetector,
  gifts,
  onBeforeCheck,
  onCheckFinish
) => {
  const preCollidedGift = gifts.find(
    gift => Collision.collides(gift, giftDetector)?.collided
  );

  // Do collision checking in another thread (not blocking the render process)
  setTimeout(
    async () => {
      const collidedGift = preCollidedGift
        ? gifts.find(gift => Collision.collides(gift, giftDetector)?.collided)
        : undefined;

      if (collidedGift) {
        // Stop the claw by the gift from wiggling after the end game
        Sleeping.set(collidedGift, true);
      }

      await onCheckFinish(!!collidedGift, collidedGift);
    },
    preCollidedGift ? options.speed.checkGiftPause : options.speed.missGrabPause
  );

  onBeforeCheck();
};

export const maintainFingersGap = hand => {
  const {
    rightFinger: { lower: rightLowerFinger },
    leftFinger: { lower: leftLowerFinger },
    fingersGap,
  } = hand;

  // https://github.com/liabru/matter-js/issues/71#issuecomment-462210154
  const rX = options.hand.lowerTipX;
  const rY = options.hand.lowerTipY;
  const rA = rightLowerFinger.angle;
  const rightX =
    rightLowerFinger.position.x + rX * Math.cos(rA) - rY * Math.sin(rA);
  const rightY =
    rightLowerFinger.position.y + rX * Math.sin(rA) + rY * Math.cos(rA);

  const lX = -options.hand.lowerTipX;
  const lY = options.hand.lowerTipY;
  const lA = leftLowerFinger.angle;
  const leftX =
    leftLowerFinger.position.x + lX * Math.cos(lA) - lY * Math.sin(lA);
  const leftY =
    leftLowerFinger.position.y + lX * Math.sin(lA) + lY * Math.cos(lA);

  const xDelta = rightX - leftX;
  const yDelta = rightY - leftY;
  const distance = Math.hypot(xDelta, yDelta);

  if (distance > options.hand.maxFingersGap) {
    fingersGap.length = options.hand.maxFingersGap;
    fingersGap.stiffness = 0.6;
  } else {
    fingersGap.stiffness = ALMOST_ZERO;
  }
};

export const revealGift = (gift, getGift, onStartRevealing) => {
  const glowFilter = new AdjustmentFilter();
  gift.render.sprite.filters = [glowFilter];

  gift.render.sprite.rotation = gift.render.sprite.rotation ?? 0;
  const giftShakingTween = new Tween(gift.render.sprite)
    .group(activeTweenGroup)
    .easing(Easing.Quadratic.InOut)
    .duration(80)
    .from({ rotation: "-0.5" })
    .to({ rotation: "+0.5" })
    .repeat(Infinity)
    .yoyo()
    .start();

  const growScale = 3;
  const giftGrowingTween = new Tween(gift.render.sprite)
    .group(activeTweenGroup)
    .easing(Easing.Back.In)
    .duration(600)
    .to({
      xScale: (gift.render.sprite.xScale ?? 1) * growScale,
      yScale: (gift.render.sprite.yScale ?? 1) * growScale,
    });
  const giftGlowingTween = new Tween(glowFilter)
    .group(activeTweenGroup)
    .easing(Easing.Cubic.In)
    .delay(50)
    .duration(500)
    .to({ brightness: 3, contract: 0, alpha: 0 });
  const growWaitDummyTween = new Tween().group(activeTweenGroup).delay(450);

  getGift().then(res => {
    giftShakingTween.stop();
    activeTweenGroup.remove(giftShakingTween);

    giftGrowingTween.start().onComplete((_, t) => activeTweenGroup.remove(t));
    giftGlowingTween.start().onComplete((_, t) => activeTweenGroup.remove(t));

    // wait for the grow tween to really grow after the initial shrinkage
    growWaitDummyTween
      .onAfterDelay(() => {
        onStartRevealing(res);
      })
      .start();
  });
};

const getApproximateTotalDistance = (
  tween,
  velocityField,
  t = tween._duration,
  timeStep = 1
) => {
  let totalDistance = 0;

  while (t > 0) {
    const delta = t < timeStep ? t : timeStep;
    totalDistance += getDistance(tween, velocityField, t - delta, t);
    t -= delta;
  }

  return totalDistance;
};

const getDistance = (tween, velocityField, startT, endT) => {
  const v = getVelocity(tween, velocityField, startT);
  return v * (endT - startT);
};

const getVelocity = (tween, velocityField, t) => {
  const easingFunc = tween._easingFunction;
  const minT = 0,
    maxT = tween._duration,
    minV = tween._valuesStart[velocityField],
    maxV = tween._valuesEnd[velocityField];

  return minV + easingFunc((t - minT) / (maxT - minT)) * (maxV - minV);
};
