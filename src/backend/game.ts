import express from "express";
import expressWs from "express-ws";
import * as either from "fp-ts/lib/Either";
import type { Either } from "fp-ts/lib/Either";
import immutable from "immutable";
import * as Ws from "ws";

import { ConnectionId, GameLobbyId, Username } from "@common/common";
import * as game from "@common/game";
import * as gameMsg from "@common/game-msg";

interface ClientState {
  connectionId: ConnectionId;
  username: Username;
}

interface LobbyGameState {
  lobbyId: GameLobbyId;
  // true if haven't left yet
  players: immutable.Map<Username, boolean>;
  game: game.AnyGame;
}

function sendWs(ws: Ws, msg: gameMsg.ServerMessage) {
  ws.send(JSON.stringify(msg));
}

// eslint-disable-next-line import/prefer-default-export
export function addRoutes(app: expressWs.Router): expressWs.Router {
  const getNextConnectionId = (() => {
    let nextConnectionId = 1 as ConnectionId;
    return (): ConnectionId => {
      return nextConnectionId++ as ConnectionId;
    };
  })();

  let connections = immutable.Map<Username, immutable.Map<ConnectionId, Ws>>();
  let lobbiesState = game.lobbiesEmpty();
  let lobbyGames = immutable.Map<GameLobbyId, LobbyGameState>();
  let lobbyGameIdsByUsername = immutable.Map<Username, GameLobbyId>();

  const sendTo = (username: Username, msg: gameMsg.ServerMessage) => {
    connections.get(username)?.forEach((ws) => sendWs(ws, msg));
  };
  const sendToAll = (msg: gameMsg.ServerMessage) => {
    connections.forEach((conns) => conns.forEach((ws) => sendWs(ws, msg)));
  };
  const sendToAllBut = (username: Username, msg: gameMsg.ServerMessage) => {
    connections.forEach((conns, connUsername) => {
      if (connUsername !== username) conns.forEach((ws) => sendWs(ws, msg));
    });
  };

  setInterval(() => {
    const action: game.AnyGameAction = {
      type: game.GameType.Math,
      action: { type: game.MathActionType.Tick },
    };
    lobbyGames.map((lobby) => ({
      ...lobby,
      game: game.anyGameApplyAction(lobby.game, action),
    }));
    const msg: gameMsg.ServerMessage = {
      type: gameMsg.ServerMessageType.Game,
      action,
    };
    lobbyGames.forEach((lobby) => lobby.players.forEach((_, username) => sendTo(username, msg)));
  }, 1000);

  app.ws("/websocket", (ws, req) => {
    let clientState: ClientState | undefined;
    ws.on("message", (data: string) => {
      const msg: gameMsg.ClientMessage = JSON.parse(data);
      if (clientState === undefined) {
        if (msg.type !== gameMsg.ClientMessageType.Login) {
          ws.close();
          return;
        }
        clientState = {
          connectionId: getNextConnectionId(),
          username: msg.username,
        };
        connections = connections.set(
          msg.username,
          (connections.get(msg.username) ?? immutable.Map<ConnectionId, Ws>()).set(
            clientState.connectionId,
            ws
          )
        );
        sendTo(msg.username, {
          type: gameMsg.ServerMessageType.Init,
          lobbiesState: gameMsg.lobbiesStateEncode(lobbiesState),
        });
      } else {
        if (msg.type === gameMsg.ClientMessageType.Login) {
          ws.close();
          return;
        }
        switch (msg.type) {
          case gameMsg.ClientMessageType.Lobby:
            {
              const action: game.LobbiesAction = {
                type: game.LobbiesActionType.User,
                username: clientState.username,
                action: msg.action,
              };
              const result = game.lobbiesApplyAction(lobbiesState, action);
              const resultState = game.lobbiesActionResultGetState(result);
              if (resultState !== undefined) {
                lobbiesState = resultState;
                sendToAll({
                  type: gameMsg.ServerMessageType.Lobby,
                  action,
                });
              }
              switch (result.result.type) {
                case game.LobbiesUserActionType.SetReady:
                  if (
                    either.isRight(result.result.result) &&
                    result.result.result.right.lobbyReady !== undefined
                  ) {
                    const prng = (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) |
                      0) as game.PrngState;
                    const lobby = result.result.result.right.lobbyReady;
                    const players = lobby.players.keySeq().toArray();
                    lobbyGames = lobbyGames.set(lobby.id, {
                      lobbyId: lobby.id,
                      game: {
                        type: game.GameType.Math,
                        state: game.mathStateNew({
                          prng,
                          usernames: players,
                          difficulty: game.MathDifficulty.Grade10,
                          height: 10,
                          columns: [
                            game.MathQuestionType.ComputeGcd,
                            game.MathQuestionType.ComputeLargestPrimeFactor,
                            game.MathQuestionType.ComputeLcm,
                            game.MathQuestionType.ComputeSimple,
                            game.MathQuestionType.FindOperations,
                          ],
                        }),
                      },
                      players: lobby.players.map(() => true),
                    });
                    lobby.players.forEach((_, playerUsername) => {
                      lobbyGameIdsByUsername = lobbyGameIdsByUsername.set(playerUsername, lobby.id);
                      sendTo(playerUsername, {
                        type: gameMsg.ServerMessageType.GameNew,
                        prng,
                        players,
                      });
                    });
                  }
                  break;
                default:
                  break;
              }
            }
            break;
          case gameMsg.ClientMessageType.Game:
            {
              const lobbyId = lobbyGameIdsByUsername.get(clientState.username);
              if (lobbyId !== undefined) {
                const lobby = lobbyGames.get(lobbyId);
                if (lobby !== undefined) {
                  const action: game.AnyGameAction = game.anyGameUserActionWithUsername(
                    msg.action,
                    clientState.username
                  );
                  const result = game.anyGameApplyAction(lobby.game, action);
                  if (result !== undefined) {
                    lobbyGames = lobbyGames.set(lobbyId, { ...lobby, game: result });
                    const message: gameMsg.ServerMessage = {
                      type: gameMsg.ServerMessageType.Game,
                      action,
                    };
                    lobby.players.forEach((_, playerUsername) => sendTo(playerUsername, message));
                  }
                }
              }
            }
            break;
        }
      }
    });
    ws.on("close", () => {
      if (clientState === undefined) return;
      connections.set(
        clientState.username,
        (connections.get(clientState.username) ?? immutable.Map<ConnectionId, Ws>()).delete(
          clientState.connectionId
        )
      );
    });
  });

  return app;
}
