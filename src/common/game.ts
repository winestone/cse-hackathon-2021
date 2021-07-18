import * as either from "fp-ts/lib/Either";
import type { Either } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as option from "fp-ts/lib/Option";
import type { Option } from "fp-ts/lib/Option";
import immutable from "immutable";
import { SortedSet } from "immutable-sorted";
import _ from "lodash";

import { GameLobbyId, PrngState, Username } from "@common/common";
import { ConstIVec2, IVec2 } from "@common/ivec2";
import * as utils from "@common/utils";

export { PrngState } from "./common";
export function prngNext32(prng: PrngState): {
  prng: PrngState;
  value: number;
} {
  // https://stackoverflow.com/a/47593316 Mulberry32
  let v: number = prng;
  v = Math.imul(v ^ (v >>> 15), v | 1);
  v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
  v = (v ^ (v >>> 14)) >>> 0; // 4294967296;
  return { prng: (prng + 0x6d2b79f5) as PrngState, value: v };
}
// uniformly random int between `[lo, hi)`
export function prngNextIntBetween(
  prng: PrngState,
  lo: number,
  hi: number
): {
  prng: PrngState;
  value: number;
} {
  const result = prngNext32(prng);
  return {
    prng: result.prng,
    value: lo + (result.value % (hi - lo)),
  };
}
// choose `k` indexes from `[0, n)`
export function prngNextSampleIndexes(
  prng: PrngState,
  n: number,
  k: number
): { prng: PrngState; indexes: number[] } {
  console.assert(k <= n);
  // TODO optimisation: if n/2 <= k, choose indexes to remove instead
  const { prng: prng1, indexes } = Array.from(Array(k)).reduce<{
    prng: PrngState;
    indexes: SortedSet<number>;
  }>(
    ({ prng: prng0, indexes }, _, idx) => {
      const { prng: prng1, value: choice } = prngNextIntBetween(prng0, 0, n - idx);
      // TODO: `indexes.from(choice, true).size` is `undefined`, what's a faster way to do this than `.count()`?
      const index = indexes.from(choice, true).count() + choice;
      return { prng: prng1, indexes: indexes.add(index) };
    },
    {
      prng,
      indexes: SortedSet<number>(),
    }
  );
  return { prng: prng1, indexes: indexes.toArray() };
}

export class PrngMut {
  state: PrngState;
  constructor(prng: PrngState) {
    this.state = prng;
  }
  static mk(prng: PrngState): PrngMut {
    return new PrngMut(prng);
  }
  clone(): PrngMut {
    return new PrngMut(this.state);
  }

  next32(): number {
    const result = prngNext32(this.state);
    this.state = result.prng;
    return result.value;
  }
  nextIntBetween(lo: number, hi: number): number {
    const result = prngNextIntBetween(this.state, lo, hi);
    this.state = result.prng;
    return result.value;
  }
  nextSampleIndexes(n: number, k: number): number[] {
    const result = prngNextSampleIndexes(this.state, n, k);
    this.state = result.prng;
    return result.indexes;
  }
}

export interface Lobby {
  id: GameLobbyId;
  // whether a player is ready or not
  players: immutable.Map<Username, boolean>;
}

export interface LobbiesState {
  lobbies: immutable.Map<GameLobbyId, Lobby>;
  nextLobbyId: GameLobbyId;
}

export function lobbiesEmpty(): LobbiesState {
  return {
    lobbies: immutable.Map<GameLobbyId, Lobby>(),
    nextLobbyId: 1 as GameLobbyId,
  };
}

export function lobbiesIsInLobby(state: LobbiesState, username: Username): boolean {
  return state.lobbies.some((lobby) => lobby.players.has(username));
}

export function lobbiesGetUserLobby(state: LobbiesState, username: Username): Lobby | undefined {
  return state.lobbies.find((lobby) => lobby.players.has(username));
}

