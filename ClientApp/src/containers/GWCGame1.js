import React, { Component } from "react";
import InvalidToken from "../assets/SpinWheelPictures/InvalidToken.png";
import SpinIcon from "../assets/SpinWheelPictures/SpinIcon.png";
import SpinRound from "../assets/spinWhellPicturesVer2/SpinTheWheel.png";
import * as API from "../services/API";
import "./GWCGame1.css";
import ErrorModal from "./errorModal";
import SuccessModal from "./successModal";

export default class GWCGame1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinWheel: {},
      countnameAni: 0,
      rotateStart: 0,
      isShowPrize: false,
      prize: "",
      isErrorModal: false,
      isLoading: false,
      errorMessage: "",
    };
    this.buttonSpin = React.createRef();
    this.handleSpin = this.handleSpin.bind(this);
    this.wrapperGame = React.createRef();
    this.wheel = React.createRef();
    this.description = React.createRef();
    this.chanceContainer = React.createRef();
    this.descriptionTitle = React.createRef();
  }

  updateStyle() {
    const data = this.props.gameInformation;

    this.wrapperGame.current.style.setProperty(
      "background-image",
      `url("${data.backgroundImage}")`,
      "important"
    );

    if (data.description) {
      this.description.current.innerHTML =
        this.props.gameInformation.description;
    }
    if (data.buttonColor) {
      this.buttonSpin.current.style.setProperty(
        "background-color",
        `${data.buttonColor}`,
        "important"
      );
    }
    if (data.buttonTextColor) {
      this.buttonSpin.current.style.setProperty(
        "color",
        `${data.buttonTextColor}`,
        "important"
      );
    }
    if (data.chanceTextColor) {
      this.chanceContainer.current.style.setProperty(
        "color",
        `${data.chanceTextColor}`,
        "important"
      );
    }
    // if (data.chancesColor) {
    //   this.chanceContainer.current.style.setProperty(
    //     "background-color",
    //     `${data.chancesColor}`,
    //     "important"
    //   );
    // }
    if (data.descriptionTextColor) {
      this.description.current.style.setProperty(
        "color",
        `${data.descriptionTextColor}`,
        "important"
      );
      this.descriptionTitle.current.style.setProperty(
        "color",
        `${data.descriptionTextColor}`,
        "important"
      );
    }
  }

  componentDidMount() {
    this.updateStyle();
    this.props.finishGameLoading();
  }

  componentDidUpdate() {
    this.updateStyle();
  }

  handleClick = async () => {
    const gameData = this.props.gameInformation;
    if (gameData.availableChances <= 0) {
      this.setState({
        isErrorModal: true,
        errorMessage:
          "You do not have sufficient chances to play this game".toUpperCase(),
      });
    } else {
      if (this.state.isLoading) {
        return;
      }
      this.setState({
        isLoading: true,
      });
      const query = new URLSearchParams(window.location.search);
      const tokenLocal = query.get("token");
      const playGame = await API.playGame(tokenLocal);
      if (playGame.data.success && playGame.data.result) {
        const resultPrize = playGame.data.result.displayName;
        this.setState({ prize: resultPrize });
        const prizeTypeValue = playGame.data.result.prizeTypeValue;
        const IndexesOfPrizes = [];
        for (let i = 0; i < 8; i++) {
          if (resultPrize === gameData.listPrizesDisplay[i]) {
            IndexesOfPrizes.push(i);
          }
        }
        let random =
          IndexesOfPrizes[Math.floor(Math.random() * IndexesOfPrizes.length)];

        if (
          this.props.gameInformation.iconType.urls &&
          this.props.gameInformation.iconType.urls.length > 0
        ) {
          this.props.gameInformation.iconType.urls.forEach((object, index) => {
            if (" " + object + " ".includes(" " + prizeTypeValue + " ")) {
              random = index;
              return;
            }
          });
        }

        this.handleSpin(random);
      } else {
        this.setState({
          isErrorModal: true,
          errorMessage: playGame.data.error.message,
          isLoading: false,
        });
      }
    }
  };

  handleSpin(random) {
    this.props.gameInformation.availableChances =
      this.props.gameInformation.availableChances - 1;

    this.setState({
      checkSpin: true,
    });
    const styleSheets = document.styleSheets[document.styleSheets.length - 1];
    const rotate = 5 * 360 + (-360 * random) / 8 + 25;
    const nameAni = `spin-wheel-${this.state.countnameAni}`;
    this.setState({ countnameAni: this.state.countnameAni + 1 });
    const keyFrames = `@-webkit-keyframes ${nameAni} {
            from {transform: rotate(${this.state.rotateStart}deg)}
            to {transform: rotate(${rotate}deg)}
        }`;
    styleSheets.insertRule(keyFrames, styleSheets.cssRules.length);
    const styleData = {
      animationName: nameAni,
      animationTimingFunction: "ease-in-out",
      animationDuration: "2.5s",
      transform: `rotate(${rotate}deg)`,
    };
    this.wheel.current.style.animationName = nameAni;
    this.wheel.current.style.animationTimingFunction = "ease-in-out";
    this.wheel.current.style.animationDuration = "2.5s";
    this.wheel.current.style.transform = `rotate(${rotate}deg)`;
    this.setState({ styleSpinWheel: styleData });
    this.setState({ rotateStart: rotate % 360 });
    setTimeout(() => {
      this.setState({
        checkSpin: false,
        isShowPrize: true,
        isLoading: false,
        spinWheel: {},
      });
    }, 3000);
  }

  createTransformStyleForSpin(index, total) {
    let part = 360 / total;
    let halfPart = part / 2;
    let rotateOfIndex = part * (index - 1) + halfPart - 90;
    return {
      transform: `translate(-50%, -50%) rotate(${rotateOfIndex}deg) translateY(-100px)`,
    };
  }

  getSpinAround() {
    return this.props?.gameInformation?.scratchImage &&
      this.props?.gameInformation?.scratchImage.length !== 0
      ? this.props?.gameInformation?.scratchImage
      : null;
  }

  render() {
    return (
      <div ref={this.wrapperGame} className="game-wrapper">
        <div className="game-container">
          <div className="title-box padding-45"></div>
          <div className="mt-40"></div>
          <div className="round-box">
            <div
              ref={this.wheel}
              className="img-round"
              style={this.state.spinWheel}
            >
              <img src={this.getSpinAround() || SpinRound} alt="Spin Round" />
              <div className="list-item-content">
                {this.props.gameInformation.iconType.urls.map((item, index) => (
                  <li
                    key={index}
                    className="list-item"
                    style={this.createTransformStyleForSpin(
                      index,
                      this.props.gameInformation.iconType.urls.length
                    )}
                  >
                    <img
                      alt=""
                      src={window.location.hostname.includes('uat') ? process.env.REACT_APP_MEDIA_URL_NO_SLASH_UAT : process.env.REACT_APP_MEDIA_URL_NO_SLASH + item}
                    />
                  </li>
                ))}

                {!this.props.gameInformation.iconType.urls &&
                  !this.props.gameInformation.iconType.urls.length === 0 &&
                  this.props.gameInformation.listPrizesDisplay.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="list-item top-left-origin"
                        style={this.createTransformStyleForSpin(
                          index,
                          this.props.gameInformation.listPrizesDisplay.length
                        )}
                      >
                        <h4 className="list-item_name">{item}</h4>
                      </li>
                    )
                  )}
              </div>
            </div>
            <div className="spinicon">
              <img src={SpinIcon} alt="" />
            </div>
          </div>

          <div ref={this.chanceContainer} className="turn-spin-box">
            <p className="text-turn">
              You have {this.props.gameInformation.availableChances} Turn(s)
            </p>
          </div>

          <div className="button-spin-box">
            <button
              onClick={this.handleClick}
              className="button-spin button-gradient"
              ref={this.buttonSpin}
            >
              <p className="spin-text">SPIN NOW</p>
            </button>
          </div>
          <div className="description-box">
            <h4 className="text-description" ref={this.descriptionTitle}>
              {this.props.gameInformation.description && "Description"}
            </h4>
            <span ref={this.description} className="content-description"></span>
          </div>

          {this.props.children}

          <SuccessModal
            showModal={this.state.isShowPrize}
            prize={this.state.prize}
            route40={"route40"}
            opaciti01={"opaciti01"}
            onClose={() => this.setState({ isShowPrize: false })}
            onAgain={() => {
              this.setState({ isShowPrize: false });
              this.handleClick();
            }}
          />

          <div className="invalidModal">
            <div className="invalidModal-content">
              <p>Token is invalid or expired, please try again</p>
              <img className="invalid-img" src={InvalidToken} alt="" />
            </div>
          </div>

          <ErrorModal
            showModal={this.state.isErrorModal}
            errorMsg={this.state.errorMessage}
            onClose={() => this.setState({ isErrorModal: false })}
            route40={"route40"}
            opaciti01={"opaciti01"}
          />
        </div>
        {/* <div className="description-box">
            <h4 className="text-description" ref={this.descriptionTitle}>
             {this.props.gameInformation.description && 'Description'}
            </h4>
            <span ref={this.description} className="content-description"></span>
          </div> */}
      </div>
    );
  }
}
