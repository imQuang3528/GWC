import {
  Bodies,
  Body,
  Composite,
  Composites,
  Constraint,
  Vector,
} from "matter-js";
import { FINGER_LOWER_VERTICES, scaleVertices } from "../configs/vertices";
import { getDuplicationReducedRandomInt } from "../../../utils/random";
import { ALMOST_ZERO } from "../configs/general";

let options = {};
let textures = {};
let debug = false;

export const setupCreation = (options_, textures_, debug_) => {
  options = options_;
  textures = textures_;
  debug = debug_;
};

export const createBoundaries = screen => {
  const boundaryOption = {
    isStatic: true,
    render: {
      visible: debug,
    },
  };

  options.wall.leftAffectedWidth =
    Math.min(screen.width, options.screenMaxWidth) * 0.045;

  options.wall.rightAffectedWidth =
    Math.min(screen.width, options.screenMaxWidth) * 0.035;

  const leftWall = Bodies.rectangle(
    -options.wall.width / 2 + options.wall.leftAffectedWidth,
    screen.height - options.wall.height / 2,
    options.wall.width,
    options.wall.height,
    { ...boundaryOption, label: "leftWall" }
  );
  const rightWall = Bodies.rectangle(
    screen.width + options.wall.width / 2 - options.wall.rightAffectedWidth,
    screen.height - options.wall.height / 2,
    options.wall.width,
    options.wall.height,
    { ...boundaryOption, label: "rightWall" }
  );
  const ground = Bodies.rectangle(
    screen.width / 2,
    screen.height + options.ground.thickness / 2,
    screen.width + options.wall.width * 2,
    options.ground.thickness,
    { ...boundaryOption, label: "ground" }
  );

  const boundaries = Composite.create();
  Composite.add(boundaries, [leftWall, rightWall, ground]);

  return boundaries;
};

export const createGifts = screen => {
  // Because gifts can rotate, max length they can take is the diagonal length of the square that cover the gift.
  // But rarely the gifts will have max rotation, so we calculate the average length a gift can take.
  const avgGiftLength =
    (Math.SQRT2 * options.gift.size + options.gift.size) / 2;

  const giftStackCols = Math.floor(
    (screen.width - options.gift.gap) / (avgGiftLength + options.gift.gap)
  );
  const giftGapX =
    (screen.width - giftStackCols * avgGiftLength) / (giftStackCols - 1);
  const giftStackX = giftGapX;

  const giftSpawnSpace = options.gift.giftsSpawnY;
  const giftStackRows = Math.min(
    Math.floor((screen.height - giftSpawnSpace) / avgGiftLength),
    options.gift.maxRow
  );
  const giftStackY = giftSpawnSpace;

  const gifts = Object.values(textures.gifts);
  const randomIntHits = {};

  const giftStack = Composites.stack(
    giftStackX,
    giftStackY,
    giftStackCols,
    giftStackRows,
    giftGapX,
    options.gift.gap,
    (x, y) => {
      const gift =
        gifts[
          getDuplicationReducedRandomInt(0, gifts.length - 1, randomIntHits)
        ];

      const [giftWidth, giftHeight] =
        gift.width > gift.height
          ? [options.gift.size, (options.gift.size * gift.height) / gift.width]
          : [(options.gift.size * gift.width) / gift.height, options.gift.size];

      const giftBox = Bodies.rectangle(x, y, giftWidth, giftHeight, {
        slop: 0.1,
        density: 0.001,
        restitution: 0.5,
        collisionFilter: options.collisionFilter.gift,
        chamfer: { radius: Math.min(giftWidth, giftHeight) * 0.35 },
        label: "gift",
        width: giftWidth,
        height: giftHeight,
        render: {
          ...(!debug && {
            sprite: {
              texture: gift,
              xScale: giftWidth / gift.width,
              yScale: giftHeight / gift.height,
            },
          }),
        },
      });
      Body.rotate(giftBox, Math.random() * 2 * Math.PI);

      return giftBox;
    }
  );

  return giftStack;
};

