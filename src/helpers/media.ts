export function onAllMediaLoaded(slideBox: HTMLElement, cb: Function) {
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
    promises.push(new Promise((resolve, reject) => setTimeout(resolve, 300)));
  }
  Promise.all(promises).then((values) => {
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