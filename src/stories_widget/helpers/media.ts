import {styleToString} from "../util/css";
import {FontResource} from "../../story-manager/common.h";
import {Option} from "../../../global.h";

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

  const mediaElements = slideBox.querySelectorAll<HTMLMediaElement | HTMLImageElement>('img,video');

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
  let isSecure = (window as any).isSecureContext;
  if (isSecure === undefined) {
    if ((window as any).location.protocol === 'https:') {
      isSecure = true;
    }
  }
  if (!isSecure) {
    return url.replace(/^https:\/\//, 'http://');
  }

  return url;
}



export function fontFaceAsCss(fontResources: Array<FontResource>): Option<string> {
    return fontResources.map(font => _fontFaceAsCss(font)).filter(Boolean).join("");
}

function _fontFaceAsCss(fontResource: FontResource): Option<string> {
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

export function initAndLoadFonts(fonts: Array<FontResource>) {
    if ('fonts' in document) {
        // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API

        try {
            fonts.forEach(src => {
                const font = new FontFace(src.family, `url(${src.url})`, {
                    style: src.style,
                    weight: src.weight,
                    display: "block"
                    // stretch: "condensed",
                });
                // @ts-ignore
                document.fonts.add && document.fonts.add(font);
                font.load();
            });
        } catch (e) {
            console.error(e);
            initFontsFallback(fonts);
        }

    } else {
        initFontsFallback(fonts);
    }
}


function initFontsFallback(fonts: Array<FontResource>) {
    const css = fontFaceAsCss(fonts);
    if (css != null) {

        const id = 'stories-font-style';
        let style: HTMLElement | null = document.getElementById(id);

        if (style === null) {
            style = document.createElement("style");
            (style as HTMLStyleElement).type = 'text/css';
            style.id = id;
            style.attributes.setNamedItem(document.createAttribute('scoped'));

            if ((style as any).styleSheet) {
                (style as any).styleSheet.cssText = css
            } else {
                style.appendChild(document.createTextNode(css))
            }
            document.body.appendChild(style)
        } else {
            if ((style as any).styleSheet) {
                (style as any).styleSheet.cssText = css
            } else {
                style.textContent = '';
                style.appendChild(document.createTextNode(css))
            }
        }
    }
}