export enum LobbiesCreateError {
  UserAlreadyInALobby,
}
export interface LobbiesCreateOk {
  state: LobbiesState;
  createdLobby: GameLobbyId;
}
export type LobbiesCreateResult = Either<LobbiesCreateError, LobbiesCreateOk>;
export function lobbiesCreate(state: LobbiesState, username: Username): LobbiesCreateResult {
  if (lobbiesIsInLobby(state, username)) {
    return either.left(LobbiesCreateError.UserAlreadyInALobby);
  }
  return either.right({
    state: {
      lobbies: state.lobbies.set(state.nextLobbyId, {
        id: state.nextLobbyId,
        players: immutable.Map<Username, boolean>([[username, false]]),
      }),
      nextLobbyId: (state.nextLobbyId + 1) as GameLobbyId,
    },
    createdLobby: state.nextLobbyId,
  });
}

export enum LobbiesJoinError {
  InvalidLobby,
}
export type LobbiesJoinOk = LobbiesState;
export type LobbiesJoinResult = Either<LobbiesJoinError, LobbiesJoinOk>;
export function lobbiesJoin(
  state: LobbiesState,
  username: Username,
  lobbyId: GameLobbyId
): LobbiesJoinResult {
  const userLobby = lobbiesGetUserLobby(state, username);
  const lobby = state.lobbies.get(lobbyId);
  if (lobby === undefined) return either.left(LobbiesJoinError.InvalidLobby);
  return either.right({
    ...state,
    lobbies: pipe(
      state.lobbies.set(lobbyId, {
        ...lobby,
        players: lobby.players.set(username, false),
      }),
      (lobbies) =>
        userLobby === undefined
          ? lobbies
          : lobbies.set(userLobby.id, {
              ...userLobby,
              players: userLobby.players.delete(username),
            })
    ),
  });
}

export enum LobbiesLeaveError {
  UserNotInALobby,
}
export type LobbiesLeaveOk = LobbiesState;
export type LobbiesLeaveResult = Either<LobbiesLeaveError, LobbiesLeaveOk>;
export function lobbiesLeave(state: LobbiesState, username: Username): LobbiesLeaveResult {
  const lobby = state.lobbies.find((l) => l.players.has(username));
  if (lobby === undefined) return either.left(LobbiesLeaveError.UserNotInALobby);
  return either.right({
    ...state,
    lobbies:
      lobby.players.size === 1
        ? state.lobbies.delete(lobby.id)
        : state.lobbies.set(lobby.id, {
            ...lobby,
            players: lobby.players.delete(username),
          }),
  });
}

export enum LobbiesSetReadyError {
  UserNotInALobby,
}
export interface LobbiesSetReadyOk {
  state: LobbiesState;
  lobbyReady?: Lobby;
}
export type LobbiesSetReadyResult = Either<LobbiesSetReadyError, LobbiesSetReadyOk>;
export function lobbiesSetReady(
  state: LobbiesState,
  username: Username,
  ready: boolean
): LobbiesSetReadyResult {
  const lobby = lobbiesGetUserLobby(state, username);
  if (lobby === undefined) return either.left(LobbiesSetReadyError.UserNotInALobby);
  const everyoneReady =
    ready && lobby.players.every((rdy, playerUsername) => rdy || playerUsername === username);
  return either.right({
    state: {
      ...state,
      lobbies: everyoneReady
        ? state.lobbies.delete(lobby.id)
        : state.lobbies.set(lobby.id, {
            ...lobby,
            players: lobby.players.set(username, ready),
          }),
    },
    lobbyReady: everyoneReady ? lobby : undefined,
  });
}

export enum LobbiesUserActionType {
  Create,
  Join,
  Leave,
  SetReady,
}
export interface LobbiesUserActionCreate {
  type: LobbiesUserActionType.Create;
}
export interface LobbiesUserActionJoin {
  type: LobbiesUserActionType.Join;
  lobbyId: GameLobbyId;
}
export interface LobbiesUserActionLeave {
  type: LobbiesUserActionType.Leave;
}
export interface LobbiesUserActionSetReady {
  type: LobbiesUserActionType.SetReady;
  ready: boolean;
}

export type LobbiesUserAction =
  | LobbiesUserActionCreate
  | LobbiesUserActionJoin
  | LobbiesUserActionLeave
  | LobbiesUserActionSetReady;

export enum LobbiesActionType {
  User,
}
export interface LobbiesAction {
  type: LobbiesActionType.User;
  username: Username;
  action: LobbiesUserAction;
}

