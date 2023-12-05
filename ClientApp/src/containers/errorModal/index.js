import React from "react";
import OutOfChances from "../../assets/SpinWheelPictures/OutOfChances.png";
import "./ErrorModal.css";

const ErrorModal = props => {
  return (
    <div
      className={`outOfChancesModal1 ${props.opaciti01} ${
        props.showModal ? "" : "hidden"
      }`}
    >
      <div className={`popup-content1 ${props.route40}`}>
        <div className={`popup-box1`}>
          <div className="popup-header1 ">
            <h4 className="text-chance1">{props.errorMsg}</h4>
          </div>
          <div className="popup-body1">
            <p className="text-gradient notice-prize1"></p>
            <img
              className="outOfChances-img1"
              src={props.image ?? OutOfChances}
              alt="error"
            />
          </div>
          <div className="popup-footer1">
            <button className="closeChance1" onClick={props.onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
