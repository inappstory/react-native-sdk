//Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(val: string) {
  return val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// replaceAll does not work in safari
export function replaceAll(val: string, match: string, replacement: string) {
  return String(val).replace(new RegExp(escapeRegExp(match), 'g'), () => replacement);
}