const createCraneBase = screen => {
  const craneBase = Bodies.rectangle(
    screen.width / 2,
    options.base.height / 2 + options.base.preEntranceHeightOffset,
    options.base.width,
    options.base.height,
    {
      collisionFilter: options.collisionFilter.base,
      isStatic: true,
      render: {
        sprite: {
          texture: textures.claw.clawHanger,
          xScale: options.base.width / textures.claw.clawHanger.width,
          yScale: options.base.height / textures.claw.clawHanger.height,
        },
        visible: !debug,
      },
    }
  );

  const craneBarrierOption = {
    collisionFilter: options.collisionFilter.baseBarrier,
    chamfer: { radius: 6 },
    isStatic: true,
    ...(!debug && { render: { visible: false } }),
  };

  const craneBarrierHeight =
    options.ropeSegment.height * options.ropeSegment.quantity;
  const craneBarrierLeft = Bodies.rectangle(
    (screen.width -
      options.base.width -
      options.base.barrierThickness +
      options.base.width -
      options.ropeSegment.width) /
      2 -
      options.base.barrierRopeSpace,
    -craneBarrierHeight / 2 + options.base.height,
    options.base.barrierThickness,
    craneBarrierHeight,
    { ...craneBarrierOption }
  );
  const craneBarrierRight = Bodies.rectangle(
    (screen.width +
      options.base.width +
      options.base.barrierThickness -
      options.base.width +
      options.ropeSegment.width) /
      2 +
      options.base.barrierRopeSpace,
    -craneBarrierHeight / 2 + options.base.height,
    options.base.barrierThickness,
    craneBarrierHeight,
    { ...craneBarrierOption }
  );

  const fullCraneBase = Composite.create();
  Composite.add(fullCraneBase, [
    craneBase,
    craneBarrierLeft,
    craneBarrierRight,
  ]);

  return fullCraneBase;
};

const createCraneRope = screen => {
  options.ropeSegment.quantity = Math.ceil(
    screen.height / options.ropeSegment.height
  );

  // move up the height of the rope, just expose a lil bit of a rope segment height
  // rootY is relative to the base position
  options.ropeSegment.rootY =
    -options.ropeSegment.quantity * options.ropeSegment.height +
    options.base.height / 2 +
    options.ropeSegment.exposeLength;

  const craneRope = Composites.stack(
    (screen.width - options.ropeSegment.width) / 2,
    options.ropeSegment.rootY +
      options.base.height / 2 +
      options.base.preEntranceHeightOffset,
    1,
    options.ropeSegment.quantity,
    0,
    0,
    function (x, y) {
      return Bodies.rectangle(
        x,
        y,
        options.ropeSegment.width,
        options.ropeSegment.height,
        {
          inertia: Infinity,
          collisionFilter: options.collisionFilter.ropeSegment,
          render: {
            ...(!debug && {
              sprite: {
                texture: textures.claw.clawRope,
                xScale:
                  options.ropeSegment.width / textures.claw.clawRope.width,
                yScale:
                  options.ropeSegment.height / textures.claw.clawRope.height,
              },
            }),
          },
        }
      );
    }
  );

  Composites.chain(craneRope, 0, 0.5, 0, -0.5, {
    stiffness: 1,
    length: 0,
    render: { visible: false },
  });

  return craneRope;
};

