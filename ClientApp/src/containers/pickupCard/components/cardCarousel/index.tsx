import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AdvancedAnimationOptions,
  animate,
} from "../../homebrew-waapi-assistant/animate";
import { branch } from "../../homebrew-waapi-assistant/branch";
import { AnimationControls } from "../../homebrew-waapi-assistant/controls";
import { sequence } from "../../homebrew-waapi-assistant/sequence";
import { stagger } from "../../homebrew-waapi-assistant/stagger";
import Card, { ensureCardRef, extractCardId } from "../card";
import { CardProps, CardRef } from "../card/header";
import backImg from "./../../assets/card/card1.png";
import {
  CLICK_PIXEL_THRESHOLD,
  CardCarouselProps,
  CardCarouselRef,
  Click,
  Cursor,
  DEALING_FINISH_SKEW_DEGREE,
  FirstAnimation,
  KINETIC_SNAPPING_VELOCITY_LOWER_BOUND,
  KINETIC_STOP_DEGREE,
  KINETIC_TRACKING_RATE,
  KINETIC_VELOCITY_LOWER_BOUND,
  KineticTracking,
  Revealing,
  Snapping,
  TO_DEALING_DURATION,
  TO_SHUFFLING_DELAY,
  TO_SHUFFLING_DURATION,
} from "./header";
import "./styles.css";
import {
  clamp,
  ensureCardsRef,
  mod,
  shuffle,
  throttle,
  transpose,
} from "./utils";

const windowStyle = window.getComputedStyle(document.body);

// CSS variables
const SHADOW_SPACE_FROM_CARD = windowStyle.getPropertyValue(
  "--shadow-space-from-card"
);
const SHADOW_WIDTH = windowStyle.getPropertyValue("--shadow-width");
const SHADOW_OPACITY = windowStyle.getPropertyValue("--shadow-opacity");

