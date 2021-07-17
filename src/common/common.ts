// Brands a type `T` with `B`. Makes it hard to confused `number`s with different brands together.
export type Brand<T, B> = T & { __brand: B };
