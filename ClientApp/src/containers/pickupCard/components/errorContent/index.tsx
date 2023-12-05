import PopUp from "../../../../assets/SpinWheelPictures/OutOfChances.png";
import "./styles.css";

type Props = {
  message: string;
  onClose?: () => void;
};

function ErrorContent({ message, onClose }: Props) {
  return (
    <div className="error-popup-content">
      <div className="error-popup-header">
        <h2 className="text-error">{message}</h2>
      </div>

      <div className="error-popup-body">
        <div className="error-popup-img-wrapper">
          <img className="error-popup-img" src={PopUp} alt="" />
        </div>
      </div>

      <div className="error-popup-footer">
        <button onClick={onClose} className="button-error-popup-footer">
          OK
        </button>
      </div>
    </div>
  );
}

export default ErrorContent;
