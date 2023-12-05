import { postMessageToNative } from "../../utils/nativeCommunicator";
import ExitIcon from "./assets/ExitSvg";
import InfoIcon from "./assets/InfoSvg";
import "./styles.css";

const Header = ({ showDescBtn, onDescBtnPress }) => {
  const exit = () => {
    postMessageToNative("exit");
  };

  return (
    <header>
      <button className="header-btn exit-btn" onClick={exit}>
        <ExitIcon />
      </button>
      {showDescBtn && (
        <button className="header-btn desc-btn" onClick={onDescBtnPress}>
          <InfoIcon />
        </button>
      )}
    </header>
  );
};

export default Header;

export const hideNativeHeader = () => {
  postMessageToNative("hide-header");
};

export const showNativeHeader = () => {
  postMessageToNative("show-header");
};