export interface LobbiesUserActionResultCreate {
  type: LobbiesUserActionType.Create;
  result: LobbiesCreateResult;
}
export interface LobbiesUserActionResultJoin {
  type: LobbiesUserActionType.Join;
  result: LobbiesJoinResult;
}
export interface LobbiesUserActionResultLeave {
  type: LobbiesUserActionType.Leave;
  result: LobbiesLeaveResult;
}
export interface LobbiesUserActionResultSetReady {
  type: LobbiesUserActionType.SetReady;
  result: LobbiesSetReadyResult;
}
export type LobbiesUserActionResult =
  | LobbiesUserActionResultCreate
  | LobbiesUserActionResultJoin
  | LobbiesUserActionResultLeave
  | LobbiesUserActionResultSetReady;

export interface LobbiesActionResultUser {
  type: LobbiesActionType.User;
  result: LobbiesUserActionResult;
}
export type LobbiesActionResult = LobbiesActionResultUser;

export function lobbiesActionResultGetState(result: LobbiesActionResult): LobbiesState | undefined {
  switch (result.type) {
    case LobbiesActionType.User:
      switch (result.result.type) {
        case LobbiesUserActionType.Create:
          return pipe(
            result.result.result,
            either.getOrElseW(() => undefined)
          )?.state;
        case LobbiesUserActionType.Join:
          return pipe(
            result.result.result,
            either.getOrElseW(() => undefined)
          );
        case LobbiesUserActionType.Leave:
          return pipe(
            result.result.result,
            either.getOrElseW(() => undefined)
          );
        case LobbiesUserActionType.SetReady:
          return pipe(
            result.result.result,
            either.getOrElseW(() => undefined)
          )?.state;
      }
  }
}

export function lobbiesApplyUserAction(
  state: LobbiesState,
  username: Username,
  action: LobbiesUserAction
): LobbiesUserActionResult {
  switch (action.type) {
    case LobbiesUserActionType.Create:
      return { type: action.type, result: lobbiesCreate(state, username) };
    case LobbiesUserActionType.Join:
      return { type: action.type, result: lobbiesJoin(state, username, action.lobbyId) };
    case LobbiesUserActionType.Leave:
      return { type: action.type, result: lobbiesLeave(state, username) };
    case LobbiesUserActionType.SetReady:
      return { type: action.type, result: lobbiesSetReady(state, username, action.ready) };
  }
}
export function lobbiesApplyAction(
  state: LobbiesState,
  action: LobbiesAction
): LobbiesActionResult {
  switch (action.type) {
    case LobbiesActionType.User:
      return {
        type: LobbiesActionType.User,
        result: lobbiesApplyUserAction(state, action.username, action.action),
      };
  }
}

export class Grid2<Cell> {
  size: ConstIVec2;
  grid: Cell[];

  constructor(size: ConstIVec2, grid: Cell[]) {
    console.assert(size[0] * size[1] === grid.length);
    this.size = size;
    this.grid = grid;
  }

  clone(): Grid2<Cell> {
    return new Grid2(this.size, this.grid.slice());
  }

  posToIdx(v: ConstIVec2): number {
    return v[0] + v[1] * this.size[0];
  }
  idxToPos(i: number): IVec2 {
    return IVec2.fromValues(i / this.size[0], i % this.size[0]);
  }

  inBounds(at: ConstIVec2): boolean {
    return 0 <= at[0] && at[0] < this.size[0] && 0 <= at[1] && at[1] < this.size[1];
  }

  get(at: ConstIVec2): Cell {
    return this.grid[this.posToIdx(at)];
  }
  set(at: ConstIVec2, value: Cell): void {
    this.grid[this.posToIdx(at)] = value;
  }

  map<C>(f: (cell: Cell, at: ConstIVec2) => C): Grid2<C> {
    return new Grid2(
      this.size,
      this.grid.map((cell, idx) => f(cell, this.idxToPos(idx)))
    );
  }

  static fromGen<C>(size: ConstIVec2, gen: (at: ConstIVec2) => C): Grid2<C> {
    return new Grid2(size, _.range(size[0] * size[1])).map((_, at) => gen(at));
  }
  static fromValue<C>(size: ConstIVec2, value: C): Grid2<C> {
    return this.fromGen(size, () => value);
  }
}

// difficulty levels
// increasing difficulty levels = larger numbers and more numbers
// ability for users to affect each other
// - send squid ink
// - add an extra operation