const createCraneUpper = (screen, lastRopeSegment) => {
  const craneUpper = Body.create({
    parts: [
      Bodies.rectangle(
        lastRopeSegment.position.x,
        lastRopeSegment.position.y +
          options.ropeSegment.height / 2 +
          options.body.cylinderThickness / 2 -
          options.body.ropeSinkLength / 2,
        options.body.upperWidth,
        options.body.cylinderThickness
      ),
      Bodies.rectangle(
        lastRopeSegment.position.x -
          (options.body.upperWidth / 2 + options.body.cylinderThickness / 2),
        lastRopeSegment.position.y +
          options.ropeSegment.height / 2 +
          options.body.upperHeight / 2 -
          options.body.ropeSinkLength / 2 +
          options.body.cylinderThickness / 2,
        options.body.cylinderThickness,
        options.body.upperHeight + options.body.cylinderThickness
      ),
      Bodies.rectangle(
        lastRopeSegment.position.x +
          (options.body.upperWidth / 2 + options.body.cylinderThickness / 2),
        lastRopeSegment.position.y +
          options.ropeSegment.height / 2 +
          options.body.upperHeight / 2 -
          options.body.ropeSinkLength / 2 +
          options.body.cylinderThickness / 2,
        options.body.cylinderThickness,
        options.body.upperHeight + options.body.cylinderThickness
      ),
    ],
    collisionFilter: options.collisionFilter.upperBody,
    render: {
      sprite: {
        texture: textures.claw.clawBodyUpper,
        xScale: options.body.upperWidth / textures.claw.clawBodyUpper.width,
        yScale: options.body.upperHeight / textures.claw.clawBodyUpper.height,
      },
    },
  });

  const upperConstraint = Constraint.create({
    bodyA: lastRopeSegment,
    bodyB: craneUpper,
    pointA: {
      x: 0,
      y: options.ropeSegment.height / 2 - options.body.ropeSinkLength / 2,
    },
    pointB: {
      x: 0,
      y: -options.body.upperHeight / 2 + options.body.ropeSinkLength / 2,
    },
    length: 0,
    ...(!debug && { render: { visible: false } }),
  });

  const leftStabilityConstraint = Constraint.create({
    bodyA: lastRopeSegment,
    bodyB: craneUpper,
    pointA: {
      x: 0,
      y: options.ropeSegment.height / 2 - options.body.stabilityHeight,
    },
    pointB: {
      x: -(options.body.upperWidth / 2 + options.body.cylinderThickness),
      y: 0,
    },
    stiffness: 0.03,
    ...(!debug && { render: { visible: false } }),
  });

  const rightStabilityConstraint = Constraint.create({
    bodyA: lastRopeSegment,
    bodyB: craneUpper,
    pointA: {
      x: 0,
      y: options.ropeSegment.height / 2 - options.body.stabilityHeight,
    },
    pointB: {
      x: options.body.upperWidth / 2 + options.body.cylinderThickness,
      y: 0,
    },
    stiffness: 0.03,
    ...(!debug && { render: { visible: false } }),
  });

  const constraints = Composite.create();
  Composite.add(constraints, [
    upperConstraint,
    leftStabilityConstraint,
    rightStabilityConstraint,
  ]);

  return [craneUpper, constraints];
};

const createCraneLower = (screen, craneUpper, lastRopeSegment) => {
  const craneLower = Bodies.rectangle(
    craneUpper.position.x,
    craneUpper.position.y +
      options.body.upperHeight / 2 +
      options.body.lowerHeight / 2,
    options.body.lowerWidth,
    options.body.lowerHeight,
    {
      collisionFilter: options.collisionFilter.lowerBody,
      render: {
        sprite: {
          texture: textures.claw.clawBodyLower,
          xScale: options.body.lowerWidth / textures.claw.clawBodyLower.width,
          yScale: options.body.lowerHeight / textures.claw.clawBodyLower.height,
        },
      },
    }
  );

  const lowerConstraint = Constraint.create({
    bodyA: craneUpper,
    bodyB: craneLower,
    pointA: {
      x: 0,
      y: -options.body.upperHeight / 2 + options.body.cylinderThickness,
    },
    pointB: {
      x: 0,
      y: -options.body.lowerHeight / 2,
    },
    stiffness: 1,
    ...(!debug && { render: { visible: false } }),
  });

  const leftStabilityConstraint = Constraint.create({
    bodyA: lastRopeSegment,
    bodyB: craneLower,
    pointA: {
      x: 0,
      y: options.ropeSegment.height / 2 - options.body.stabilityHeight,
    },
    pointB: {
      x: -options.body.lowerWidth / 2,
      y: 0,
    },
    stiffness: 0.06,
    ...(!debug && { render: { visible: false } }),
  });

  const rightStabilityConstraint = Constraint.create({
    bodyA: lastRopeSegment,
    bodyB: craneLower,
    pointA: {
      x: 0,
      y: options.ropeSegment.height / 2 - options.body.stabilityHeight,
    },
    pointB: {
      x: options.body.lowerWidth / 2,
      y: 0,
    },
    stiffness: 0.06,
    ...(!debug && { render: { visible: false } }),
  });

  const leftInnerStabilityConstraint = Constraint.create({
    bodyA: craneUpper,
    bodyB: craneLower,
    pointA: {
      x: -options.body.upperWidth / 2,
      y: 0,
    },
    pointB: {
      x: options.body.lowerWidth / 2,
      y: options.body.lowerHeight / 2,
    },
    stiffness: 0.04,
    ...(!debug && { render: { visible: false } }),
  });

  const rightInnerStabilityConstraint = Constraint.create({
    bodyA: craneUpper,
    bodyB: craneLower,
    pointA: {
      x: options.body.upperWidth / 2,
      y: 0,
    },
    pointB: {
      x: -options.body.lowerWidth / 2,
      y: options.body.lowerHeight / 2,
    },
    stiffness: 0.04,
    ...(!debug && { render: { visible: false } }),
  });

  const constraints = Composite.create();
  Composite.add(constraints, [
    lowerConstraint,
    leftStabilityConstraint,
    rightStabilityConstraint,
    leftInnerStabilityConstraint,
    rightInnerStabilityConstraint,
  ]);

  craneLower.pistonConstraint = lowerConstraint;

  return [craneLower, constraints];
};

