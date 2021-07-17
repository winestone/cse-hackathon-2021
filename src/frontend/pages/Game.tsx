import * as either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import React, { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useHistory } from "react-router";

import * as game from "@common/game";
import * as gameMsg from "@common/game-msg";
import { Username } from "@common/common";
import { GameMath } from "./GameMath";

const LobbyComponent = ({
  lobby,
  showJoinButton,
  showLeaveButton,
  onJoinClick,
  onLeaveClick,
  onReadyClick,
}: {
  lobby: game.Lobby;
  showJoinButton?: boolean;
  showLeaveButton?: boolean;
  onJoinClick?: () => void;
  onLeaveClick?: () => void;
  onReadyClick?: () => void;
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
            {ready ? <p>Ready</p> : <p>Not Ready</p>}
          </div>
        ))}
      {showJoinButton ? (
        <button type="button" onClick={onJoinClick}>
          Join Lobby
        </button>
      ) : null}
      {showLeaveButton ? (
        <>
          <button type="button" onClick={onReadyClick}>
            Ready!
          </button>
          <button type="button" onClick={onLeaveClick}>
            Leave Lobby
          </button>
        </>
      ) : null}
    </div>
  );
};

export interface GameProps {
  username: Username;
}
export function Game({ username }: GameProps): JSX.Element {
  const [lobbiesState, setLobbiesState] = useState<game.LobbiesState | undefined>();
  const [anyGame, setAnyGame] = useState<game.AnyGame | undefined>();

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
            // if (msg.game !== undefined) setAnyGame(game);
            break;
          case gameMsg.ServerMessageType.Lobby:
            {
              const { action } = msg;
              setLobbiesState((prevLobbiesState) =>
                prevLobbiesState === undefined
                  ? undefined
                  : game.lobbiesActionResultGetState(
                      game.lobbiesApplyAction(prevLobbiesState, action)
                    ) ?? prevLobbiesState
              );
            }
            break;
          case gameMsg.ServerMessageType.GameNew:
            setAnyGame({
              type: game.GameType.Math,
              state: game.mathStateNew({
                prng: msg.prng,
                usernames: msg.players,
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
            });
            break;
          case gameMsg.ServerMessageType.Game:
            {
              const { action } = msg;
              setAnyGame((prevAnyGame) =>
                prevAnyGame === undefined ? undefined : game.anyGameApplyAction(prevAnyGame, action)
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
      <p>Game with {username}</p>
      {anyGame !== undefined ? (
        <GameMath
          username={username}
          state={anyGame.state}
          onGuess={(guess) =>
            sendJsonMessage({
              type: gameMsg.ClientMessageType.Game,
              action: {
                type: game.GameType.Math,
                action: { type: game.MathUserActionType.Guess, guess },
              },
            })
          }
        />
      ) : null}
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
                  onReadyClick={() =>
                    sendJsonMessage({
                      type: gameMsg.ClientMessageType.Lobby,
                      action: {
                        type: game.LobbiesUserActionType.SetReady,
                        ready: !(lobby.players.get(username) ?? true),
                      },
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
  const history = useHistory();
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
          <button type="button" onClick={() => history.push("/client")}>
            Back to home
          </button>
        </>
      )}
    </>
  );
  // button, on click, transforms into <Game username={username} />
}
