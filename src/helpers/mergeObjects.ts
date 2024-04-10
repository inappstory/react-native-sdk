export function mergeObjects<T extends Object, M extends Object>(obj1: T, obj2: M): T & M {
  return {...obj1, ...obj2};
}