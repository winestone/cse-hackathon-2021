// Brands a type `T` with `B`. Makes it hard to confused `number`s with different brands together.
export type Brand<T, B> = T & { __brand: B };

export type ConnectionId = Brand<number, "ConnectionId">;
export type GameLobbyId = Brand<number, "GameLobbyId">;
export type PrngState = Brand<number, "PrngState">;
export type Username = Brand<string, "Username">;
