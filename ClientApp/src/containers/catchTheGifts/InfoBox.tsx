import { BitmapText, Text, _ReactPixi, useTick } from "@pixi/react";
import {
  TextStyle,
  Text as TextRef,
  BitmapText as BitmapTextRef,
  Sprite as SpriteRef,
  Resource,
  Texture,
  ITextStyle,
  IBitmapTextStyle,
} from "pixi.js-legacy";
import { useContext, useRef, useState } from "react";
import { GameContext } from "./GameContainer";
import AutosizeSprite from "./helper/AutosizeSprite";
import { Layout, PContainer } from "./helper/AutoscaleLayoutable";

export interface InfoBoxProps extends _ReactPixi.IContainer, Layout {
  bgTexture?: Texture<Resource>;
  label?: string;
  content: string | number;
  labelStyle?: Partial<ITextStyle>;
  contentStyle?: Partial<IBitmapTextStyle>;
  contentPadding?: {
    left?: number;
    top?: number;
  };
}

function InfoBox({
  bgTexture,
  label,
  content,
  labelStyle,
  contentStyle,
  contentPadding,
  ...rest
}: InfoBoxProps) {
  const { s, bitmapFontFamily } = useContext(GameContext);
  const [labelWidth, setLabelWidth] = useState(0);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
  const labelRef = useRef<TextRef>(null);
  const contentRef = useRef<BitmapTextRef>(null);
  const bgRef = useRef<SpriteRef>(null);

  useTick(() => {
    setLabelWidth(labelRef.current?.width || 0);
    setContentSize({
      width: contentRef.current?.width || 0,
      height: contentRef.current?.height || 0,
    });
    setBgSize({
      width: bgRef.current?.width || 0,
      height: bgRef.current?.height || 0,
    });
  });

  const contentLeftPadding = labelWidth + (contentPadding?.left || 10);
  const contentTopPadding = contentPadding?.top || 0;

  return (
    <PContainer {...rest}>
      {!!bgTexture && (
        <AutosizeSprite ref={bgRef} texture={bgTexture} height={rest.height} />
      )}
      {!!label && (
        <Text
          ref={labelRef}
          isSprite
          text={label}
          scale={s(1)}
          y={((bgSize.height || 0) - contentSize.height) / 2}
          style={
            new TextStyle({
              fontSize: 20,
              fontWeight: "bold",
              ...labelStyle,
            })
          }
        />
      )}
      <BitmapText
        ref={contentRef}
        text={content.toString()}
        x={contentLeftPadding + ((bgSize.width || 0) - contentLeftPadding) / 2}
        y={contentTopPadding + ((bgSize.height || 0) - contentTopPadding) / 2}
        anchor={0.5}
        style={{
          fontSize: 25,
          fontName: bitmapFontFamily,
          ...contentStyle,
        }}
      />
    </PContainer>
  );
}

export default InfoBox;
