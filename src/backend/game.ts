import express from "express";
import expressWs from "express-ws";
import * as either from "fp-ts/lib/Either";
import type { Either } from "fp-ts/lib/Either";
import immutable from "immutable";
import * as Ws from "ws";

import { ConnectionId, Username } from "@common/common";
import * as game from "@common/game";
import * as gameMsg from "@common/game-msg";

interface ClientState {
  connectionId: ConnectionId;
  username: Username;
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
              if (result !== undefined) {
                lobbiesState = result;
                sendToAll({
                  type: gameMsg.ServerMessageType.Lobby,
                  action,
                });
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
