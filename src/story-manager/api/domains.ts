import {Optional} from "../types";
import Base64 from "./Base64";

const domains = {
    baseUrl: process.env.BASE_URL as string, // https://sdk.inappstory.com
    apiUrl: process.env.API_URL as string, // https://api.inappstory.com
    faviconApiUrl: process.env.FAVICON_API_URL as string, // https://favicon.inappstory.com
};

export {domains};




// pad('0000000000','123',true);
// '0000000123'
function pad(pad: string, str: string, padLeft: boolean) {
    if (typeof str === 'undefined')
        return pad;
    if (str.length >= pad.length)
        return str;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}

function base64url_decode(str: string) {
    str = str.replace(new RegExp('-', 'g'), '+').replace(new RegExp('_', 'g'), '/');
    const length = str.length;
    str = pad(new Array(length % 4).fill("=").join(""), str, false);

    try {
        return Base64.atob(str)
    } catch (e) {
        return "";
    }

}

// return api.host or null
function extractDomainFromKey(apiKey: string): Optional<string> {
    if (apiKey.length > 32) {
        try {
            const decoded = base64url_decode(apiKey);
            // get host length
            const hostLength = decoded.charCodeAt(13); // one char // quantifier = 1
            if (hostLength > 0) {
                // a - NUL-padded string, quantifier = hostLength
                let data = decoded.substr(14, hostLength);
                data = data.replace(/\0+$/, '');

                const origMask = "{QQN{xuV?1Dv16j3";
                let mask = origMask;
                let pointer = 0;
                while (mask.length < hostLength) {
                    mask += origMask[pointer];
                    pointer++;
                    if (pointer === origMask.length) {
                        pointer = 0;
                    }
                }

                let result = "";
                for (let i=0; i < hostLength; i++) {
                    result += String.fromCharCode(data.charCodeAt(i) ^ mask.charCodeAt(i));
                }

                return result;

                // const apiHost = new URL(`https://${result}`);
                //
                // console.log({apiHost, result});
                // URL.host not implemented in RN
                // return apiHost.host;
            }



        } catch (e) {
            console.error(e);
        }
    }
    return null;
}

export function defineDomains(apiKey: string) {
    const apiDomain = extractDomainFromKey(apiKey);
    // console.log({apiKey, apiDomain});
    if (apiDomain != null) {
        const parts = apiDomain.split(".").slice(1);

        // TODO need only apiDomain (in future)

        domains.baseUrl = `https://${["sdk", ...parts].join(".")}`;
        domains.faviconApiUrl = `https://${["favicon", ...parts].join(".")}`;
        domains.apiUrl = `https://${apiDomain}`;
    }
}