// |   |   |              |
// |   v   |              |
// |       |              |
// | 3*2=? |              |
// | 5+6=? | 1_3_4_6 = 24 | integrate from 0 to 2 of x^2 = ? |

// 5 * 12 + 6 = ?
// given 4 numbers, insert operations to make 24, maybe in as many ways as possible
//

// name difficulties according to their appropriate school grade, maybe less condescending than "easy"
export enum MathDifficulty {
  Grade10,
}

export enum MathOp {
  Add,
  Sub,
  Mul,
  Div,
}

export enum MathQuestionType {
  // 2 + 5 = ?
  ComputeSimple,
  // make 24 by inserting symbols 1 ? 7 ? 8 ? 2 (enter "++*")
  FindOperations,
  // integrate from 0 to 2 of x^2
  // ComputeIntegration,
  // gcd(10, 15) = ?
  ComputeGcd,
  // lcm(10, 15) = ?
  ComputeLcm,
  // largestPrimeFactor(10, 15) = ?
  ComputeLargestPrimeFactor,
}
export interface MathQuestionComputeSimpleTreeMulDiv {
  op: MathOp.Mul | MathOp.Div;
  childs: [
    MathQuestionComputeSimpleTreeMulDiv | number,
    MathQuestionComputeSimpleTreeMulDiv | number
  ];
}
export interface MathQuestionComputeSimpleTreeAddSub {
  op: MathOp.Add | MathOp.Sub;
  childs: [
    MathQuestionComputeSimpleTreeAddSub | MathQuestionComputeSimpleTreeMulDiv | number,
    MathQuestionComputeSimpleTreeAddSub | MathQuestionComputeSimpleTreeMulDiv | number
  ];
}
export type MathQuestionComputeSimpleTree =
  | MathQuestionComputeSimpleTreeAddSub
  | MathQuestionComputeSimpleTreeMulDiv
  | number;
export interface MathQuestionComputeSimple {
  tree: MathQuestionComputeSimpleTree;
}
export interface MathQuestionFindOperations {
  nums: number[];
  target: number;
}
export interface MathQuestionComputeGcd {
  nums: number[];
}
export interface MathQuestionComputeLcm {
  nums: number[];
}
export interface MathQuestionComputeLargestPrimeFactor {
  nums: number[];
}

export interface MathCellOf<T, Q, A> {
  type: T;
  question: Q;
  answer?: A;
}
export type MathCell =
  | MathCellOf<MathQuestionType.ComputeSimple, MathQuestionComputeSimple, number>
  | MathCellOf<MathQuestionType.FindOperations, MathQuestionFindOperations, string>
  | MathCellOf<MathQuestionType.ComputeGcd, MathQuestionComputeGcd, number>
  | MathCellOf<MathQuestionType.ComputeLcm, MathQuestionComputeLcm, number>
  | MathCellOf<
      MathQuestionType.ComputeLargestPrimeFactor,
      MathQuestionComputeLargestPrimeFactor,
      number
    >;

export interface MathPlayer {
  username: Username;
  grid: Grid2<MathCell | undefined>;
  hasLost: boolean;
  nextDropByCol: number[];
  currDropByCol: number[];
}

export interface MathState {
  players: immutable.Map<Username, MathPlayer>;
  prng: PrngState;
  difficulty: MathDifficulty;
  columns: MathQuestionType[];
  // 0 means gonna drop next tick
  ticksTillNextDrop: number;
}

export function mathCellRandomMut(prng: PrngMut): MathCell {
  return {
    type: MathQuestionType.ComputeSimple,
    question: {
      tree: {
        op: MathOp.Add,
        childs: [prng.nextIntBetween(0, 100), prng.nextIntBetween(0, 100)],
      },
    },
  };
}

function mathQuestionComputeSimpleTreeAnswer(q: MathQuestionComputeSimpleTree): number {
  if (typeof q === "number") return q;
  const [qa, qb] = q.childs;
  const a = mathQuestionComputeSimpleTreeAnswer(qa);
  const b = mathQuestionComputeSimpleTreeAnswer(qb);
  switch (q.op) {
    case MathOp.Add:
      return a + b;
    case MathOp.Sub:
      return a - b;
    case MathOp.Mul:
      return a * b;
    case MathOp.Div:
      return a / b;
  }
}
export function mathQuestionComputeSimpleAnswer(q: MathQuestionComputeSimple): number {
  return mathQuestionComputeSimpleTreeAnswer(q.tree);
}