const CardCarousel = forwardRef<CardCarouselRef, CardCarouselProps>(
  (
    {
      interactionContainerRef,
      numberOfCards,
      autoRotate = true,
      autoRotateTime,
      kineticRotate = true,
      kineticRotateWeight,
      kineticDecelerationRate,
      manualRotate = true,
      manualRotateDistance,
      shufflingAnimation = true,
      numberOfShuffling,
      shufflingMaxDistance,
      shufflingHeight,
      shufflingDuration,
      firstAnimation = true,
      onFirstAnimationFinish,
      redealingAnimation = true,
      dealingDeckDistanceFromCenter,
      dealingDirection,
      dealingDuration,
      dealingDelay,
      dealingFlyHeight,
      mixingDuration,
      mixingOvershoot,
      cardDistance,
      cardSnapping,
      cardSnappingTime,
      cardRevealingDuration,
      cardRevealLimitDistance,
      shouldCardReveal,
      onCardRevealStart,
      onCardRevealEnd,
      onCardRevealFinish,
      revealBackdrop = true,
      cardSkew,
      maxFramerate,
      cardProps,
      cardContents,
      cardBacks,
      getRevealedCardContent,
      debug,
    },
    ref
  ) => {
    // Element refs
    const [carousel, setCarousel] = useState<HTMLDivElement | null>();
    const cardsRef = useRef<(CardRef | null)[]>([]);
    const [revealBarrier, setRevealBarrier] = useState<HTMLDivElement | null>();
    const [backdrop, setBackdrop] = useState<HTMLDivElement | null>();

    const handleCarousel = useCallback(
      (el: HTMLDivElement) => setCarousel(el),
      []
    );
    const handleRevealBarrier = useCallback(
      (el: HTMLDivElement) => setRevealBarrier(el),
      []
    );
    const handleBackdrop = useCallback(
      (el: HTMLDivElement) => setBackdrop(el),
      []
    );
    const handleCard = useCallback((el: CardRef | null, i: number) => {
      cardsRef.current[i] = el;
    }, []);

    useEffect(() => {
      cardsRef.current = cardsRef.current.slice(0, numberOfCards);
    }, [numberOfCards]);

    // State refs
    const frameIdRef = useRef<number | null>();
    const lastTimeRef = useRef<number>(0);
    const lastCarouselDegreeRef = useRef<number>(0);

    const cursorRef = useRef<Cursor>({ x: 0, y: 0, pressed: false });
    const lastCursorRef = useRef<Cursor | null>(null);
    const clickRef = useRef<Click>({ downCursor: null, clicked: false });

    const firstAnimationRef = useRef<FirstAnimation>({ state: "running" });
    const snappingRef = useRef<Snapping>({ state: "pre_snapping", goal: 0 });
    const revealingRef = useRef<Revealing>({
      state: "pre_revealing",
    });
    const kineticTrackingRef = useRef<KineticTracking>({
      state: "no_kinetic_scrolling",
      velocity: 0,
      amplitude: 0,
      lastTime: 0,
      lastPos: 0,
      goal: 0,
    });

    // Derived states
    const {
      carouselDegreePerMs,
      cardSingleAngle,
      carouselSnappingDegreePerMs,
      cardRevealLimitFromCenter,
    } = useMemo(() => {
      const carouselDegreePerMs = 360 / (autoRotateTime * 1000);
      const cardSingleAngle = 360 / numberOfCards;
      const carouselSnappingDegreePerMs = 360 / (cardSnappingTime * 1000);
      const cardRevealLimitFromCenter = cardDistance - cardRevealLimitDistance;

      return {
        carouselDegreePerMs,
        cardSingleAngle,
        carouselSnappingDegreePerMs,
        cardRevealLimitFromCenter,
      };
    }, [
      autoRotateTime,
      cardDistance,
      cardRevealLimitDistance,
      cardSnappingTime,
      numberOfCards,
    ]);

    const [cardFrontImgs, setCardFrontImgs] = useState<
      (CardProps["frontContent"] | undefined)[]
    >([]);
    useEffect(() => {
      if (!getRevealedCardContent && cardContents)
        setCardFrontImgs(
          Array.from(
            { length: numberOfCards },
            () => cardContents[Math.floor(Math.random() * cardContents.length)]
          )
        );
    }, [cardContents, getRevealedCardContent, numberOfCards]);

    // Kinetic tracking
    const kineticTrack = useCallback(() => {
      const kineticTracking = kineticTrackingRef.current;
      const now = performance.now();

      const deltaTime = now - kineticTracking.lastTime;
      kineticTracking.lastTime = now;

      const deltaPos = cursorRef.current.x - kineticTracking.lastPos;
      kineticTracking.lastPos = cursorRef.current.x;

      const newVel = deltaPos / ((1 + deltaTime) / 1000);

      if (!(newVel === 0 && !cursorRef.current.pressed)) {
        // simple moving average filter
        kineticTracking.velocity =
          0.8 * newVel + 0.2 * kineticTracking.velocity;
      }
    }, []);

    const kineticStartTracking = useCallback(() => {
      window.clearInterval(kineticTrackingRef.current.tracker);
      kineticTrackingRef.current = {
        state: "no_kinetic_scrolling",
        velocity: 0,
        amplitude: 0,
        goal: 0,
        lastTime: performance.now(),
        lastPos: cursorRef.current.x,
        tracker: window.setInterval(kineticTrack, KINETIC_TRACKING_RATE),
      };
    }, [kineticTrack]);

    const kineticEndTracking = useCallback(() => {
      const kineticTracking = kineticTrackingRef.current;
      window.clearInterval(kineticTracking.tracker);
      kineticTrack();

      const velocityLowerBound = cardSnapping
        ? KINETIC_SNAPPING_VELOCITY_LOWER_BOUND
        : KINETIC_VELOCITY_LOWER_BOUND;
      if (Math.abs(kineticTracking.velocity) > velocityLowerBound) {
        kineticTracking.amplitude =
          (1 / kineticRotateWeight) * kineticTracking.velocity;
        kineticTracking.goal =
          lastCarouselDegreeRef.current + kineticTracking.amplitude;

        // Round the target to the nearest card position
        if (cardSnapping) {
          kineticTracking.goal =
            Math.ceil(kineticTracking.goal / cardSingleAngle) * cardSingleAngle;
          kineticTracking.amplitude =
            kineticTracking.goal - lastCarouselDegreeRef.current;
        }

        kineticTracking.state = "kinetic_scrolling";
        kineticTracking.lastTime = performance.now();
      }
    }, [cardSingleAngle, cardSnapping, kineticRotateWeight, kineticTrack]);

    // Interaction handling
    useEffect(() => {
      if (!interactionContainerRef) return;

      const handleTouch = (e: MouseEvent | TouchEvent) => {
        const touchPoint = "changedTouches" in e ? e.changedTouches[0] : e;
        cursorRef.current = {
          x: touchPoint.clientX,
          y: touchPoint.clientY,
          pressed: true,
        };

        clickRef.current.downCursor = cursorRef.current;
        if (e.target instanceof Element) {
          clickRef.current.clickedCardId = extractCardId(e.target);
        }

        kineticRotate && kineticStartTracking();
      };

      const handleTouchMove = throttle(
        (e: MouseEvent | TouchEvent) => {
          const touchPoint = "changedTouches" in e ? e.changedTouches[0] : e;
          cursorRef.current = {
            ...cursorRef.current,
            x: touchPoint.clientX,
            y: touchPoint.clientY,
          };
        },
        maxFramerate === undefined ? 0 : 1000 / maxFramerate
      );

      const handleUntouch = () => {
        cursorRef.current = { ...cursorRef.current, pressed: false };
        lastCursorRef.current = null;

        kineticRotate && kineticEndTracking();
      };

      interactionContainerRef.addEventListener("mousedown", handleTouch);
      interactionContainerRef.addEventListener("touchstart", handleTouch);
      interactionContainerRef.addEventListener("mousemove", handleTouchMove);
      interactionContainerRef.addEventListener("touchmove", handleTouchMove);
      interactionContainerRef.addEventListener("mouseup", handleUntouch);
      interactionContainerRef.addEventListener("touchend", handleUntouch);

      return () => {
        interactionContainerRef.removeEventListener("mousedown", handleTouch);
        interactionContainerRef.removeEventListener("touchstart", handleTouch);
        interactionContainerRef.removeEventListener(
          "mousemove",
          handleTouchMove
        );
        interactionContainerRef.removeEventListener(
          "touchmove",
          handleTouchMove
        );
        interactionContainerRef.removeEventListener("mouseup", handleUntouch);
        interactionContainerRef.removeEventListener("touchend", handleUntouch);
      };
    }, [
      interactionContainerRef,
      kineticEndTracking,
      kineticRotate,
      kineticStartTracking,
      maxFramerate,
    ]);

    // Shuffling animation
    const runShufflingAnimation = useCallback(
      (transition?: boolean) => {
        if (!ensureCardsRef(cardsRef.current)) {
          return;
        }

        const shuffleIndices = transpose(
          // transpose to make the indices card-independence
          Array(numberOfShuffling + 1)
            .fill(Array.from(Array(numberOfCards).keys()))
            .map(
              (arr, i) =>
                i === 0
                  ? [...arr].reverse() // prepare for the transition animation
                  : i < numberOfShuffling
                  ? shuffle(arr)
                  : arr // leave the last states intact
            )
        );

        const startState = `
        rotateY(${-lastCarouselDegreeRef.current}deg)
        translateZ(${dealingDeckDistanceFromCenter}px)
        translateY(calc(${SHADOW_SPACE_FROM_CARD} + 50%))
        rotateX(90deg)
        rotateZ(90deg)
      `;
        const keyframes: Keyframe[][] = shuffleIndices.map(indices =>
          indices.reduce((res, idx, i) => {
            const layer = `translateZ(calc(${shufflingHeight}px + ${SHADOW_WIDTH} + ${
              idx + 1
            }px))`;
            res.push({
              transform: `${startState} ${layer} translateY(0px)`,
            });

            if (i !== numberOfShuffling) {
              res.push({
                transform: `${startState} ${layer} translateY(calc(${
                  // split the deck into 2
                  idx < numberOfCards / 2 ? -1 : 1
                } * ${shufflingMaxDistance}px))`,
              });
            } else {
              // lengthen the rest state after shuffling
              res.push({
                transform: `${startState} ${layer} translateY(0px)`,
              });
            }

            return res;
          }, [])
        );

        const controls = sequence([
          () =>
            transition && ensureCardsRef(cardsRef.current)
              ? branch(
                  cardsRef.current,
                  card => [
                    card.elems.cardContainer,
                    card.elems.card,
                    card.elems.cardShadow,
                  ],
                  [
                    [
                      i => ({
                        transform: ["%s", keyframes[i][0].transform as string],
                      }),
                    ],
                    [
                      {
                        transform: [
                          "%s",
                          "scale(var(--card-scale)) translateY(0px)",
                        ],
                      },
                    ],
                    [{ opacity: ["%s", "0", "%k1^"], offset: [0, 0.3, 1] }],
                  ],
                  {
                    duration: TO_SHUFFLING_DURATION,
                    delay: stagger(TO_SHUFFLING_DELAY),
                  }
                )
              : null,
          () =>
            ensureCardsRef(cardsRef.current)
              ? branch(
                  cardsRef.current,
                  card => [card.elems.cardContainer, card.elems.cardShadow],
                  [
                    [
                      i => keyframes[i],
                      {
                        duration: shufflingDuration * numberOfShuffling * 1000,
                        easing: "linear",
                      },
                    ],
                    [{ opacity: 0 }, 0], // turn off shadows
                  ]
                )
              : null,
        ]);

        return controls;
      },
      [
        dealingDeckDistanceFromCenter,
        numberOfCards,
        numberOfShuffling,
        shufflingDuration,
        shufflingHeight,
        shufflingMaxDistance,
      ]
    );

    // Dealing animation
    const runDealingAnimation = useCallback(
      (transition?: boolean) => {
        if (!ensureCardsRef(cardsRef.current)) {
          return;
        }

        const direction = dealingDirection === "toward" ? 1 : -1;
        const animationOption: AdvancedAnimationOptions = {
          duration: dealingDuration * 1000,
          delay: stagger(dealingDelay * 1000, { from: "last" }),
        };

        const startState = `
          rotateY(${-lastCarouselDegreeRef.current}deg)
          translateZ(${dealingDeckDistanceFromCenter}px)
          translateY(calc(${SHADOW_SPACE_FROM_CARD} + 50%))
          rotateX(90deg)
          translateZ(calc(${SHADOW_WIDTH} + %ipx + 1px))
        `;

        const controls = sequence([
          () =>
            transition && ensureCardsRef(cardsRef.current)
              ? animate(
                  cardsRef.current.map(card => card.elems.cardContainer),
                  { transform: ["%s", startState] },
                  TO_DEALING_DURATION
                )
              : null,
          () =>
            ensureCardsRef(cardsRef.current)
              ? branch(
                  cardsRef.current,
                  card => [card.elems.cardContainer, card.elems.cardShadow],
                  [
                    [
                      {
                        transform: [
                          startState,
                          `
                            %k1^
                            translateY(${direction * cardDistance}px)
                          `,
                          `
                            %k1^
                            translateZ(${dealingFlyHeight}px)
                            rotatex(-${DEALING_FINISH_SKEW_DEGREE}deg)
                          `,
                          `
                            rotateY(${-lastCarouselDegreeRef.current}deg)
                            rotateY(calc(%i * ${cardSingleAngle}deg))
                            translateZ(${cardDistance}px)
                            rotateY(calc(-%i * ${cardSingleAngle}deg + ${cardSkew}deg)
                          `,
                        ],
                      },
                    ],
                    [
                      {
                        opacity: ["0", SHADOW_OPACITY],
                        offset: [0.8],
                      },
                    ],
                  ],
                  animationOption
                )
              : null,
        ]);

        return controls;
      },
      [
        cardDistance,
        cardSingleAngle,
        cardSkew,
        dealingDeckDistanceFromCenter,
        dealingDelay,
        dealingDirection,
        dealingDuration,
        dealingFlyHeight,
      ]
    );

    // Mixing animation
    const runMixingAnimation = useCallback(() => {
      if (!ensureCardsRef(cardsRef.current)) {
        return;
      }

      const animationOption: AdvancedAnimationOptions = {
        duration: mixingDuration * 1000,
      };

      const mixIndices = shuffle(Array.from(Array(numberOfCards).keys()));

      const controls = branch(
        cardsRef.current,
        card => [
          card.elems.cardContainer,
          card.elems.card,
          card.elems.cardShadow,
        ],
        [
          [
            i => ({
              transform: [
                "%s",
                `
                  rotateY(${-lastCarouselDegreeRef.current}deg)
                  translateZ(${mixIndices[i]}px)
                `,
                `
                  rotateY(${-lastCarouselDegreeRef.current}deg)
                  rotateY(calc(%i * ${cardSingleAngle}deg))
                  translateZ(${cardDistance + mixingOvershoot}px)
                  rotateY(calc(-%i * ${cardSingleAngle}deg + ${cardSkew}deg)
                `,
                `
                  rotateY(${-lastCarouselDegreeRef.current}deg)
                  rotateY(calc(%i * ${cardSingleAngle}deg))
                  translateZ(${cardDistance}px)
                  rotateY(calc(-%i * ${cardSingleAngle}deg + ${cardSkew}deg)
                `,
              ],
              offset: [0, 0.4, 0.725],
            }),
          ],
          [
            {
              transform: [
                "%s",
                "scale(var(--card-scale)) translateY(0px)",
                "%k1^",
                "%k1^",
              ],
            },
          ],
          [
            {
              opacity: ["%s", SHADOW_OPACITY, SHADOW_OPACITY],
              offset: [0, 0.4],
            },
          ],
        ],
        animationOption
      );

      return controls;
    }, [
      cardDistance,
      cardSingleAngle,
      cardSkew,
      mixingDuration,
      mixingOvershoot,
      numberOfCards,
    ]);

    const runFirstAnimation = useCallback(
      (finishCallback: () => void) => {
        let controls: AnimationControls | undefined;

        switch (firstAnimationRef.current.state) {
          case "running":
            if (firstAnimation) {
              cardsRef.current.forEach(card => card?.stopFloatingAnimation());
              controls = sequence([
                () => (shufflingAnimation && runShufflingAnimation()) || null,
                () => runDealingAnimation(shufflingAnimation) || null,
              ]);

              controls.addEventListener("finish", () => {
                cardsRef.current.forEach(card =>
                  card?.startFloatingAnimation()
                );
                onFirstAnimationFinish?.();

                finishCallback();
                firstAnimationRef.current.state = "done_running";
              });
            } else {
              cardsRef.current.forEach(card => card?.startFloatingAnimation());
              onFirstAnimationFinish?.();

              finishCallback();
              firstAnimationRef.current.state = "done_running";
            }

            break;
          case "done_running":
            finishCallback();
        }

        return controls?.cancel;
      },
      [
        firstAnimation,
        onFirstAnimationFinish,
        runDealingAnimation,
        runShufflingAnimation,
        shufflingAnimation,
      ]
    );

    // Rotate handlings
    const handleAutoRotate = useCallback(
      (delta: number, carouselDegree: number): number =>
        mod(carouselDegree + carouselDegreePerMs * delta, 360),
      [carouselDegreePerMs]
    );

    const handleManualRotate = useCallback(
      (carouselDegree: number): number => {
        if (revealingRef.current.state === "pre_revealing") {
          const cursorDelta = lastCursorRef.current
            ? cursorRef.current.x - lastCursorRef.current.x
            : 0;
          lastCursorRef.current = cursorRef.current;

          // prepare for card snapping
          if (cardSnapping) snappingRef.current.state = "pre_snapping";

          return mod(
            carouselDegree + (cursorDelta * 360) / manualRotateDistance,
            360
          );
        }

        return carouselDegree;
      },
      [cardSnapping, manualRotateDistance]
    );

    // TODO: smoothly merge velocities of the kinetic scrolling and auto scrolling if autoScroll is enabled
    const handleKineticRotate = useCallback(
      (now: number, carouselDegree: number): number => {
        const goalDistance =
          -kineticTrackingRef.current.amplitude *
          Math.exp(
            -(now - kineticTrackingRef.current.lastTime) /
              kineticDecelerationRate
          );

        if (Math.abs(goalDistance) > KINETIC_STOP_DEGREE) {
          carouselDegree = mod(
            kineticTrackingRef.current.goal + goalDistance,
            360
          );
        } else {
          carouselDegree = mod(kineticTrackingRef.current.goal, 360);
          kineticTrackingRef.current.state = "no_kinetic_scrolling";
        }

        return carouselDegree;
      },
      [kineticDecelerationRate]
    );

    // Card snap handling
    const handleSnap = useCallback(
      (delta: number, carouselDegree: number): number => {
        const snapping = snappingRef.current;

        switch (snapping.state) {
          case "pre_snapping":
            snapping.goal =
              Math.round(carouselDegree / cardSingleAngle) * cardSingleAngle;
            snapping.state = "snapping";
            break;
          case "snapping":
            const goalDistance = snapping.goal - carouselDegree;
            const carouselSnappingDegree = carouselSnappingDegreePerMs * delta;

            if (Math.abs(goalDistance) >= carouselSnappingDegree) {
              carouselDegree = mod(
                carouselDegree +
                  Math.sign(goalDistance) * carouselSnappingDegree,
                360
              );
            } else {
              carouselDegree = mod(carouselDegree + goalDistance, 360);

              snapping.snappedCard =
                cardsRef.current[
                  (numberOfCards - snapping.goal / (360 / numberOfCards)) %
                    numberOfCards
                ];
              snapping.state = "done_snapping";
            }
            break;
          case "done_snapping": // do nothing
        }

        return carouselDegree;
      },
      [cardSingleAngle, carouselSnappingDegreePerMs, numberOfCards]
    );

    // Card reveal handling
    const handleReveal = useCallback(
      (willReveal?: boolean) => {
        const revealing = revealingRef.current;

        switch (revealing.state) {
          case "pre_revealing":
            if (willReveal === false) return;

            const clickedCardId = clickRef.current.clickedCardId;
            if (clickedCardId === undefined) return;

            const selectedCardAngle = clickedCardId * cardSingleAngle;
            const selectedCard = cardsRef.current.find(
              card => card?.getId() === clickedCardId
            );

            if (!ensureCardRef(selectedCard)) return;

            if (shouldCardReveal && !shouldCardReveal()) return;

            revealing.revealCard = selectedCard;
            revealing.revealId = clickedCardId;
            revealing.state = "revealing";

            // Find the nearest path for the selected card to travel to the front
            // Very magical, but it works, so don't ask me
            const angleDirection =
              Math.trunc(
                clamp(
                  (selectedCardAngle + lastCarouselDegreeRef.current) / 180 - 2,
                  -1,
                  1
                )
              ) + 1;
            const cardAngle =
              angleDirection * 360 - lastCarouselDegreeRef.current;

            const reveal = () => {
              if (backdrop) {
                backdrop.style.transform = `rotateY(${cardAngle}deg) translateZ(210px) translateY(-50%)`;
                backdrop.style.animationDuration = cardRevealingDuration + "s";
                backdrop.classList.add("shown");
                backdrop.classList.add("isShowing");
              }

              onCardRevealStart?.();

              const revealAnimation = branch(
                selectedCard.elems,
                elems => [elems.cardContainer, elems.card, elems.cardShadow],
                [
                  [
                    {
                      transform: `rotateY(${cardAngle}deg) translateZ(300px) translateY(-65px) rotateY(180deg)`,
                    },
                  ],
                  [
                    {
                      transform: "scale(var(--card-scale)) translateY(0px)",
                    },
                  ],
                  [
                    {
                      opacity: ["%s", "0", "0"],
                      offset: [0, 0.5],
                    },
                  ],
                ],
                {
                  duration: cardRevealingDuration * 1000,
                  persist: false,
                }
              );

              revealing.cardRevealAnimation = revealAnimation;
              revealAnimation.addEventListener("finish", () => {
                revealing.state = "done_revealing";
                backdrop?.classList.remove("isShowing");
              });
            };

            if (getRevealedCardContent) {
              selectedCard.startShakingAnimation();
              selectedCard.startLoading();
              getRevealedCardContent()
                .then(content => {
                  selectedCard.stopShakingAnimation();
                  selectedCard.stopFloatingAnimation(false);
                  selectedCard.stopLoading(true);

                  setCardFrontImgs(
                    Array(numberOfCards)
                      .fill(undefined)
                      .map((_, i) => {
                        if (i === clickedCardId) return content;
                        return undefined;
                      })
                  );

                  reveal();
                })
                .catch(() => {
                  revealing.revealId = undefined;
                  revealing.revealCard = undefined;
                  revealing.state = "pre_revealing";
                  selectedCard.stopShakingAnimation();
                  selectedCard.stopLoading();
                });
            } else {
              reveal();
            }
            break;
          case "revealing": // do nothing
            break;
          case "done_revealing":
            if (willReveal === true) return;

            revealing.revealId = undefined;
            revealing.state = "unrevealing";

            backdrop?.classList.add("isHiding");
            const finishHideBackdrop = () => {
              backdrop?.classList.remove("isHiding");
              backdrop?.classList.remove("shown");
              backdrop?.removeEventListener("animationend", finishHideBackdrop);
            };
            backdrop?.addEventListener("animationend", finishHideBackdrop);

            (async () => {
              if (redealingAnimation) {
                revealing.cardRevealAnimation?.reverse();
                await new Promise<void>(resolve => {
                  revealing.cardRevealAnimation?.addEventListener(
                    "finish",
                    resolve
                  );
                });
              }

              revealing.cardRevealAnimation?.stop();

              onCardRevealEnd?.();

              cardsRef.current.forEach(card => {
                card?.stopFloatingAnimation(false);
              });

              if (redealingAnimation) {
                await sequence([
                  () => runShufflingAnimation(true) || null,
                  () => runDealingAnimation(true) || null,
                ]).finished;
              } else {
                await runMixingAnimation()?.finished;
              }

              cardsRef.current.forEach(card => card?.startFloatingAnimation());
              lastCarouselDegreeRef.current = 0;

              onCardRevealFinish?.();

              revealing.state = "pre_revealing";
            })();
            break;
          case "unrevealing": // do nothing
        }
      },
      [
        cardSingleAngle,
        shouldCardReveal,
        getRevealedCardContent,
        backdrop,
        onCardRevealStart,
        cardRevealingDuration,
        numberOfCards,
        onCardRevealEnd,
        redealingAnimation,
        onCardRevealFinish,
        runShufflingAnimation,
        runDealingAnimation,
        runMixingAnimation,
      ]
    );

    // Ref
    useImperativeHandle(ref, () => ({
      closeRevealedCard: () => {
        handleReveal(false);
      },
    }));

    // Main loop
    useEffect(() => {
      if (!carousel || !revealBarrier || !cardsRef.current.length) return;

      const cancelAnimation = runFirstAnimation(() => {
        const tick: FrameRequestCallback = now => {
          frameIdRef.current = requestAnimationFrame(tick);
          const delta = now - lastTimeRef.current;

          if (maxFramerate && delta < 1000 / maxFramerate) return;

          lastTimeRef.current = now;
          let carouselDegree = lastCarouselDegreeRef.current;
          let carouselLock = false;

          if (!cursorRef.current.pressed) {
            if (clickRef.current.clicked) {
              handleReveal(true);
              clickRef.current.clicked = false;
            }

            if (revealingRef.current.state === "pre_revealing") {
              if (kineticTrackingRef.current.state === "kinetic_scrolling") {
                carouselDegree = handleKineticRotate(now, carouselDegree);
              } else if (autoRotate) {
                carouselDegree = handleAutoRotate(delta, carouselDegree);
              } else if (cardSnapping) {
                carouselDegree = handleSnap(delta, carouselDegree);
              }
            }
          } else {
            const downCursor = clickRef.current.downCursor;

            if (
              downCursor &&
              Math.abs(downCursor.x - cursorRef.current.x) <
                CLICK_PIXEL_THRESHOLD &&
              Math.abs(downCursor.y - cursorRef.current.y) <
                CLICK_PIXEL_THRESHOLD
            ) {
              clickRef.current.clicked = true;
            } else {
              clickRef.current.clicked = false;

              if (manualRotate) {
                carouselDegree = handleManualRotate(carouselDegree);
              }
            }
          }

          if (revealingRef.current.state !== "pre_revealing") {
            carouselLock = true;
          }

          if (!carouselLock) {
            // Render carousel
            lastCarouselDegreeRef.current = carouselDegree;
            carousel.style.transform = `rotateY(${carouselDegree}deg)`;

            // Render reveal barrier
            revealBarrier.style.transform = `rotateY(-${carouselDegree}deg) translateZ(${cardRevealLimitFromCenter}px)`;

            // Render cards
            cardsRef.current.forEach((cardRef, i) => {
              if (revealingRef.current.revealId === i) return;
              if (!ensureCardRef(cardRef)) return;
              const { cardContainer } = cardRef.elems;

              const cardDegree = cardSingleAngle * i;
              cardContainer.style.transform = `rotateY(${cardDegree}deg) translateZ(${cardDistance}px) rotateY(${
                -(cardDegree + carouselDegree) + cardSkew
              }deg)`;
            });
          }
        };
        frameIdRef.current = requestAnimationFrame(tick);
      });

      return () => {
        cancelAnimation?.();
        frameIdRef.current && cancelAnimationFrame(frameIdRef.current);
      };
    }, [
      autoRotate,
      cardDistance,
      cardRevealLimitFromCenter,
      cardSingleAngle,
      cardSkew,
      cardSnapping,
      carousel,
      handleAutoRotate,
      handleKineticRotate,
      handleManualRotate,
      handleReveal,
      handleSnap,
      manualRotate,
      maxFramerate,
      revealBarrier,
      runDealingAnimation,
      runFirstAnimation,
    ]);

    return (
      <div ref={handleCarousel} className="card-carousel">
        {Array(numberOfCards)
          .fill(null) // placeholder
          .map((_, i) => (
            <Card
              key={i}
              id={i}
              ref={el => handleCard(el, i)}
              frontContent={cardFrontImgs[i]}
              backImage={
                cardBacks?.length ? cardBacks[i % cardBacks.length] : backImg
              }
              debug={debug}
              {...cardProps}
            />
          ))}
        <div
          ref={handleRevealBarrier}
          className={`carousel-reveal-barrier ${debug ? "debug" : ""}`}
        />
        {debug && <div className="carousel-debug-plane" />}
        {revealBackdrop && <div ref={handleBackdrop} className="backdrop" />}
      </div>
    );
  }
);

export default CardCarousel;
