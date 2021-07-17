import * as either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import React, { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import * as game from "@common/game";
import * as gameMsg from "@common/game-msg";
import { Username } from "@common/common";

const LobbyComponent = ({
  lobby,
  showJoinButton,
  showLeaveButton,
  onJoinClick,
  onLeaveClick,
}: {
  lobby: game.Lobby;
  showJoinButton?: boolean;
  showLeaveButton?: boolean;
  onJoinClick?: () => void;
  onLeaveClick?: () => void;
}) => {
  return (
    <div style={{ border: "1px solid black" }}>
      <p>New Lobby</p>
      <p>Players in this lobby: </p>
      {lobby.players
        .entrySeq()
        .sortBy(([playerUsername]) => playerUsername)
        .map(([playerUsername, ready]) => (
          <div key={playerUsername}>
            <p>{playerUsername}</p>
            <p>{ready}</p>
          </div>
        ))}
      {showJoinButton ? (
        <button type="button" onClick={onJoinClick}>
          Join Lobby
        </button>
      ) : null}
      {showLeaveButton ? (
        <button type="button" onClick={onLeaveClick}>
          Leave Lobby
        </button>
      ) : null}
    </div>
  );
};

export interface GameProps {
  username: Username;
}
export function Game({ username }: GameProps): JSX.Element {
  const [lobbiesState, setLobbiesState] = useState<game.LobbiesState | undefined>();
  const {
    sendJsonMessage,
  }: {
    sendJsonMessage: (msg: gameMsg.ClientMessage) => void;
  } = useWebSocket(
    `${{ "http:": "ws:", "https:": "wss:" }[window.location.protocol]}${
      window.location.host
    }/api/game/websocket`,
    {
      onOpen: () => sendJsonMessage({ type: gameMsg.ClientMessageType.Login, username }),
      onMessage: (ev: MessageEvent<string>) => {
        const msg: gameMsg.ServerMessage = JSON.parse(ev.data);
        switch (msg.type) {
          case gameMsg.ServerMessageType.Init:
            setLobbiesState(gameMsg.lobbiesStateDecode(msg.lobbiesState));
            break;
          case gameMsg.ServerMessageType.Lobby:
            {
              const { action } = msg;
              setLobbiesState((prevLobbiesState) =>
                prevLobbiesState === undefined
                  ? undefined
                  : game.lobbiesApplyAction(prevLobbiesState, action) ?? prevLobbiesState
              );
            }
            break;
        }
      },
    },
    true
  );

  const userLobby =
    lobbiesState !== undefined ? game.lobbiesGetUserLobby(lobbiesState, username) : undefined;

  return (
    <>
      <p>Game with {username}|</p>
      {lobbiesState === undefined ? (
        "Loading"
      ) : (
        <>
          {lobbiesState.nextLobbyId === 1 ? (
            <p>There are no lobbies currently. Why don&apos;t you make one?</p>
          ) : (
            lobbiesState.lobbies
              .valueSeq()
              .sortBy((lobby) => lobby.id)
              .map((lobby) => (
                <LobbyComponent
                  key={lobby.id}
                  lobby={lobby}
                  showJoinButton={userLobby === undefined}
                  showLeaveButton={lobby.id === userLobby?.id}
                  onJoinClick={() =>
                    sendJsonMessage({
                      type: gameMsg.ClientMessageType.Lobby,
                      action: { type: game.LobbiesUserActionType.Join, lobbyId: lobby.id },
                    })
                  }
                  onLeaveClick={() =>
                    sendJsonMessage({
                      type: gameMsg.ClientMessageType.Lobby,
                      action: { type: game.LobbiesUserActionType.Leave },
                    })
                  }
                />
              ))
          )}
          {userLobby !== undefined ? null : (
            <button
              type="button"
              onClick={() =>
                sendJsonMessage({
                  type: gameMsg.ClientMessageType.Lobby,
                  action: { type: game.LobbiesUserActionType.Create },
                })
              }
            >
              Create lobby
            </button>
          )}
        </>
      )}
    </>
  );
}

// replace App with this
export function GameWrapper(): JSX.Element {
  // text box for username
  const [username, setUsername] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  return (
    <>
      {connected ? (
        <Game username={username as Username} />
      ) : (
        <>
          <label htmlFor="username">
            Username:
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <button type="button" onClick={() => setConnected(true)}>
            Connect
          </button>
        </>
      )}
    </>
  );
  // button, on click, transforms into <Game username={username} />
}