export function mathCellCheckGuess(cell: MathCell, guess: string): MathCell | undefined {
  const guessFloat = option.toUndefined(option.tryCatchK(() => parseFloat(guess))());
  switch (cell.type) {
    case MathQuestionType.ComputeSimple: {
      const answer = mathQuestionComputeSimpleAnswer(cell.question);
      return guessFloat !== undefined && Math.abs(guessFloat - answer) < 0.8
        ? { ...cell, answer }
        : undefined;
    }
    default:
      return undefined;
  }
}

export interface MathStateNewArgs {
  prng: PrngState;
  difficulty: MathDifficulty;
  usernames: Username[];
  height: number;
  columns: MathQuestionType[];
}
export function mathStateNew(args: MathStateNewArgs): MathState {
  const prng = PrngMut.mk(args.prng);
  const players = immutable.Map<Username, MathPlayer>(
    args.usernames.map((playerUsername): [Username, MathPlayer] => {
      const nextDropCols = prng.nextSampleIndexes(args.columns.length, 3);
      return [
        playerUsername,
        {
          username: playerUsername,
          grid: Grid2.fromValue(IVec2.fromValues(args.columns.length, args.height), undefined),
          hasLost: false,
          nextDropByCol: nextDropCols.reduce((acc, dropCol) => {
            acc[dropCol]++;
            return acc;
          }, _.range(args.columns.length).fill(0)),
          currDropByCol: _.range(args.columns.length).fill(0),
        },
      ];
    })
  );
  return {
    prng: prng.state,
    players,
    difficulty: args.difficulty,
    columns: args.columns,
    ticksTillNextDrop: 0,
  };
}

export function mathStateIsFinished(state: MathState): boolean {
  const anyPlayer = state.players.first();
  return (
    anyPlayer === undefined ||
    (state.players.size === 1 && anyPlayer.hasLost) ||
    (1 < state.players.size &&
      state.players.size - state.players.filter((player) => player.hasLost).count() <= 1)
  );
}

// 1 tick a second?
export function mathStateTick(state: MathState): MathState {
  if (mathStateIsFinished(state)) return state;

  const prng = PrngMut.mk(state.prng);
  const shouldDropNext = state.ticksTillNextDrop <= 0;

  const players = state.players.map((player) => {
    if (player.hasLost) return player;

    const grid = player.grid.clone();
    _.range(grid.size[1] - 1).forEach((y) => {
      _.range(grid.size[0]).forEach((x) => {
        const at = IVec2.fromValues(x, y);
        if (grid.get(at) === undefined) {
          const atAbove = IVec2.fromValues(x, y + 1);
          grid.set(at, grid.get(atAbove));
          grid.set(atAbove, undefined);
        }
      });
    });

    const currDrops = shouldDropNext
      ? player.currDropByCol.map((curr, x) => curr + player.nextDropByCol[x])
      : player.currDropByCol;

    const currDropAts = Array.from(currDrops.entries())
      .filter(([, curr]) => 0 < curr)
      .map(([x]) => IVec2.fromValues(x, grid.size[1] - 1));

    const hasLost = currDropAts.some((at) => grid.get(at) !== undefined);
    // drop stuff
    if (!hasLost) currDropAts.forEach((at) => grid.set(at, mathCellRandomMut(prng)));

    return {
      ...player,
      hasLost,
      grid,
      nextDropByCol: (() => {
        if (!shouldDropNext || hasLost) return player.nextDropByCol;
        const nextDropCols = prng.nextSampleIndexes(grid.size[0], 3);
        return nextDropCols.reduce((acc, dropCol) => {
          acc[dropCol]++;
          return acc;
        }, _.range(state.columns.length).fill(0));
      })(),
      currDropByCol: currDrops.map((curr) => Math.max(0, curr - 1)),
    };
  });
  return {
    ...state,
    prng: prng.state,
    players,
    ticksTillNextDrop: (state.ticksTillNextDrop + 5 - 1) % 5,
  };
}

