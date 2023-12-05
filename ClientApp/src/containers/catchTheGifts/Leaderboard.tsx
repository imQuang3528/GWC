import {
  Graphics,
  Resource,
  TextMetrics,
  TextStyle,
  Texture,
} from "pixi.js-legacy";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import {
  PContainer,
  PGraphics,
  PText,
  PSprite,
} from "./helper/AutoscaleLayoutable";
import { PAutosizeSprite } from "./helper/AutosizeSprite";
import { GameContext } from "./GameContainer";
import { getLeaderboard } from "../../services/API";
import LoadingSpinner from "./helper/LoadingSpinner";

export interface LeaderboardProps {
  textures: {
    frame: Texture<Resource>;
    user: Texture<Resource>;
    scoreFrame: Texture<Resource>;
  };
}

interface LeaderboardItem {
  MemberName: string;
  CurrentHighestScore: number;
  Rank: number;
  MemberId?: string;
}

function Leaderboard({ textures }: LeaderboardProps) {
  const { screen, safeTop, s, fontFamily } = useContext(GameContext);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>();

  useEffect(() => {
    getLeaderboard()
      .then(res => {
        setLeaderboardData(res.data.Data);
      })
      .catch(e => {
        setLeaderboardData(undefined);
      });
  }, []);

  const drawUserHighLight = useCallback((g: Graphics) => {
    g.clear();
    g.beginFill("#caebc999");
    g.drawRoundedRect(0, 0, 275, 40, 40);
    g.endFill();
  }, []);

  const memberNameStyle = new TextStyle({
    fontFamily,
    fontSize: 16,
    fontWeight: "bold",
    fill: "#ff1f00",
    wordWrap: true,
    wordWrapWidth: 135,
  });

  return (
    <>
      <PAutosizeSprite
        boundary={screen}
        texture={textures.frame}
        top={safeTop + 70}
        flow="centerHorizontal"
        width={380}
      />

      <PContainer
        boundary={screen}
        top={safeTop + 120}
        flow="centerHorizontal"
        width={380}
      >
        {leaderboardData ? (
          leaderboardData.map((item, i) => {
            let name = item.MemberName;
            const nameMetrics = TextMetrics.measureText(name, memberNameStyle);

            if (nameMetrics.lines.length > 2) {
              name =
                nameMetrics.lines[0] +
                " " +
                nameMetrics.lines[1].substring(
                  0,
                  nameMetrics.lines[1].length - 3
                ) +
                "...";
            }

            return (
              <Fragment key={item.Rank}>
                {!!item.MemberId && (
                  <PGraphics
                    boundary={screen}
                    draw={drawUserHighLight}
                    left={52}
                    top={26 + 45 * i}
                    scale={s.scale}
                  />
                )}
                <PText
                  boundary={screen}
                  text={item.Rank.toString()}
                  left={75}
                  top={45 + 45 * i}
                  scale={s(
                    item.Rank < 100
                      ? 1
                      : 1 - Math.trunc(Math.log10(item.Rank)) * 0.14
                  )}
                  anchor={[0.5, 0.5]}
                  style={
                    new TextStyle({
                      fontFamily,
                      fontSize: 22,
                      fontWeight: "bold",
                      fill: "#ff1f00",
                    })
                  }
                />

                <PAutosizeSprite
                  boundary={screen}
                  texture={textures.user}
                  left={94}
                  top={31 + 45 * i}
                  width={25}
                />

                <PText
                  boundary={screen}
                  text={name}
                  left={124}
                  top={(nameMetrics.lines.length <= 1 ? 36 : 27) + 45 * i}
                  scale={s.scale}
                  style={memberNameStyle}
                />

                <PSprite
                  boundary={screen}
                  texture={textures.scoreFrame}
                  left={262}
                  top={32 + 45 * i}
                  width={55}
                  height={30}
                />
                <PText
                  boundary={screen}
                  text={item.CurrentHighestScore.toString()}
                  left={290}
                  top={36 + 45 * i}
                  scale={s.scale}
                  anchor={[0.5, 0]}
                  style={
                    new TextStyle({
                      fontFamily,
                      fontSize: 18,
                      fontWeight: "bold",
                      fill: "#ff1f00",
                    })
                  }
                />
              </Fragment>
            );
          })
        ) : (
          <LoadingSpinner
            boundary={screen}
            top={135}
            left={25} // TODO: anchor should be handled correctly inside PComponents
            flow="centerHorizontal"
            flowMode="dynamic"
          />
        )}
      </PContainer>
    </>
  );
}

export default Leaderboard;
