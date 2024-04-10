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

let _isWindowSupportIframeBlobSrc = false;
let resolved = false;

// arr with resolves
let queue = new Array();

export const isWindowSupportIframeBlobSrc = async () => {
    return new Promise((resolve, reject) => {
        const cb = () => resolve(_isWindowSupportIframeBlobSrc);
        if (resolved) {
            cb();
        } else {
            queue.push(cb);
        }
    });
};

(function() {
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
    const cb = (event:MessageEvent) => {
        if (event.data === 'test_ifr_loaded') {
            _isWindowSupportIframeBlobSrc = true;
            cbComplete();
        }
    }
    window.addEventListener('message', cb);
    iframe.src = URL.createObjectURL(blob);
    setTimeout(cbComplete, 300);
})();
