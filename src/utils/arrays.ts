/**
 * Lookup something in an array.
 */
export function lookup<T1, T2>(arr: T1[], predicate: (item: T1) => T2 | undefined): T2 | undefined {
  let ret: T2 | undefined;
  arr.some(item => {
    const candidate = predicate(item);
    if (candidate !== undefined) {
      ret = candidate;
      return true;
    }
  })
  return ret;
}
