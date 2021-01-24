export enum MaybeType {
  Just,
  Nothing
}

interface IJust<T> {
  type: typeof MaybeType.Just
  value: T
}

interface INothing {
  type: typeof MaybeType.Nothing
}

export type Maybe<T> = IJust<T> | INothing

export const Nothing = (): INothing => ({ type: MaybeType.Nothing })
export const Just = <T> (value: T): IJust<T> => ({ value, type: MaybeType.Just })
