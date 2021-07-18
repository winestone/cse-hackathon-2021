export function exprThrow<T, E = undefined>(e?: E): T {
  throw e ?? new Error();
}
