export default class ScrollbarHelper {

    constructor(readonly window: Window) {

    }

    get width() {
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
        const documentWidth = this.window.document.documentElement.clientWidth;
        return Math.abs(this.window.innerWidth - documentWidth);
    }

    setScrollbar(width = this.width) {
        this._disableOverFlow();
        this._setElementAttributes('body', 'paddingRight', (calculatedValue: number) => calculatedValue + width);
    }

    _disableOverFlow() {
        const actualValue = this.window.document.body.style.overflow
        if (actualValue) {
            this.window.document.body.dataset['overflow'] = actualValue;
        }
        this.window.document.body.style.overflow = 'hidden'
    }


    _setElementAttributes(selector: string, styleProp: string, callback: (calculatedValue: number) => number) {
        const scrollbarWidth = this.width;
        this.window.document.querySelectorAll<HTMLElement>(selector)
            .forEach(element => {
                if (element !== this.window.document.body && this.window.innerWidth > element.clientWidth + scrollbarWidth) {
                    return;
                }

                const actualValue = (<any>element.style)[styleProp]
                const calculatedValue = (<any>this.window.getComputedStyle(element))[styleProp]

                element.dataset[styleProp] = actualValue;

                (<any>element.style)[styleProp] = `${callback(Number.parseFloat(calculatedValue))}px`
            })
    }


    resetScrollbar() {
        this._resetElementAttributes('body', 'overflow');
        this._resetElementAttributes('body', 'paddingRight');
    }

    _resetElementAttributes(selector: string, styleProp: string) {
        this.window.document.querySelectorAll<HTMLElement>(selector).forEach(element => {
            const value = element.dataset[styleProp];
            if (typeof value === 'undefined') {
                (<any>element.style).removeProperty(styleProp);
            } else {
                delete element.dataset[styleProp];
                (<any>element.style)[styleProp] = value;
            }
        })
    }



}

