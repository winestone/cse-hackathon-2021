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
}

export interface ClientMessageLogin {
  type: ClientMessageType.Login;
  username: Username;
}

export interface ClientMessageLobby {
  type: ClientMessageType.Lobby;
  action: game.LobbiesUserAction;
}

export type ClientMessage = ClientMessageLogin | ClientMessageLobby;

export enum ServerMessageType {
  Init,
  Lobby,
}

export interface ServerMessageInit {
  type: ServerMessageType.Init;
  lobbiesState: LobbiesState;
}

export interface ServerMessageLobby {
  type: ServerMessageType.Lobby;
  action: game.LobbiesAction;
}

export type ServerMessage = ServerMessageInit | ServerMessageLobby;

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
