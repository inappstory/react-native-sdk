
// let _isWindowSupportIframeBlobSrc = false;
let _isWindowSupportIframeBlobSrc = true;
// TODO или блокировать UI и синхронно ждать когда проверим _isWindowSupportIframeBlobSrc
// или рендер делать async чтобы там ждать когда проверим _isWindowSupportIframeBlobSrc
let resolved = false;

// arr with resolves
let queue = new Array();

export const isWindowSupportIframeBlobSrcSync = () => {
  // let result = false;
  let result = true;
  (async () => {
    result = await isWindowSupportIframeBlobSrc();
  })();
  return result;
};

export const isWindowSupportIframeBlobSrc = async () => {
  return new Promise<boolean>((resolve, reject) => {
    const cb = () => resolve(_isWindowSupportIframeBlobSrc);
    if (resolved) {
      cb();
    } else {
      queue.push(cb);
    }
  });
};

(function () {
  const iframe = document.createElement('iframe');
  iframe.style.height = '0';
  iframe.style.width = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);
  const html = `
<html>
<body>
<script>window.top.postMessage('test_ifr_loaded', '*');<\/script></body></html>
`;
  const blob = new Blob([html], {type: 'text/html'});

  const cbComplete = () => {
    window.removeEventListener('message', cb);
    const parent = iframe.parentNode;
    if (parent) {
      parent.removeChild(iframe);
    }
    resolved = true;

    console.log("cbComplete", {resolved, _isWindowSupportIframeBlobSrc});

    if (queue && queue.length) {
      setTimeout(() => {
        var callback;
        while (callback = queue.pop()) {
          try {
            callback();
          } catch (e) {
            try {
              console.error(e);
            } catch (e2) {
            }
          }
        }
      }, 0);
    }

  };
  const cb = (event: MessageEvent) => {
    if (event.data === 'test_ifr_loaded') {
      _isWindowSupportIframeBlobSrc = true;
      cbComplete();
    }
  }
  window.addEventListener('message', cb);
  iframe.src = URL.createObjectURL(blob);
  setTimeout(cbComplete, 300);
})();
