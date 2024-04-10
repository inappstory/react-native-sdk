const methods = {
    addEventListeners (el, events, handler) {
        for (var i = 0, len = events.length; i < len; i++) {
            el.addEventListener(events[i], handler, { passive: false })
        }
    },

    removeEventListeners (el, events, handler) {
        for (var i = 0, len = events.length; i < len; i++) {
            el.removeEventListener(events[i], handler, { passive: false })
        }
    },

    emitEvent: function (vnode, eventName, eventDetail) {
        // If vnode is a Vue component instance, use $emit. Otherwise use a native HTML event.
        if (vnode.componentInstance) {
            vnode.componentInstance.$emit(eventName, eventDetail)
        } else {
            let event
            if (typeof (window.CustomEvent) === 'function') {
                event = new window.CustomEvent(eventName, { detail: eventDetail })
            } else {
                // Deprecated fallback for IE
                event = document.createEvent('CustomEvent')
                event.initCustomEvent(eventName, true, true, eventDetail)
            }
            vnode.elm.dispatchEvent(event)
        }
    },

    addOnceEventListener: function (
        el,
        eventName,
        cb,
        options
    ) {
        var once = event => {
            cb(event)
            el.removeEventListener(eventName, once, options)
        }

        el.addEventListener(eventName, once, options)
    },

};

export default methods;

const emitEvent = methods.emitEvent;

export {emitEvent}

const addOnceEventListener = methods.addOnceEventListener;
export {addOnceEventListener}