const createCraneUpperFinger = (screen, craneUpper, side) => {
  const texture =
    side > 0
      ? textures.claw.clawRighthandUpper
      : textures.claw.clawLefthandUpper;

  const craneUpperFinger = Bodies.rectangle(
    craneUpper.position.x +
      side * (options.body.upperWidth / 2 + options.hand.upperWidth),
    craneUpper.position.y + options.hand.upperOffset,
    options.hand.upperWidth,
    options.hand.upperHeight,
    {
      collisionFilter:
        options.collisionFilter[side > 0 ? "fingerRight" : "fingerLeft"],
      render: {
        zIndex: -1,
        sprite: {
          texture: texture,
          xScale: options.hand.upperWidth / texture.width,
          yScale: options.hand.upperHeight / texture.height,
        },
      },
    }
  );

  const upperFingerConstraint = Constraint.create({
    bodyA: craneUpper,
    bodyB: craneUpperFinger,
    pointA: {
      x: side * (options.body.upperWidth / 2 - options.hand.axisRadius),
      y: options.hand.upperAxisOffsetY,
    },
    pointB: {
      x: 0,
      y: -options.hand.upperHeight / 2 + options.hand.axisRadius,
    },
    length: 0,
    ...(!debug && { render: { visible: false } }),
  });

  const constraints = Composite.create();
  Composite.add(constraints, [upperFingerConstraint]);

  return [craneUpperFinger, constraints];
};

const createCraneLowerFinger = (screen, craneUpperFinger, craneLower, side) => {
  const texture =
    side > 0
      ? textures.claw.clawRighthandLower
      : textures.claw.clawLefthandLower;

  const craneLowerFinger = Bodies.fromVertices(
    craneLower.position.x +
      side * (options.body.lowerWidth / 2 + options.hand.lowerOffsetX),
    craneLower.position.y + options.hand.lowerOffsetY,
    scaleVertices(FINGER_LOWER_VERTICES, options.hand.lowerScale),
    {
      collisionFilter:
        options.collisionFilter[side > 0 ? "fingerRight" : "fingerLeft"],
      render: {
        zIndex: -1,
        sprite: {
          texture: texture,
          xScale: options.hand.lowerTextureScale,
          yScale: options.hand.lowerTextureScale,
          xOffset: side > 0 ? 0 : options.hand.lowerLeftTextureOffsetX,
        },
      },
    }
  );

  // This stabilizes the finger. Try to remove it and see
  Body.scale(craneLowerFinger, -1, 1);
  Body.scale(craneLowerFinger, -1, 1);

  // Mirror the left side
  if (side < 0) {
    Body.scale(craneLowerFinger, -1, 1);
  }

  const lowerFingerConstraint = Constraint.create({
    bodyA: craneLower,
    bodyB: craneLowerFinger,
    pointA: {
      x: side * (options.body.lowerWidth / 2 - options.hand.axisRadius),
      y: options.body.lowerHeight / 2 - options.hand.axisRadius,
    },
    pointB: {
      x: side * options.hand.lowerLowAxisX,
      y: options.hand.lowerLowAxisY,
    },
    length: 0,
    ...(!debug && { render: { visible: false } }),
  });

  const twoPartsConstraint = Constraint.create({
    bodyA: craneUpperFinger,
    bodyB: craneLowerFinger,
    pointA: {
      x: 0,
      y: options.hand.upperHeight / 2 - options.hand.axisRadius,
    },
    pointB: {
      x: side * options.hand.lowerHighAxisX,
      y: options.hand.lowerHighAxisY,
    },
    length: 0,
    ...(!debug && { render: { visible: false } }),
  });

  const stabilityConstraint = Constraint.create({
    bodyA: craneLowerFinger,
    bodyB: craneLower,
    pointA: {
      x: side * options.hand.lowerHighAxisX,
      y: options.hand.lowerHighAxisY,
    },
    stiffness: 0.2,
    length: options.hand.fingerStabilityLength,
    ...(!debug && { render: { visible: false } }),
  });

  const constraints = Composite.create();
  Composite.add(constraints, [
    lowerFingerConstraint,
    twoPartsConstraint,
    stabilityConstraint,
  ]);

  return [craneLowerFinger, constraints];
};

