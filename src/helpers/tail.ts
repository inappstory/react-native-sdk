export function tail(array: Array<any>) {
  const [ head, ...tail ] = array;
  return tail;
}