export function mathStateGuess(
  state: MathState,
  username: Username,
  guess: string
): MathState | undefined {
  const player = state.players.get(username);
  if (player === undefined) return undefined;
  const prng = PrngMut.mk(state.prng);
  const grid = player.grid.map((cell) =>
    cell === undefined ? undefined : mathCellCheckGuess(cell, guess) ?? cell
  );
  const isAnswered = (at: ConstIVec2): boolean => grid.get(at)?.answer !== undefined;
  // for each row, check if all solved
  const rowsSolved = _.range(player.grid.size[1])
    .map((y) => _.range(player.grid.size[0]).map((x) => IVec2.fromValues(x, y)))
    .filter((rowAts) => rowAts.every(isAnswered));
  // for each column, find any stretch of cells greater than 3
  const colsSolved: ConstIVec2[][] = [];
  _.range(player.grid.size[0]).forEach((x) => {
    let stretch = 0;
    const checkStretchEndingAt = (endY: number) => {
      if (3 <= stretch)
        colsSolved.push(_.range(endY - stretch, endY).map((y) => IVec2.fromValues(x, y)));
    };
    _.range(player.grid.size[1]).forEach((y) => {
      const answered = isAnswered(IVec2.fromValues(x, y));
      if (!answered) checkStretchEndingAt(y);
      stretch = answered ? stretch + 1 : 0;
    });
    checkStretchEndingAt(player.grid.size[1]);
  });
  rowsSolved.forEach((ats) => ats.forEach((at) => grid.set(at, undefined)));
  colsSolved.forEach((ats) => ats.forEach((at) => grid.set(at, undefined)));
  const linesToSend =
    state.players.size <= 1
      ? 0
      : rowsSolved.length +
        colsSolved.map((colsAt) => colsAt.length - 2).reduce((a, b) => a + b, 0);
  const usersToSend = state.players
    .keySeq()
    .filter((playerUsername) => playerUsername !== username)
    .toArray();
  const players = _.range(linesToSend).reduce(
    (ps) => {
      const p =
        ps.get(usersToSend[prng.nextIntBetween(0, usersToSend.length)]) ??
        utils.exprThrow<MathPlayer>();
      const nextDropByCol = p.nextDropByCol.slice();
      nextDropByCol[prng.nextIntBetween(0, grid.size[0])]++;
      return ps.set(p.username, { ...p, nextDropByCol });
    },
    state.players.set(username, {
      ...player,
      grid,
    })
  );
  return {
    ...state,
    prng: prng.state,
    players,
  };
}

export enum MathUserActionType {
  Guess,
}
export interface MathUserActionGuess {
  type: MathUserActionType.Guess;
  guess: string;
}
export type MathUserAction = MathUserActionGuess;

export enum MathActionType {
  Tick,
  User,
}
export interface MathActionTick {
  type: MathActionType.Tick;
}
export interface MathActionUser {
  type: MathActionType.User;
  username: Username;
  action: MathUserAction;
}
export type MathAction = MathActionTick | MathActionUser;

export function mathStateApplyAction(state: MathState, action: MathAction): MathState | undefined {
  switch (action.type) {
    case MathActionType.Tick:
      return mathStateTick(state);
    case MathActionType.User:
      switch (action.action.type) {
        case MathUserActionType.Guess:
          return mathStateGuess(state, action.username, action.action.guess);
      }
  }
}

export enum GameType {
  Math,
}

export interface GameMath {
  type: GameType.Math;
  state: MathState;
}

export type AnyGame = GameMath;

export interface AnyGameUserActionMath {
  type: GameType.Math;
  action: MathUserAction;
}
export type AnyGameUserAction = AnyGameUserActionMath;

export interface AnyGameActionMath {
  type: GameType.Math;
  action: MathAction;
}
export type AnyGameAction = AnyGameActionMath;

export function anyGameUserActionWithUsername(
  action: AnyGameUserAction,
  username: Username
): AnyGameAction {
  switch (action.type) {
    case GameType.Math:
      return {
        type: action.type,
        action: { type: MathActionType.User, username, action: action.action },
      };
  }
}

export function anyGameApplyAction(game: AnyGame, action: AnyGameAction): AnyGame | undefined {
  switch (game.type) {
    case GameType.Math: {
      if (game.type !== action.type) return undefined;
      const state = mathStateApplyAction(game.state, action.action);
      return state === undefined ? game : { ...game, state };
    }
  }
}
