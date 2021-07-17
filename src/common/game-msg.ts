import { GameLobbyId, Username } from "@common/common";
import * as game from "@common/game";
import immutable from "immutable";

export interface Lobby {
  id: GameLobbyId;
  players: {
    username: Username;
    ready: boolean;
  }[];
}

export interface LobbiesState {
  lobbies: Lobby[];
  nextLobbyId: GameLobbyId;
}

export enum ClientMessageType {
  Login,
  Lobby,
  Game,
}

export interface ClientMessageLogin {
  type: ClientMessageType.Login;
  username: Username;
}

export interface ClientMessageLobby {
  type: ClientMessageType.Lobby;
  action: game.LobbiesUserAction;
}

export interface ClientMessageGame {
  type: ClientMessageType.Game;
  action: game.AnyGameUserAction;
}

export type ClientMessage = ClientMessageLogin | ClientMessageLobby | ClientMessageGame;

export enum ServerMessageType {
  Init,
  Lobby,
  GameNew,
  Game,
}

export interface ServerMessageInit {
  type: ServerMessageType.Init;
  lobbiesState: LobbiesState;
  // TODO: serialize game
  game?: game.AnyGame;
}

export interface ServerMessageLobby {
  type: ServerMessageType.Lobby;
  action: game.LobbiesAction;
}

export interface ServerMessageGameNew {
  type: ServerMessageType.GameNew;
  prng: game.PrngState;
  players: Username[];
}

export interface ServerMessageGame {
  type: ServerMessageType.Game;
  action: game.AnyGameAction;
}

export type ServerMessage =
  | ServerMessageInit
  | ServerMessageLobby
  | ServerMessageGameNew
  | ServerMessageGame;

export function lobbyEncode(lobby: game.Lobby): Lobby {
  return {
    id: lobby.id,
    players: lobby.players
      .entrySeq()
      .map(([username, ready]) => ({ username, ready }))
      .toArray(),
  };
}
export function lobbyDecode(lobby: Lobby): game.Lobby {
  return {
    id: lobby.id,
    players: immutable.Map(lobby.players.map((player) => [player.username, player.ready])),
  };
}

export function lobbiesStateEncode(lobbiesState: game.LobbiesState): LobbiesState {
  return {
    lobbies: lobbiesState.lobbies.valueSeq().map(lobbyEncode).toArray(),
    nextLobbyId: lobbiesState.nextLobbyId,
  };
}
export function lobbiesStateDecode(lobbiesState: LobbiesState): game.LobbiesState {
  return {
    lobbies: immutable.Map(lobbiesState.lobbies.map((lobby) => [lobby.id, lobbyDecode(lobby)])),
    nextLobbyId: lobbiesState.nextLobbyId,
  };
}
