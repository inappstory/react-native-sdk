export function extend(target: any, source: any, overwrite: boolean): any {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (overwrite || target[key] === undefined) {
        target[key] = source[key];
      }
    }
  }
  return target;
}

export enum BlobContentType {
  CSS = 'text/css',
  JS = 'text/javascript',
  HTML = 'text/html',
}

export function getBlobURL(code: string, type: BlobContentType): string {
  const blob = new Blob([code], {type})
  return URL.createObjectURL(blob)
}