import exp from "constants";

export function extractStyles(filterCb: (style: CSSStyleSheet) => boolean) {
    let styleText = "";

    Array.prototype.slice.call(window.document.styleSheets).forEach(style => {
        if (filterCb(style)) {
            styleText += Array.prototype.slice.call(style.rules).map(el => el.cssText).join("");
        }
    });

    return styleText;
}

// for fetch file:// android only
// + baseUrl = "file:///data/" + setAllowFileAccessFromFileURLs(true)
function fetchLocal(url: string) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest;
        xhr.onload = function () {
            // status 0 in android 9+
            try {
                resolve(new Response(xhr.response, {status: (xhr.status >= 200 && xhr.status <= 599) ? xhr.status : 200}));
            } catch (e) {
                console.error(e);
                reject(e);
            }
        }
        xhr.onerror = function () {
            reject(new TypeError('Local request failed'));
        }
        xhr.open('GET', url);
        xhr.responseType = "arraybuffer";
        xhr.send(null);
    })
}

const fetchBlob = async (src: string) => (await fetch(src)).blob();

const inlineContent = async (src: string) => {
    const blob = await fetchBlob(src);
    return fileAsBase64(new File([blob], 'image', {type: blob.type, lastModified: new Date().getTime()}), false);
};


function fileAsBase64(file: File, removeSchema = true) {
    return new Promise<string>(function(resolve) {
        var reader = new FileReader();
        reader.onloadend = function() {
            if (removeSchema) {
                // use a regex to remove data url part
                var base64String = String(reader.result).replace("data:", "").replace(/^.+,/, "");
                resolve(base64String);
            } else {
                resolve(String(reader.result));
            }
        };
        reader.readAsDataURL(file);
    });
}

function parseValue(str: string, startIndex: number, prefixToken: string, suffixTokens: Array<string>) {
    var idx = str.indexOf(prefixToken, startIndex);
    if (idx === -1) {
        return null;
    }

    var val = '';
    for (var i=idx+prefixToken.length; i<str.length; i++) {
        if (suffixTokens.indexOf(str[i]) !== -1) {
            break;
        }
        val += str[i];
    }

    return {
        "foundAtIndex": idx,
        "value": val
    }
}

function removeQuotes(str: string) {
    return str.replace(/["']/g, "");
}

function getSrcUrlFromFromStyles(styles: string) {
    var urlsFound = [];
    var searchStartIndex = 0;

    while (true) {
        var url = parseValue(styles, searchStartIndex, 'src: url(', [' ', ')', '\t']);
        if (url == null) {
            break;
        }

        searchStartIndex = url.foundAtIndex + url.value.length;
        urlsFound.push(removeQuotes(url.value));
    }

    return urlsFound;
}

function base64EncodeUnicode(str: string) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}

// helper for create svg nodes
function getNode(n: string, v: Dict<string>) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", n);
    for (let p in v)
        node.setAttributeNS(null, p.replace(/[A-Z]/g, function(m, p, o, s) { return "-" + m.toLowerCase(); }), String(v[p]));
    return node;
}

export enum ENV {
    IOS,
    ANDROID,
    OTHER,
}

