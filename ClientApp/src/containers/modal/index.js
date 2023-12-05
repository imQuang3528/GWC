import { useCallback, useEffect, useRef, useState } from "react";
import "overlayscrollbars/overlayscrollbars.css";
import "./styles.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { OverlayScrollbars, SizeObserverPlugin } from "overlayscrollbars";
import {
  addNativeEventListener,
  removeNativeEventListener,
} from "../../utils/nativeCommunicator";
import { URL_MEDIA } from "../../App";

OverlayScrollbars.plugin(SizeObserverPlugin);

const Modal = props => {
  const content = useRef();
  const modal = useRef();
  const modalUnderlay = useRef();
  const modalContent = useRef();

  const openPopUp = useCallback(() => {
    modal.current.classList.add("show");
  }, []);

  const closePopUp = useCallback(() => {
    modal.current.classList.remove("show");
    props.onClose?.();
  }, [props]);

  useEffect(() => {
    const onWindowClick = e => {
      if (e.target === modalUnderlay.current) {
        closePopUp();
      }
    };
    window.addEventListener("click", onWindowClick);

    const onUnderlayFade = e => {
      if (e.type === "animationstart" && e.animationName === "fade-in") {
        e.target.classList.add("did-fade-in");
      } else if (e.type === "animationend" && e.animationName === "fade-out") {
        e.target.classList.remove("did-fade-in");
      }
    };
    const underlay = modalUnderlay.current;
    underlay.addEventListener("animationstart", onUnderlayFade);
    underlay.addEventListener("animationend", onUnderlayFade);

    const onModalSlide = e => {
      if (e.type === "animationstart" && e.animationName === "slide-up") {
        e.target.classList.add("did-slide-up");
      } else if (
        e.type === "animationend" &&
        e.animationName === "slide-down"
      ) {
        e.target.classList.remove("did-slide-up");
      }
    };
    const content = modalContent.current;
    content.addEventListener("animationstart", onModalSlide);
    content.addEventListener("animationend", onModalSlide);

    return () => {
      window.removeEventListener("click", onWindowClick);
      underlay.removeEventListener("animationstart", onUnderlayFade);
      underlay.removeEventListener("animationend", onUnderlayFade);
      content.removeEventListener("animationstart", onModalSlide);
      content.removeEventListener("animationend", onModalSlide);
    };
  }, [closePopUp]);

  const [scrollbarKey, setScrollbarKey] = useState(0);
  useEffect(() => {
    props.showPopup ? openPopUp() : closePopUp();

    if (props.showPopup) {
      // Somehow the scroll bar has the wrong height on the initial open, so we force it to reload
      requestAnimationFrame(() => {
        setScrollbarKey(pre => pre || 1);
      });
    }
  }, [closePopUp, openPopUp, props.showPopup]);

  useEffect(() => {
    const onBackPress = () => {
      const isShown = modal.current.classList.contains("show");
      closePopUp();

      return isShown;
    };
    addNativeEventListener("hardwareBackPress", onBackPress);

    return () => removeNativeEventListener("hardwareBackPress", onBackPress);
  }, [closePopUp]);

  return (
    <div className="wrapper-term">
      {!props.onlyPopup && (
        <div className="bottom-box-term">
          <button
            className="button-footer button-gradient termBtn"
            onClick={openPopUp}
          >
            {props.title}
          </button>
        </div>
      )}
      <div ref={modal} className="modal">
        <div ref={modalUnderlay} className="modal-underlay" />
        <div ref={modalContent} className="modal-content">
          <div className="modal-box">
            <div className="modal-header">
              <h2>{props.title}</h2>
            </div>

            {/* 
              Android webview cannot show scrollbar, so this lib is necessary
              See: https://bugs.chromium.org/p/chromium/issues/detail?id=1327047
             */}
            <OverlayScrollbarsComponent
              key={scrollbarKey + ""}
              className="modal-body"
              options={{
                scrollbars: {
                  autoHide: "scroll",
                  autoHideDelay: 500,
                  autoHideSuspend: true,
                },
              }}
              defer
            >
              <span
                ref={content}
                className="term-content"
                dangerouslySetInnerHTML={{ __html: fixImageUrl(props.content) }}
              />
            </OverlayScrollbarsComponent>
            <div className="modal-footer">
              <button className="close" onClick={closePopUp}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const fixImageUrl = content =>
  content.replaceAll(
    /src="\.\.\/\.\.\/\.\.\/\.\.(\/.+)"/g,
    (_, matched) => `src="${URL_MEDIA + "/mallsmobile" + matched}"`
  );

export default Modal;