const createCraneFinger = (screen, craneUpper, craneLower, isRightHand) => {
  const side = isRightHand ? 1 : -1;

  const [craneUpperFinger, upperFingerConstraint] = createCraneUpperFinger(
    screen,
    craneUpper,
    side
  );

  const [craneLowerFinger, lowerFingerConstraint] = createCraneLowerFinger(
    screen,
    craneUpperFinger,
    craneLower,
    side
  );

  const craneFinger = Composite.create();
  Composite.add(craneFinger, [
    craneUpperFinger,
    upperFingerConstraint,
    craneLowerFinger,
    lowerFingerConstraint,
  ]);

  craneFinger.upper = craneUpperFinger;
  craneFinger.lower = craneLowerFinger;

  return craneFinger;
};

const createCraneStopDetector = (screen, craneLower) => {
  const craneGiftStopDetector = Bodies.rectangle(
    craneLower.position.x,
    craneLower.position.y -
      options.craneStopDetector.giftDetectStartPoint -
      options.craneStopDetector.height / 2,
    options.craneStopDetector.width,
    options.craneStopDetector.height,
    {
      isSensor: true,
      density: ALMOST_ZERO, // detector is weightless
      render: debug
        ? {
            fillStyle: "orange",
          }
        : {
            visible: false,
          },
    }
  );

  const craneGroundStopDetector = Bodies.rectangle(
    craneLower.position.x,
    craneLower.position.y -
      options.craneStopDetector.groundDetectStartPoint -
      options.craneStopDetector.height / 2,
    options.craneStopDetector.width,
    options.craneStopDetector.height,
    {
      isSensor: true,
      density: ALMOST_ZERO, // detector is weightless
      render: debug
        ? {
            fillStyle: "red",
          }
        : {
            visible: false,
          },
    }
  );

  const giftDetectorConstraints = addRigidBodyConstraints(
    craneLower,
    craneGiftStopDetector,
    0.5
  );
  const groundDetectorConstraints = addRigidBodyConstraints(
    craneLower,
    craneGroundStopDetector,
    0.5
  );

  const constraints = Composite.create();
  Composite.add(constraints, [
    ...giftDetectorConstraints,
    ...groundDetectorConstraints,
  ]);

  const craneStopDetector = Composite.create();
  Composite.add(craneStopDetector, [
    craneGiftStopDetector,
    craneGroundStopDetector,
  ]);

  craneStopDetector.giftDetector = craneGiftStopDetector;
  craneStopDetector.groundDetector = craneGroundStopDetector;
  craneStopDetector.giftDetected = false;
  craneStopDetector.groundDetected = false;

  return [craneStopDetector, constraints];
};

const createGiftDetector = (screen, craneLower, leftFinger, rightFinger) => {
  const giftDetector = Bodies.rectangle(
    (leftFinger.lower.position.x + rightFinger.lower.position.x) / 2,
    (leftFinger.lower.position.y + rightFinger.lower.position.y) / 2,
    options.giftDetector.width,
    options.giftDetector.height,
    {
      isSensor: true,
      density: ALMOST_ZERO, // detector is weightless
      chamfer: { radius: 20 },
      render: debug
        ? {
            fillStyle: "blue",
          }
        : {
            visible: false,
          },
    }
  );

  const bodyConstraint = Constraint.create({
    bodyA: craneLower,
    bodyB: giftDetector,
    stiffness: 0.1,
    length: options.giftDetector.handConstraintLength,
    ...(!debug && { render: { visible: false } }),
  });

  const leftFingerConstraint = Constraint.create({
    bodyA: leftFinger.lower,
    bodyB: giftDetector,
    stiffness: 0.1,
    length: options.giftDetector.handConstraintLength,
    ...(!debug && { render: { visible: false } }),
  });

  const rightFingerConstraint = Constraint.create({
    bodyA: rightFinger.lower,
    bodyB: giftDetector,
    stiffness: 0.1,
    length: options.giftDetector.handConstraintLength,
    ...(!debug && { render: { visible: false } }),
  });

  const constraints = Composite.create();
  Composite.add(constraints, [
    bodyConstraint,
    leftFingerConstraint,
    rightFingerConstraint,
  ]);

  return [giftDetector, constraints];
};

