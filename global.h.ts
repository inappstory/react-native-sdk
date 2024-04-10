export type Option<T> = T | null | undefined;

export type Dict<T = any> = {
    [key: string]: T | undefined;
    [key: number]: T | undefined;
    // [key: symbol]: T | undefined;
}

export type Brand<T, B extends string> = T & { readonly __brand: B }

export type Modify<T, R> = Omit<T, keyof R> & R;

/*
Example:

interface OriginalInterface {
  a: string;
  b: boolean;
  c: number;
}

type ModifiedType  = Modify<OriginalInterface , {
  a: number;
  b: number;
}>

// ModifiedType = { a: number; b: number; c: number; }

 */


/**
 * This tuple type is intended for use as a generic constraint to infer concrete
 * tuple type of ANY length.
 *
 * @see https://github.com/krzkaczor/ts-essentials/blob/a4c2485bc3f37843267820ec552aa662251767bc/lib/types.ts#L169
 */
type Tuple<T = unknown> = [T?, ...T[]]
