import * as either from "fp-ts/lib/Either";
import type { Either } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import immutable from "immutable";

import { GameLobbyId, Username } from "./common";

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
export function lobbiesCreate(
  state: LobbiesState,
  username: Username
): Either<LobbiesCreateError, { state: LobbiesState; createdLobby: GameLobbyId }> {
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
export function lobbiesJoin(
  state: LobbiesState,
  username: Username,
  lobbyId: GameLobbyId
): Either<LobbiesJoinError, LobbiesState> {
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
export function lobbiesLeave(
  state: LobbiesState,
  username: Username
): Either<LobbiesLeaveError, LobbiesState> {
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
export function lobbiesSetReady(
  state: LobbiesState,
  username: Username,
  ready: boolean
): Either<LobbiesSetReadyError, LobbiesState> {
  const lobby = lobbiesGetUserLobby(state, username);
  if (lobby === undefined) return either.left(LobbiesSetReadyError.UserNotInALobby);
  return either.right({
    ...state,
    lobbies: state.lobbies.set(lobby.id, {
      ...lobby,
      players: lobby.players.set(username, ready),
    }),
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

export function lobbiesApplyAction(
  state: LobbiesState,
  action: LobbiesAction
): LobbiesState | undefined {
  switch (action.action.type) {
    case LobbiesUserActionType.Create:
      return pipe(
        lobbiesCreate(state, action.username),
        either.getOrElseW(() => undefined)
      )?.state;
    case LobbiesUserActionType.Join:
      return pipe(
        lobbiesJoin(state, action.username, action.action.lobbyId),
        either.getOrElseW(() => undefined)
      );
    case LobbiesUserActionType.Leave:
      return pipe(
        lobbiesLeave(state, action.username),
        either.getOrElseW(() => undefined)
      );
    case LobbiesUserActionType.SetReady:
      return pipe(
        lobbiesSetReady(state, action.username, action.action.ready),
        either.getOrElseW(() => undefined)
      );
  }
}
