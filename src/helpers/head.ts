export function head(array: Array<any>) {
  const [ head, ...tail ] = array;
  return head;
}