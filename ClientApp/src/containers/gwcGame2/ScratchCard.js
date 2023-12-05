import React, {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import "./ScratchCard.css";

const ScratchCard = forwardRef((props, ref) => {
  const image = useRef(new Image());
  const isDrawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const isFinish = useRef(false);
  const ctx = useRef();
  const canvas = useRef();

  const reset = useCallback(() => {
    isDrawing.current = false;
    isFinish.current = false;
    lastPoint.current = { x: 0, y: 0 };

    if (ctx.current) {
      ctx.current.globalCompositeOperation = "source-over";
      ctx.current.drawImage(image.current, 0, 0, props.width, props.height);
    }

    canvas.current?.classList.remove("hidden");
  }, [props.width, props.height]);

  useImperativeHandle(
    ref,
    () => ({
      reset,
    }),
    [reset]
  );

  useEffect(() => {
    isDrawing.current = false;
    const canvasContext = canvas.current.getContext("2d", {
      willReadFrequently: true,
    });
    ctx.current = canvasContext;
    image.current.onload = () => {
      canvasContext?.drawImage(image.current, 0, 0, props.width, props.height);
      props.onImageLoaded?.();
    };

    image.current.crossOrigin = "anonymous";
    image.current.src = props.image;
  }, [props.width, props.height, props.image]);

  const handleEnableScroll = () => {
    // document.querySelector("body").style.overflow = "scroll";
  };

  const handleDisableScroll = () => {
    // document.querySelector("body").style.overflow = "hidden";
  };

  const prevedefent = useCallback(event => {
    if (event.cancelable) event.preventDefault();
  }, []);

  const getFilledInPixels = stride => {
    if (!stride || stride < 1) {
      stride = 1;
    }
    var total = 0;
    let count = 0;

    if (ctx.current) {
      const pixels = ctx.current.getImageData(
        0,
        0,
        canvas.current.width,
        canvas.current.height
      );
      total = pixels?.data?.length / stride;

      for (let i = 0; i < pixels?.data.length; i += stride) {
        if (parseInt(pixels.data[i] + "", 10) === 0) {
          count++;
        }
      }
    }

    return Math.round((count / total) * 100);
  };

  const getMouse = (e, canvas) => {
    const { top, left } = canvas.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    return {
      x: (e.pageX || e.touches[0].clientX) - left - scrollLeft,
      y: (e.pageY || e.touches[0].clientY) - top - scrollTop,
    };
  };

  const distanceBetween = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  };

  const angleBetween = (point1, point2) => {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  };

  const handlePercentage = async (filledInPixels = 0) => {
    props.onProgress && props.onProgress(filledInPixels);

    if (!isFinish.current && filledInPixels >= props.finishPercent) {
      isFinish.current = true;
      await props.onComplete?.();
      canvas.current?.classList.add("hidden");
      if (props.onComplete) {
        window.removeEventListener("touchmove", prevedefent, {
          passive: false,
        });
        window.removeEventListener("touchstart", prevedefent, {
          passive: false,
        });
        handleEnableScroll();
      }
    }
  };

  const handleMouseDown = e => {
    isDrawing.current = true;
    window.addEventListener("touchstart", prevedefent, {
      passive: false,
    });
    window.addEventListener("touchmove", prevedefent, {
      passive: false,
    });
    handleDisableScroll();
    lastPoint.current = getMouse(e, canvas.current);
  };

  const handleMouseMove = e => {
    if (!isDrawing.current) {
      return;
    }

    const currentPoint = getMouse(e, canvas.current);
    const distance = distanceBetween(lastPoint.current, currentPoint);
    const angle = angleBetween(lastPoint.current, currentPoint);

    let x, y;

    if (ctx.current) {
      for (let i = 0; i < distance; i++) {
        x = lastPoint.current?.x + Math.sin(angle) * i;
        y = lastPoint.current?.y + Math.cos(angle) * i;
        ctx.current.globalCompositeOperation = "destination-out";
        ctx.current.beginPath();
        ctx.current.arc(x, y, 20, 0, 2 * Math.PI, false);
        ctx.current.fill();
      }
    }

    lastPoint.current = currentPoint;
    handlePercentage(getFilledInPixels(1));
  };

  const handleMouseUp = () => {
    window.removeEventListener("touchmove", prevedefent, {
      passive: false,
    });
    window.removeEventListener("touchstart", prevedefent, {
      passive: false,
    });
    handleEnableScroll();
    isDrawing.current = false;
  };

  const canvasProps = {
    height: props.height,
    width: props.width,
    onMouseDown: handleMouseDown,
    onTouchStart: handleMouseDown,
    onMouseMove: handleMouseMove,
    onTouchMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onTouchEnd: handleMouseUp,
  };
  return (
    <div
      className="ScratchCard__Container"
      style={{
        height: props.height,
      }}
    >
      <canvas
        className="ScratchCard__Canvas"
        ref={canvas}
        {...canvasProps}
      ></canvas>
      <div
        className="ScratchCard__Result"
        style={{
          visibility: "visible",
          width: props.width,
          height: props.height,
        }}
      >
        {props.children}
      </div>
    </div>
  );
});

export default ScratchCard;
