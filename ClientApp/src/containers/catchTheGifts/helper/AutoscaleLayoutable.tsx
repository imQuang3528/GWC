import { Rectangle } from "pixi.js-legacy";
import {
  ComponentType,
  ForwardRefRenderFunction,
  Ref,
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { GameContext } from "../GameContainer";
import { Container, Graphics, Sprite, Text, _ReactPixi } from "@pixi/react";

export interface WithPositionAndSize {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  anchor?: _ReactPixi.PointLike;

  /**
   * Why do you make the scaling proportions to the real sprite size instead of my WIDTH and HEIGHT???
   * Why, Pixi, why?
   */
  goodScale?: _ReactPixi.PointLike;
  goodScaleAnchor?: _ReactPixi.PointLike;
}

export interface Layout extends WithPositionAndSize {
  boundary: Rectangle;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  flow?: "center" | "centerVertical" | "centerHorizontal";
  flowMode?: "static" | "dynamic";
}

export default function withAutoscaleLayoutable<P extends WithPositionAndSize>(
  WrappedComponent: ComponentType<P>
): ComponentType<P & Layout> {
  const Render: ForwardRefRenderFunction<WithPositionAndSize, P & Layout> = (
    {
      boundary,
      top,
      bottom,
      left,
      right,
      flow,
      flowMode = "static",
      x,
      y,
      width,
      height,
      goodScale,
      goodScaleAnchor,
      ...rest
    },
    forwardedRef
  ) => {
    const ref = useRef<WithPositionAndSize | null>(null);
    const { s } = useContext(GameContext);

    useImperativeHandle(forwardedRef, () => ref.current as WithPositionAndSize);

    const size: WithPositionAndSize = useMemo(() => {
      let realWidth = width ?? ref.current?.width,
        realHeight = height ?? ref.current?.height,
        realX = x,
        realY = y,
        anchor: [number, number] | undefined;

      if (
        realHeight !== undefined &&
        flowMode === "static" &&
        (flow === "center" || flow === "centerVertical")
      ) {
        realY =
          (boundary.bottom -
            (bottom || 0) -
            (boundary.top + (top || 0)) -
            realHeight) /
          2;
      } else {
        if (realHeight !== undefined && bottom !== undefined) {
          realY = boundary.bottom - realHeight - bottom;
        }

        if (top !== undefined) {
          realY = boundary.top + top;
        }
      }

      if (
        realWidth !== undefined &&
        flowMode === "static" &&
        (flow === "center" || flow === "centerHorizontal")
      ) {
        realX =
          (boundary.right -
            (right || 0) -
            (boundary.left + (left || 0)) -
            realWidth) /
          2;
      } else {
        if (realWidth !== undefined && right !== undefined) {
          realX = boundary.right - realWidth - right;
        }

        if (left !== undefined) {
          realX = boundary.left + left;
        }
      }

      if (flowMode === "dynamic") {
        if (flow === "center" || flow === "centerVertical") {
          realY =
            (boundary.bottom - (bottom || 0) - (boundary.top + (top || 0))) / 2;
          anchor = [0, 0.5];
        }

        if (flow === "center" || flow === "centerHorizontal") {
          realX =
            (boundary.right - (right || 0) - (boundary.left + (left || 0))) / 2;

          if (anchor) {
            anchor[0] = 0.5;
          } else {
            anchor = [0.5, 0];
          }
        }
      }

      const res: WithPositionAndSize = {};
      if (realX !== undefined) res.x = realX;
      if (realY !== undefined) res.y = realY;
      if (realWidth !== undefined) res.width = realWidth;
      if (realHeight !== undefined) res.height = realHeight;
      if (anchor) res.anchor = anchor;

      return s.all(res);
    }, [
      width,
      height,
      x,
      y,
      flowMode,
      flow,
      s,
      boundary.bottom,
      boundary.top,
      boundary.right,
      boundary.left,
      bottom,
      top,
      right,
      left,
    ]);

    const scaledSize: WithPositionAndSize = useMemo(() => {
      let scaledX = size.x,
        scaledY = size.y,
        scaledWidth = size.width,
        scaledHeight = size.height;

      if (goodScale !== undefined) {
        const scale = getXY(goodScale);
        if (scaledWidth !== undefined) scaledWidth *= scale.x || 1;
        if (scaledHeight !== undefined) scaledHeight *= scale.y || 1;
      }

      if (goodScaleAnchor !== undefined) {
        const anchor = getXY(goodScaleAnchor);
        if (scaledWidth !== undefined && scaledX !== undefined)
          scaledX -= (scaledWidth - (size.width || 0)) * (anchor.x || 0);
        if (scaledHeight !== undefined && scaledY !== undefined)
          scaledY -= (scaledHeight - (size.height || 0)) * (anchor.y || 0);
      }

      const res: WithPositionAndSize = { ...size };
      if (scaledX !== undefined) res.x = scaledX;
      if (scaledY !== undefined) res.y = scaledY;
      if (scaledWidth !== undefined) res.width = scaledWidth;
      if (scaledHeight !== undefined) res.height = scaledHeight;

      return res;
    }, [goodScale, goodScaleAnchor, size]);

    return (
      <WrappedComponent ref={ref} {...scaledSize} {...(rest as unknown as P)} />
    );
  };

  return forwardRef(Render) as unknown as ComponentType<P & Layout>;
}

// A function that takes a PointLike value and returns its x and y
function getXY(value: _ReactPixi.PointLike): { x?: number; y?: number } {
  let x;
  let y;

  if (typeof value === "number") {
    x = value;
    y = value;
  } else if (Array.isArray(value)) {
    x = value[0];
    y = value[1] || value[0];
  } else if (typeof value === "object") {
    x = value.x;
    y = value.y;
  }

  return { x, y };
}

// P stands for Pro
export const PContainer = withAutoscaleLayoutable(Container);
export const PSprite = withAutoscaleLayoutable(Sprite);
export const PGraphics = withAutoscaleLayoutable(Graphics);
export const PText = withAutoscaleLayoutable(Text);
