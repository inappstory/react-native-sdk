import {styleToString} from "~/src/stories_widget/util/css";
import {FontResource} from "~/src/types";

export function onAllMediaLoaded(slideBox: HTMLElement, cb: () => void) {
  const loadMedia = function (media: HTMLMediaElement | HTMLImageElement) {
    return new Promise(function (resolve, reject) {
      if (media.tagName.toLowerCase() === 'img' && media instanceof HTMLImageElement) {
        const imageLoadHandler = () => {
          // first frame after load
          requestAnimationFrame(
            () =>  // startRender
              //Rendering start
              requestAnimationFrame(() => {
                resolve(media);
                media.removeEventListener('load', imageLoadHandler);
              })
          );
        };
        media.addEventListener('load', imageLoadHandler);
        if (media.complete && media.naturalHeight !== 0) {
          // resolve(media)

          // first frame after load
          requestAnimationFrame(
            function () { // startRender
              //Rendering start
              requestAnimationFrame(function () {
                resolve(media);
                // console.log('img already loaded');
              });
            }
          );

        }
      } else if (media.tagName.toLowerCase() === 'video' && media instanceof HTMLMediaElement) {
        if (media.oncanplaythrough !== undefined) {
          const oncanplaythroughHandler = () =>
            //Rendering start
            requestAnimationFrame(() => requestAnimationFrame(() => {
                resolve(media);
                media.removeEventListener('canplaythrough', oncanplaythroughHandler);
                // console.log('video - canplaythrough');
              })
            )
          ;
          // first frame after load
          // startRender
          media.addEventListener('canplaythrough', oncanplaythroughHandler);
          media.load();
        } else {
          const videLoadHandler = () =>
            //Rendering start
            requestAnimationFrame(() => requestAnimationFrame(() => {
                resolve(media);
                media.removeEventListener('canplay', videLoadHandler);
                // console.log('video - load');
              })
            );

          media.addEventListener('canplay', videLoadHandler);
          media.load();
        }

      }

      media.addEventListener('error', function (err: any) {
        reject(err)
      });

    });
  };

  const mediaElements = <NodeListOf<HTMLMediaElement | HTMLImageElement>>slideBox.querySelectorAll('img,video');

  let i;
  let promises = [];
  for (i = 0; i < mediaElements.length; ++i) {
    promises.push(loadMedia(mediaElements[i]));
  }
  // не должно быть fallback
  // const fallbackTimeout = setTimeout(() => cb(), 300);
  if (promises.length > 0) {
    // минимальная задержка 300ms
    // promises.push(new Promise((resolve, reject) => setTimeout(resolve, 300) ) );

  }
    Promise.all(promises).then( (values) => {
        // clearTimeout(fallbackTimeout);
        cb();
    });
}

export function checkUrlProtocol(url: string): string {
  let isSecure = (<any>window).isSecureContext;
  if (isSecure === undefined) {
    if ((<any>window).location.protocol === 'https:') {
      isSecure = true;
    }
  }
  if (!isSecure) {
    return url.replace(/^https:\/\//, 'http://');
  }

  return url;
}


export function fontFaceAsCss(fontResource: FontResource): Optional<string> {
  if (!fontResource.url) {
    return null;
  }

  let styles = {
    'font-family': fontResource.family ?? 'normal',
    'src': `url('${checkUrlProtocol(String(fontResource.url))}')`,
    'font-style': fontResource.style ?? 'normal',
    'font-weight': fontResource.weight ?? 'normal',
  };

  if (fontResource.title) {
    styles.src += `, local('${fontResource.title}')`;
  }

  return `@font-face {${styleToString(styles)}}\n`;
}

export function initFontStyle(css: string): void {
  const id = 'stories-font-style';
  let style: HTMLElement | null = document.getElementById(id);

  if (style === null) {
    style = document.createElement("style");
    (<HTMLStyleElement>style).type = 'text/css';
    style.id = id;
    style.attributes.setNamedItem(document.createAttribute('scoped'));

    if ((<any>style).styleSheet) {
      (<any>style).styleSheet.cssText = css
    } else {
      style.appendChild(document.createTextNode(css))
    }
    document.body.appendChild(style)
  } else {
    if ((<any>style).styleSheet) {
      (<any>style).styleSheet.cssText = css
    } else {
      style.textContent = '';
      style.appendChild(document.createTextNode(css))
    }
  }


}