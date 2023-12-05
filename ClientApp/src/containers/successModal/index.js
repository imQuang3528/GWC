import React, { useEffect, useRef, useState } from "react";
import PopUp from "../../assets/SpinWheelPictures/AssesntissGIft.png";
import SadFace from "../../assets/SpinWheelPictures/Sadface.png";
import "./Success.css";

const SuccessModal = props => {
  const [Congratulations, setCongratulations] = useState("");
  const [Congratulations1, setCongratulations1] = useState("");
  const popupRef = useRef();
  const popupContentRef = useRef();
  const textWonRef = useRef();
  useEffect(() => {
    if (textWonRef) {
      if (props.prize === "Better Luck Next Time") {
        setCongratulations("");
        setCongratulations1("");
      } else {
        setCongratulations("before");
        setCongratulations1("after");
      }
    }
  }, [props.prize]);

  useEffect(() => {
    if (props.growPos?.x && props.growPos?.y) {
      const { top, bottom, left, right } =
        popupRef.current.parentElement.getBoundingClientRect(); // use size of parent element because the popup can be hidden (size is 0)
      const [popupX, popupY] = [(right - left) / 2, (bottom - top) / 2];

      popupContentRef.current.style.setProperty(
        "--grow-offset-x",
        props.growPos.x - popupX + "px"
      );
      popupContentRef.current.style.setProperty(
        "--grow-offset-y",
        props.growPos.y - popupY + "px"
      );
    }
  }, [props.growPos]);

  return (
    <div
      ref={popupRef}
      className={`popUpPrize1
        ${props.growPos ? "grow-animation" : props.opaciti01}
        ${props.showModal ? "" : "hidden"}`}
    >
      <div
        ref={popupContentRef}
        className={`popup-content1 pyro ${
          props.growPos ? "grow-animation" : props.route40
        }`}
      >
        <div className={Congratulations} />
        <div className={Congratulations1} />
        <div className={`popup-box1`}>
          <div className="popup-header1 ">
            <h2 className="text-gradient1 text-cg1">
              {props.prize === "Better Luck Next Time"
                ? "Better Luck Next Time"
                : "Congratulations!"}
            </h2>
          </div>

          <div className="popup-body1">
            <p className="text-gradient1" ref={textWonRef}>
              {props.prize === "Better Luck Next Time" ? "" : "You have won"}
            </p>
            <p className="text-gradient1 popup-body-prize1">
              {props.prize === "Better Luck Next Time" ? "" : props.prize}
            </p>
            <img
              className="popup-img1"
              key={props.prize === "Better Luck Next Time" ? SadFace : PopUp}
              src={props.prize === "Better Luck Next Time" ? SadFace : PopUp}
              alt={
                props.prize === "Better Luck Next Time"
                  ? "sad face"
                  : "gift box"
              }
            />
          </div>

          <div className="popup-footer1">
            {props.onAgain && (
              <button
                onClick={props.onAgain}
                className="button-popup-footer1 prize-button1 playAgain1 "
              >
                Play Again
              </button>
            )}

            {props.onClose && (
              <button
                onClick={props.onClose}
                className="button-popup-footer1 prize-button1 closePrize1"
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
