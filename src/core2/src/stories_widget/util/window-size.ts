export function _winWidth(): number {
    let width = null;
    try {
        width = window.parent?.innerWidth || window.innerWidth
            || window.parent?.document?.documentElement?.clientWidth || window.parent?.document?.body?.clientWidth;
    } catch (e) {
        console.error(e);
    }
    return width || window.document?.documentElement?.clientWidth || window.document?.body?.clientWidth;
}

export function _winHeight(): number {
    let height = null;
    try {
        height = window.parent?.innerHeight || window?.innerHeight ||
            window.parent?.document?.documentElement?.clientHeight;
    } catch (e) {
        console.error(e);
    }
    return height || window?.document?.documentElement?.clientHeight;
}