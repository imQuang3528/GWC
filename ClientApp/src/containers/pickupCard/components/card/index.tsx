import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { animate } from "../../homebrew-waapi-assistant/animate";
import { AnimationControls } from "../../homebrew-waapi-assistant/controls";
import { CardProps, CardRef, SafeCardRef } from "./header";
import "./styles.css";

const Card = forwardRef<CardRef, CardProps>(
  (
    {
      id,
      cardFloating = true,
      cardFloatingDelta,
      cardFloatingTime,
      cardShakingTime,
      frontContent,
      backImage,
      size,
      debug,
    },
    ref
  ) => {
    const [isFloating, setIsFloating] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const floatingAnimation = useRef<AnimationControls>();
    const shakingAnimation = useRef<AnimationControls>();
    const cardContainerRef = useRef<HTMLDivElement | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const cardShadowRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({
      elems:
        cardRef.current && cardContainerRef.current && cardShadowRef.current
          ? {
              card: cardRef.current,
              cardContainer: cardContainerRef.current,
              cardShadow: cardShadowRef.current,
            }
          : null,
      card: cardRef.current,
      cardContainer: cardContainerRef.current,
      cardShadow: cardShadowRef.current,
      getId: () => id,
      startFloatingAnimation: () => {
        setIsFloating(true);
      },
      stopFloatingAnimation: (cancel = true) => {
        if (cancel) {
          floatingAnimation.current?.cancel();
        } else {
          floatingAnimation.current?.stop();
        }
        setIsFloating(false);
      },
      startShakingAnimation: () => {
        floatingAnimation.current?.stop();
        setIsShaking(true);
      },
      stopShakingAnimation: () => {
        shakingAnimation.current?.cancel();
        setIsShaking(false);
      },
      startLoading: () => setIsLoading(true),
      stopLoading: (delayed = false) => {
        if (delayed) {
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        } else {
          setIsLoading(false);
        }
      },
    }));

    useEffect(() => {
      if (cardRef.current) {
        if (isShaking) {
          shakingAnimation.current = animate(
            cardRef.current,
            {
              transform: ["%s translateZ(6px)", "%s translateZ(-6px)"],
            },
            {
              iterations: Infinity,
              direction: "alternate",
              duration: cardShakingTime * 500,
            }
          );
        } else if (cardFloating && isFloating) {
          const halfCardFloatingDelta = cardFloatingDelta / 2;
          const duration = cardFloatingTime * 500;

          floatingAnimation.current = animate(
            cardRef.current,
            {
              transform: [
                `scale(var(--card-scale)) translateY(calc(${-halfCardFloatingDelta}px / var(--card-scale)))`,
                `scale(var(--card-scale)) translateY(calc(${halfCardFloatingDelta}px / var(--card-scale)))`,
              ],
            },
            {
              duration,
              iterations: Infinity,
              direction: "alternate",
              delay: -duration * ((id % 2) + 0.5), // 0.5 is when the card is floating in the middle (initial position)
            }
          );

          // TODO: update card shadow scaling to fit with the card's current height
          // cardShadow.style.transform = `scale(${
          //   1 + cardFloatingHeight * (1 - cardFloatingDelta / 10)
          // })`;,
        }

        return () => {
          floatingAnimation.current?.cancel();
          shakingAnimation.current?.cancel();
        };
      }
    }, [
      cardFloating,
      cardFloatingDelta,
      cardFloatingTime,
      isFloating,
      id,
      isShaking,
      cardShakingTime,
    ]);

    return (
      <div
        ref={cardContainerRef}
        className="card-container"
        data-id={id}
        style={isLoading ? { zIndex: 1000 } : undefined} // css bugs out when adding an overlay element to the card on older android
      >
        <div className="card-placeholder" />
        <div ref={cardRef} className="card" style={size}>
          <div
            className={`card-face card-face_back ${
              !backImage ? "card-face-empty" : ""
            }`}
          >
            {backImage && (
              <img
                draggable={false}
                src={backImage}
                alt={`card ${id}'s back`}
              />
            )}

            <div
              className={`loading-card-overlay ${isLoading ? "" : "hidden"}`}
            >
              <div className="loader">
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
          <div
            className={`card-face card-face_front ${
              !frontContent ? "card-face-empty" : ""
            }`}
          >
            {frontContent && typeof frontContent === "string" ? (
              <img
                draggable={false}
                src={frontContent}
                alt={`card ${id}'s front`}
              />
            ) : (
              frontContent
            )}
          </div>
          {debug && <span className="card-debug-id">{id}</span>}
        </div>
        <div ref={cardShadowRef} className="card-shadow" />
      </div>
    );
  }
);

export default Card;

export const extractCardId = (el: Element): number | undefined => {
  const card = el.closest("[data-id]");
  return card instanceof HTMLElement ? Number(card.dataset["id"]) : undefined;
};

export const ensureCardRef = (
  cardRef: CardRef | null | undefined
): cardRef is SafeCardRef => !!cardRef?.elems;