function _renderSlideImage(env: ENV, preview: Element, styles: string, width: number, height: number, imageType: string, imageQuality: number, success: (blob: Blob) => void, fail: (msg: string) => void) {
    var svg = getNode("svg", {width: String(width), height: String(height), style: "background-color: #fff;"});
    var foreignObject = getNode("foreignObject", {x: "0", y: "0", width: "100%", height: "100%"});
    svg.appendChild(foreignObject);

    try {
        // absolute fontSize for inner em elements
        foreignObject.style.fontSize = document.body.style.fontSize;
    } catch (e) {console.error(e)}

    function renderImage() {
        foreignObject.appendChild(preview.cloneNode(true));

        var promises: Array<Promise<void>> = [];

        // Load fonts
        getSrcUrlFromFromStyles(styles).forEach(function(src) {
            promises.push(new Promise(function (resolve, reject) {
                inlineContent(src).then(function(srcBase64) {
                    styles = styles.replace(src, srcBase64);
                    resolve();
                }).catch(function(e) {
                    // skip error for font file
                    resolve();
                    // reject(e);
                });
            }));
        });

        //Load image and gifs
        foreignObject.querySelectorAll("img").forEach(function(img) {
            img.crossOrigin = "Anonymous";
            promises.push(new Promise(function (resolve, reject) {

                inlineContent(img.src).then(function(src) {
                    img.src = src;
                    img.decode().then(function() {
                        resolve();
                    });
                }).catch(function(e) {
                    // reject(e)
                    // skip error for image file
                    resolve();
                });
            }));
        });

        //load videos
        foreignObject.querySelectorAll("video").forEach(function(video) {
            promises.push(new Promise(function (resolve, reject) {
                function loadedMetaData(video: HTMLVideoElement, resolve: () => void) {
                    var canvas = document.createElement("canvas"),
                        context = canvas.getContext("2d");

                    video.currentTime = 0;

                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    video.onseeked = function () {

                        video.style.display = "none";
                        document.body.appendChild(video);

                        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

                        var img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.src = canvas.toDataURL('image/jpeg', 1.0);

                        img.decode().then(function() {
                            video.parentNode?.appendChild(img);
                            video.parentNode?.removeChild(video);
                            canvas.remove();

                            resolve();
                        });
                    };
                }

                video.onloadedmetadata = function() {loadedMetaData(video, resolve)};
                video.onerror = function (error) {
                    console.error(error);
                    // skip error for video file
                    resolve();
                    // reject(error);
                };

                video.load();
            }));
        });

        Promise.all(promises).then(function() {
            const styleNode = getNode("style", {});
            styleNode.textContent = styles;
            svg.appendChild(styleNode);


            const data = new XMLSerializer().serializeToString(svg);
            const image = new Image();

            image.setAttribute("crossOrigin", "Anonymous");
            image.crossOrigin = "Anonymous";
            image.src = "data:image/svg+xml;base64," + base64EncodeUnicode(data);
            image.decode().then(function() {
                // 50ms timeout for decode base64 fonts inside svg (iOS only issue)
                setTimeout(function() {
                    // create a new canvas just to rasterize that svg
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if (ctx) {
                        // retina scale up
                        canvas.style.width = width + "px";
                        canvas.style.height = height + "px";

                        canvas.width = width * 2;
                        canvas.height = height * 2;
                        ctx.scale(2, 2);


                        ctx.drawImage(image, 0, 0);

                        const dataUrl = canvas.toDataURL(imageType, imageQuality);

                        fetchBlob(dataUrl).then(function(blob) {
                            success(blob);
                            canvas.remove();
                        });

                    }
                }, env === ENV.IOS ? 50 : undefined);


            }).catch(encodingError => {
                fail('error render svg image: ' + encodingError);
            });

        });



    }

    renderImage();
}

function _renderSlideImageJpeg(env: ENV, preview: Element, styles: string, success: (blob: Blob) => void, failed: (msg: string) => void) {
    var width = preview.clientWidth;
    var height = preview.clientHeight;

    _renderSlideImage(env, preview, styles, width, height, 'image/jpeg', 1.0, success, failed);
}

export function processSlideElement(env: ENV, preview: Element, styles: string) {
    return new Promise<string>(async (resolve, reject) => {
        const imageSuccess = async (blob: Blob) => {
            const file = new File([blob], 'image.jpeg', {
                type: blob.type,
                lastModified: new Date().getTime()
            });
            const base64 = fileAsBase64(file, false);

            resolve(base64);
        };

        const imageFail = function () {
            console.error("Image fail");
        };

        _renderSlideImageJpeg(env, preview, styles, imageSuccess, imageFail);
    });
}
