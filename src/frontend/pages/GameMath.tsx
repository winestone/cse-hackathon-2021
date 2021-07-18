import _ from "lodash";
import * as either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import immutable from "immutable";
import React, { useEffect, useState } from "react";

import * as game from "@common/game";
import * as gameMsg from "@common/game-msg";
import { Username } from "@common/common";
import { IVec2 } from "@common/ivec2";

function gameMathQuestionComputeSimpleTreeToString(q: game.MathQuestionComputeSimpleTree): string {
  if (typeof q === "number") return q.toString();
  return `${gameMathQuestionComputeSimpleTreeToString(q.childs[0])} ${
    {
      [game.MathOp.Add]: "+",
      [game.MathOp.Sub]: "-",
      [game.MathOp.Mul]: "*",
      [game.MathOp.Div]: "/",
    }[q.op]
  } ${gameMathQuestionComputeSimpleTreeToString(q.childs[1])}`;
}
export function gameMathQuestionComputeSimpleToString(
  question: game.MathQuestionComputeSimple,
  answer?: number
): string {
  return `${gameMathQuestionComputeSimpleTreeToString(question.tree)} = ${
    answer === undefined ? "?" : answer.toString()
  }`;
}

export interface GameMathCellProps {
  cell: game.MathCell;
}
export function GameMathCell({ cell }: GameMathCellProps): React.ReactElement {
  return (
    <div style={{ opacity: cell.answer === undefined ? 1 : 0.5 }}>
      {(() => {
        switch (cell.type) {
          case game.MathQuestionType.ComputeSimple:
            return gameMathQuestionComputeSimpleToString(cell.question, cell.answer);
          default:
            return "unhandled";
        }
      })()}
    </div>
  );
}

export interface GameMathPlayerGridProps {
  grid: game.Grid2<game.MathCell | undefined>;
  nextDropByCol: number[];
  currDropByCol: number[];
  isMe: boolean;
}
export function GameMathPlayerGrid({
  grid,
  nextDropByCol,
  currDropByCol,
  isMe,
}: GameMathPlayerGridProps): React.ReactElement {
  return (
    <>
      <table>
        <tbody>
          <tr>
            {_.range(grid.size[0]).map((col) => (
              <td key={col}>
                <strong>{"V".repeat(currDropByCol[col])}</strong>
                {"v".repeat(nextDropByCol[col])}
              </td>
            ))}
          </tr>
          {_.rangeRight(grid.size[1]).map((y) => (
            <tr key={y}>
              {_.range(grid.size[0]).map((x) => {
                const cell = grid.get(IVec2.fromValues(x, y));
                return (
                  <td key={x} style={{ border: "1px solid black" }}>
                    {cell === undefined ? <>&nbsp;</> : <GameMathCell cell={cell} />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export interface GameMathPlayerProps {
  player: game.MathPlayer;
  isMe: boolean;
}
export function GameMathPlayer({ player, isMe }: GameMathPlayerProps): React.ReactElement {
  return (
    <div>
      <p>
        {/* {player.username} */}
        {player.hasLost ? " lost" : ""}
      </p>
      <GameMathPlayerGrid
        grid={player.grid}
        nextDropByCol={player.nextDropByCol}
        currDropByCol={player.currDropByCol}
        isMe={isMe}
      />
    </div>
  );
}

export interface GameMathProps {
  username: string;
  state: game.MathState;
  onGuess?: (guess: string) => void;
}
export function GameMath({ username, state, onGuess }: GameMathProps): React.ReactElement {
  const [guess, setGuess] = useState<string>("");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onGuess?.(guess);
    setGuess("");
  };

  return (
    <>
      <p>Game Math</p>
      <p>Drop in {state.ticksTillNextDrop}s</p>
      <div style={{ display: "flex" }}>
        {state.players
          .map((player) => (
            <GameMathPlayer
              key={player.username}
              player={player}
              isMe={player.username === username}
            />
          ))
          .toArray()}
      </div>
      <br />
      <br />
      <form onSubmit={handleSubmit}>
        <input type="text" onChange={(e) => setGuess(e.target.value)} autoFocus value={guess} />
        <input type="submit" />
      </form>
    </>
  );
}