const createCraneHand = (screen, lastRopeSegment) => {
  const [craneUpper, craneUpperConstraint] = createCraneUpper(
    screen,
    lastRopeSegment
  );
  const [craneLower, craneLowerConstraint] = createCraneLower(
    screen,
    craneUpper,
    lastRopeSegment
  );

  const craneLeftFinger = createCraneFinger(
    screen,
    craneUpper,
    craneLower,
    false
  );

  const craneRightFinger = createCraneFinger(
    screen,
    craneUpper,
    craneLower,
    true
  );

  const [craneStopDetector, craneStopDetectorConstraint] =
    createCraneStopDetector(screen, craneLower);
  const [giftDetector, giftDetectorConstraint] = createGiftDetector(
    screen,
    craneLower,
    craneLeftFinger,
    craneRightFinger
  );

  const fingersGapConstraint = Constraint.create({
    bodyA: craneRightFinger.lower,
    bodyB: craneLeftFinger.lower,
    pointA: {
      x: options.hand.lowerTipX,
      y: options.hand.lowerTipY,
    },
    pointB: {
      x: -options.hand.lowerTipX,
      y: options.hand.lowerTipY,
    },
    stiffness: ALMOST_ZERO,
    damping: 1,
    ...(!debug && { render: { visible: false } }),
  });

  const craneHand = Composite.create();
  Composite.add(craneHand, [
    craneLower,
    craneUpper,
    craneLowerConstraint,
    craneUpperConstraint,
    craneRightFinger,
    craneLeftFinger,
    fingersGapConstraint,
    craneStopDetector,
    craneStopDetectorConstraint,
    giftDetector,
    giftDetectorConstraint,
  ]);

  craneHand.upper = craneUpper;
  craneHand.lower = craneLower;
  craneHand.rightFinger = craneRightFinger;
  craneHand.leftFinger = craneLeftFinger;
  craneHand.fingersGap = fingersGapConstraint;
  craneHand.giftDetector = giftDetector;
  craneHand.stopDetector = craneStopDetector;

  return craneHand;
};

export const createCrane = (screen, engine) => {
  // creation order matters!
  const craneRope = createCraneRope(screen);
  const craneBase = createCraneBase(screen);

  const lastRopeSegment = craneRope.bodies[craneRope.bodies.length - 1];
  const craneHand = createCraneHand(screen, lastRopeSegment);

  const ropeConstraint = Constraint.create({
    bodyA: craneBase.bodies[0],
    bodyB: craneRope.bodies[0],
    pointA: {
      x: 0,
      y: options.ropeSegment.rootY,
    },
    pointB: { x: 0, y: -options.ropeSegment.height / 2 },
    length: 0,
    ...(!debug && { render: { visible: false } }),
  });
  Composite.add(craneRope, ropeConstraint);

  const crane = Composite.create();
  Composite.add(crane, [craneRope, craneBase, craneHand]);

  craneRope.rootConstraint = ropeConstraint;
  crane.base = craneBase;
  crane.rope = craneRope;
  crane.hand = craneHand;

  return crane;
};

// https://stackoverflow.com/a/65417914
function addRigidBodyConstraints(
  bodyA,
  bodyB,
  stiffness = 0.1,
  offsetA = Vector.create(0, 0),
  offsetB = Vector.create(0, 0)
) {
  function makeConstraint(posA, posB) {
    return Constraint.create({
      bodyA: bodyA,
      bodyB: bodyB,
      pointA: posA,
      pointB: posB,
      // stiffness larger than 0.1 is sometimes unstable
      stiffness: stiffness,
      render: { visible: false }, // remove this line causes memory leak
    });
  }

  return [
    makeConstraint(Vector.sub(bodyB.position, bodyA.position), offsetB),
    makeConstraint(offsetA, Vector.sub(bodyA.position, bodyB.position)),
  ];
}
