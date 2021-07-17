
// export enum SignedType {
//   Int32,
//   Float32,
// }
// export type AnySignedType = SignedType.Int32 | SignedType.Float32

type AnySignedTypedArray = Int32Array | Float32Array;
// type SignedTypeToArray<Ty extends AnySignedType> =
//   Ty extends SignedType.Int32 ? Int32Array :
//   Ty extends SignedType.Float32 ? Float32Array :
//   never;

type TVec2<TArr extends AnySignedTypedArray> = TArr | [number, number];
type ConstTVec2<TArr extends AnySignedTypedArray> = TArr | readonly [number, number];

export type IVec2 = TVec2<Int32Array>;
export type ConstIVec2 = ConstTVec2<Int32Array>;

/* eslint no-param-reassign: 0 */

export namespace TVec2 {
  export function copy<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] = a0;
    out[1] = a1;
    return out;
  }
  export function set<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, x: number, y: number): TVec2<TArr> {
    out[0] = x;
    out[1] = y;
    return out;
  }
  export function zero<TArr extends AnySignedTypedArray>(out: TVec2<TArr>): TVec2<TArr> {
    out[0] = 0;
    out[1] = 0;
    return out;
  }

  // export function create<Ty extends AnySignedType>(ty: Ty): TVec2<SignedTypeToArray<Ty>> {
  //   switch (ty) {
  //     case SignedType.Int32:
  //       return new Int32Array(2);
  //     case SignedType.Float32:
  //       return new Float32Array(2);
  //   }
  //   throw new Error();
  //   // if (TypedArr instanceof Int32Array) {
  //   //   return new Int32Array(2);
  //   // }
  //   // return new TypedArr() as TVec2<SignedTypedArrayConstructorToArray<TArrCons>>;
  // }
  // clone
  // export function fromValues<TArr extends AnySignedTypedArray>(a0: number, a1: number): TVec2<TArr> {
  // }

  export function exactEquals<TArr extends AnySignedTypedArray>([a0, a1]: ConstTVec2<TArr>, [b0, b1]: ConstTVec2<TArr>): boolean {
    // TODO: for floats, implement a more fuzzy equals with a function called `equals`?
    return a0 === b0 && a1 === b1;
  }
  export function exactEqualsTy<TArr extends AnySignedTypedArray, A extends ConstTVec2<TArr>, B extends A>(a: A, b: B): a is B { return exactEquals(a, b); }

  export function rotate90CW<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>): TVec2<TArr> {
    // console.log(glm.vec2.rotate(glm.vec2.create(), glm.vec2.fromValues(1, 0), glm.vec2.create(), Math.PI / 2));
    // produces [0, 1], aka [1, 0] --90 degree rotation-> [0, 1]
    out[0] = -a1;
    out[1] = a0;
    return out;
  }
  export function rotate90CCW<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>): TVec2<TArr> {
    // console.log(glm.vec2.rotate(glm.vec2.create(), glm.vec2.fromValues(1, 0), glm.vec2.create(), Math.PI / 2));
    // produces [0, 1], aka [1, 0] --90 degree rotation-> [0, 1]
    out[0] = a1;
    out[1] = -a0;
    return out;
  }

  export function add<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>, [b0, b1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] = a0 + b0;
    out[1] = a1 + b1;
    return out;
  }
  export function sub<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>, [b0, b1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] = a0 - b0;
    out[1] = a1 - b1;
    return out;
  }
  export function mul<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>, [b0, b1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] = a0 * b0;
    out[1] = a1 * b1;
    return out;
  }
  export function div<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>, [b0, b1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] = a0 / b0;
    out[1] = a1 / b1;
    return out;
  }

  export function addEquals<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] += a0;
    out[1] += a1;
    return out;
  }
  export function subEquals<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] -= a0;
    out[1] -= a1;
    return out;
  }
  export function mulEquals<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] *= a0;
    out[1] *= a1;
    return out;
  }
  export function divEquals<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] /= a0;
    out[1] /= a1;
    return out;
  }

  export function scale<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>, b: number): TVec2<TArr> {
    out[0] = a0 * b;
    out[1] = a1 * b;
    return out;
  }
  export function scaleDiv<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>, b: number): TVec2<TArr> {
    out[0] = a0 / b;
    out[1] = a1 / b;
    return out;
  }
  export function negate<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] = -a0;
    out[1] = -a1;
    return out;
  }

  export function abs<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] = Math.abs(a0);
    out[1] = Math.abs(a1);
    return out;
  }
  export function sign<TArr extends AnySignedTypedArray>(out: TVec2<TArr>, [a0, a1]: ConstTVec2<TArr>): TVec2<TArr> {
    out[0] = Math.sign(a0);
    out[1] = Math.sign(a1);
    return out;
  }
}

export namespace IVec2 {
  export function copy(out: IVec2, a: ConstIVec2): IVec2 { return TVec2.copy(out, a); }
  export function set(out: IVec2, x: number, y: number): IVec2 { return TVec2.set(out, x, y); }
  export function zero(out: IVec2): IVec2 { return TVec2.zero(out); }

  export function create(): IVec2 {
    // return new Int32Array(2); // TODO: maybe use this but marshal it to/from a tuple over the wire
    return [0, 0];
  }
  export function clone(a: ConstIVec2): IVec2 {
    return copy(create(), a);
  }
  export function fromValues(x: number, y: number): IVec2 {
    return set(create(), x, y);
  }

  export function equals(a: ConstIVec2, b: ConstIVec2): boolean { return TVec2.exactEquals(a, b); }
  export function equalsTy<A extends ConstIVec2, B extends A>(a: A, b: B): a is B { return TVec2.exactEqualsTy(a, b); }

  export function rotate90CW(out: IVec2, a: ConstIVec2): IVec2 { return TVec2.rotate90CW(out, a); }
  export function rotate90CCW(out: IVec2, a: ConstIVec2): IVec2 { return TVec2.rotate90CCW(out, a); }

  export function add(out: IVec2, a: ConstIVec2, b: ConstIVec2): IVec2 { return TVec2.add(out, a, b); }
  export function sub(out: IVec2, a: ConstIVec2, b: ConstIVec2): IVec2 { return TVec2.sub(out, a, b); }
  export function mul(out: IVec2, a: ConstIVec2, b: ConstIVec2): IVec2 { return TVec2.mul(out, a, b); }
  export function div(out: IVec2, a: ConstIVec2, b: ConstIVec2): IVec2 { return TVec2.div(out, a, b); }

  export function addEquals(out: IVec2, a: ConstIVec2): IVec2 { return TVec2.addEquals(out, a); }
  export function subEquals(out: IVec2, a: ConstIVec2): IVec2 { return TVec2.subEquals(out, a); }
  export function mulEquals(out: IVec2, a: ConstIVec2): IVec2 { return TVec2.mulEquals(out, a); }
  export function divEquals(out: IVec2, a: ConstIVec2): IVec2 { return TVec2.divEquals(out, a); }

  export function scale(out: IVec2, a: ConstIVec2, b: number): IVec2 { return TVec2.scale(out, a, b); }
  export function scaleDiv(out: IVec2, a: ConstIVec2, b: number): IVec2 { return TVec2.scaleDiv(out, a, b); }
  export function negate(out: IVec2, a: ConstIVec2): IVec2 { return TVec2.negate(out, a); }

  export function abs(out: IVec2, a: ConstIVec2): IVec2 { return TVec2.abs(out, a); }
  export function sign(out: IVec2, a: ConstIVec2): IVec2 { return TVec2.sign(out, a); }
}
