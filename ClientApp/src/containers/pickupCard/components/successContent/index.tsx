import PopUp from "../../../../assets/SpinWheelPictures/AssesntissGIft.png";
import SadFace from "../../../../assets/SpinWheelPictures/Sadface.png";
import "./styles.css";

type Props = {
  prize: string;
  onAgain?: () => void;
};

function SuccessContent({ prize, onAgain }: Props) {
  return (
    <div className="popup-content pyro">
      {prize !== "Better Luck Next Time" && (
        <>
          <div className="before" />
          <div className="after" />
        </>
      )}

      <div className="popup-header">
        <h2 className="text-cg">
          {prize === "Better Luck Next Time"
            ? "Better Luck Next Time"
            : "Congratulations!"}
        </h2>
      </div>

      <div className="popup-body">
        <p>{prize === "Better Luck Next Time" ? "" : "You have won"}</p>
        <p className="popup-body-prize">
          {prize === "Better Luck Next Time" ? "" : prize}
        </p>
        <div className="popup-img-wrapper">
          <img
            className="popup-img"
            key={prize === "Better Luck Next Time" ? SadFace : PopUp}
            src={prize === "Better Luck Next Time" ? SadFace : PopUp}
            alt={prize === "Better Luck Next Time" ? "sad face" : "gift box"}
          />
        </div>
      </div>

      <div className="popup-footer">
        <button
          onClick={onAgain}
          className="button-popup-footer prize-button playAgain"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

export default SuccessContent;
