/*
 * Based on JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 */
export function md5(n) {
        var j = function(o, r) {
            var q = (o & 65535) + (r & 65535), p = (o >> 16) + (r >> 16) + (q >> 16);
            return (p << 16) | (q & 65535)
        }, g  = function(o, p) {
            return (o << p) | (o >>> (32 - p))
        }, k  = function(w, r, p, o, v, u) {
            return j(g(j(j(r, w), j(o, u)), v), p)
        }, a  = function(q, p, w, v, o, u, r) {
            return k((p & w) | ((~p) & v), q, p, o, u, r)
        }, h  = function(q, p, w, v, o, u, r) {
            return k((p & v) | (w & (~v)), q, p, o, u, r)
        }, c  = function(q, p, w, v, o, u, r) {
            return k(p ^ w ^ v, q, p, o, u, r)
        }, m  = function(q, p, w, v, o, u, r) {
            return k(w ^ (p | (~v)), q, p, o, u, r)
        }, b  = function(A, u) {
            var z                           = 1732584193, y = -271733879, w = -1732584194, v = 271733878, r, q, p, o;
            A[u >> 5] |= 128 << ((u) % 32);
            A[(((u + 64) >>> 9) << 4) + 14] = u;
            for (var t = 0, s = A.length; t < s; t += 16) {
                r = z;
                q = y;
                p = w;
                o = v;
                z = a(z, y, w, v, A[t + 0], 7, -680876936);
                v = a(v, z, y, w, A[t + 1], 12, -389564586);
                w = a(w, v, z, y, A[t + 2], 17, 606105819);
                y = a(y, w, v, z, A[t + 3], 22, -1044525330);
                z = a(z, y, w, v, A[t + 4], 7, -176418897);
                v = a(v, z, y, w, A[t + 5], 12, 1200080426);
                w = a(w, v, z, y, A[t + 6], 17, -1473231341);
                y = a(y, w, v, z, A[t + 7], 22, -45705983);
                z = a(z, y, w, v, A[t + 8], 7, 1770035416);
                v = a(v, z, y, w, A[t + 9], 12, -1958414417);
                w = a(w, v, z, y, A[t + 10], 17, -42063);
                y = a(y, w, v, z, A[t + 11], 22, -1990404162);
                z = a(z, y, w, v, A[t + 12], 7, 1804603682);
                v = a(v, z, y, w, A[t + 13], 12, -40341101);
                w = a(w, v, z, y, A[t + 14], 17, -1502002290);
                y = a(y, w, v, z, A[t + 15], 22, 1236535329);
                z = h(z, y, w, v, A[t + 1], 5, -165796510);
                v = h(v, z, y, w, A[t + 6], 9, -1069501632);
                w = h(w, v, z, y, A[t + 11], 14, 643717713);
                y = h(y, w, v, z, A[t + 0], 20, -373897302);
                z = h(z, y, w, v, A[t + 5], 5, -701558691);
                v = h(v, z, y, w, A[t + 10], 9, 38016083);
                w = h(w, v, z, y, A[t + 15], 14, -660478335);
                y = h(y, w, v, z, A[t + 4], 20, -405537848);
                z = h(z, y, w, v, A[t + 9], 5, 568446438);
                v = h(v, z, y, w, A[t + 14], 9, -1019803690);
                w = h(w, v, z, y, A[t + 3], 14, -187363961);
                y = h(y, w, v, z, A[t + 8], 20, 1163531501);
                z = h(z, y, w, v, A[t + 13], 5, -1444681467);
                v = h(v, z, y, w, A[t + 2], 9, -51403784);
                w = h(w, v, z, y, A[t + 7], 14, 1735328473);
                y = h(y, w, v, z, A[t + 12], 20, -1926607734);
                z = c(z, y, w, v, A[t + 5], 4, -378558);
                v = c(v, z, y, w, A[t + 8], 11, -2022574463);
                w = c(w, v, z, y, A[t + 11], 16, 1839030562);
                y = c(y, w, v, z, A[t + 14], 23, -35309556);
                z = c(z, y, w, v, A[t + 1], 4, -1530992060);
                v = c(v, z, y, w, A[t + 4], 11, 1272893353);
                w = c(w, v, z, y, A[t + 7], 16, -155497632);
                y = c(y, w, v, z, A[t + 10], 23, -1094730640);
                z = c(z, y, w, v, A[t + 13], 4, 681279174);
                v = c(v, z, y, w, A[t + 0], 11, -358537222);
                w = c(w, v, z, y, A[t + 3], 16, -722521979);
                y = c(y, w, v, z, A[t + 6], 23, 76029189);
                z = c(z, y, w, v, A[t + 9], 4, -640364487);
                v = c(v, z, y, w, A[t + 12], 11, -421815835);
                w = c(w, v, z, y, A[t + 15], 16, 530742520);
                y = c(y, w, v, z, A[t + 2], 23, -995338651);
                z = m(z, y, w, v, A[t + 0], 6, -198630844);
                v = m(v, z, y, w, A[t + 7], 10, 1126891415);
                w = m(w, v, z, y, A[t + 14], 15, -1416354905);
                y = m(y, w, v, z, A[t + 5], 21, -57434055);
                z = m(z, y, w, v, A[t + 12], 6, 1700485571);
                v = m(v, z, y, w, A[t + 3], 10, -1894986606);
                w = m(w, v, z, y, A[t + 10], 15, -1051523);
                y = m(y, w, v, z, A[t + 1], 21, -2054922799);
                z = m(z, y, w, v, A[t + 8], 6, 1873313359);
                v = m(v, z, y, w, A[t + 15], 10, -30611744);
                w = m(w, v, z, y, A[t + 6], 15, -1560198380);
                y = m(y, w, v, z, A[t + 13], 21, 1309151649);
                z = m(z, y, w, v, A[t + 4], 6, -145523070);
                v = m(v, z, y, w, A[t + 11], 10, -1120210379);
                w = m(w, v, z, y, A[t + 2], 15, 718787259);
                y = m(y, w, v, z, A[t + 9], 21, -343485551);
                z = j(z, r);
                y = j(y, q);
                w = j(w, p);
                v = j(v, o)
            }
            return [z, y, w, v]
        }, f  = function(r) {
            var q = "", s = -1, p = r.length, o, t;
            while (++s < p) {
                o = r.charCodeAt(s);
                t = s + 1 < p ? r.charCodeAt(s + 1) : 0;
                if (55296 <= o && o <= 56319 && 56320 <= t && t <= 57343) {
                    o = 65536 + ((o & 1023) << 10) + (t & 1023);
                    s++
                }
                if (o <= 127) {
                    q += String.fromCharCode(o)
                } else {
                    if (o <= 2047) {
                        q += String.fromCharCode(192 | ((o >>> 6) & 31), 128 | (o & 63))
                    } else {
                        if (o <= 65535) {
                            q += String.fromCharCode(224 | ((o >>> 12) & 15), 128 | ((o >>> 6) & 63), 128 | (o & 63))
                        } else {
                            if (o <= 2097151) {
                                q += String.fromCharCode(240 | ((o >>> 18) & 7), 128 | ((o >>> 12) & 63), 128 | ((o >>> 6) & 63), 128 | (o & 63))
                            }
                        }
                    }
                }
            }
            return q
        }, e  = function(p) {
            var o = Array(p.length >> 2), r, q;
            for (r = 0, q = o.length; r < q; r++) {
                o[r] = 0
            }
            for (r = 0, q = p.length * 8; r < q; r += 8) {
                o[r >> 5] |= (p.charCodeAt(r / 8) & 255) << (r % 32)
            }
            return o
        }, l  = function(p) {
            var o = "";
            for (var r = 0, q = p.length * 32; r < q; r += 8) {
                o += String.fromCharCode((p[r >> 5] >>> (r % 32)) & 255)
            }
            return o
        }, d  = function(o) {
            return l(b(e(o), o.length * 8))
        }, i  = function(q) {
            var t = "0123456789abcdef", p = "", o;
            for (var s = 0, r = q.length; s < r; s++) {
                o = q.charCodeAt(s);
                p += t.charAt((o >>> 4) & 15) + t.charAt(o & 15)
            }
            return p
        };
        return i(d(f(n)))
    }
