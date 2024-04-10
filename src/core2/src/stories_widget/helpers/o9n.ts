'use strict';

export enum SCREEN_ORIENTATIONS {
  LANDSCAPE_PRIMARY = 'landscape-primary',
  LANDSCAPE_SECONDARY = 'landscape-secondary',
  PORTRAIT_PRIMARY = 'portrait-primary',
  PORTRAIT_SECONDARY = 'portrait-secondary',
}

export function getOrientation() {
  if (!window) return undefined;
  var screen = window.screen;
  var orientation;

  // W3C spec implementation
  if (
    typeof window.ScreenOrientation === 'function' &&
    screen.orientation instanceof ScreenOrientation &&
    typeof screen.orientation.addEventListener == 'function' &&
    screen.orientation.onchange === null &&
    typeof screen.orientation.type === 'string'
  ) {
    orientation = screen.orientation;
  } else {
    orientation = createOrientation();
  }

  return orientation;
}

export function install() {
  const screen = window.screen;
  if (typeof window.ScreenOrientation === 'function' &&
    screen.orientation instanceof ScreenOrientation) {
    return screen.orientation;
  }

  const orientation = getOrientation();
  (<any>window.screen).orientation = orientation;
  return orientation;
}


function createOrientation() {
  var orientationMap = {
    '90': SCREEN_ORIENTATIONS.LANDSCAPE_PRIMARY,
    '-90': SCREEN_ORIENTATIONS.LANDSCAPE_SECONDARY,
    '0': SCREEN_ORIENTATIONS.PORTRAIT_PRIMARY,
    '180': SCREEN_ORIENTATIONS.PORTRAIT_SECONDARY
  };

  function ScreenOrientation() {
  }

  // @ts-ignore
  const or = new ScreenOrientation();

  const found = findDelegate(or);

  ScreenOrientation.prototype.addEventListener = delegate('addEventListener', found.delegate, found.event);
  ScreenOrientation.prototype.dispatchEvent = delegate('dispatchEvent', found.delegate, found.event);
  ScreenOrientation.prototype.removeEventListener = delegate('removeEventListener', found.delegate, found.event);
  ScreenOrientation.prototype.lock = getLock();
  ScreenOrientation.prototype.unlock = getUnlock();


  Object.defineProperties(or, {
    onchange: {
      get: function () {
        return found.delegate['on' + found.event] || null;
      },
      set: function (cb) {
        found.delegate['on' + found.event] = wrapCallback(cb, or);
      }
    },
    type: {
      get: function () {
        var screen = window.screen;
        // @ts-ignore
        return screen.msOrientation || screen.mozOrientation ||
          // @ts-ignore
          orientationMap[window.orientation + ''] ||
          // @ts-ignore
          (getMql().matches ? 'landscape-primary' : 'portrait-primary');
      }
    },
    angle: {
      value: 0
    }
  });

  return or;
}

function delegate(fnName: string, delegateContext: any, eventName: string) {
  // @ts-ignore
  var that = this;
  return function delegated() {
    var args = Array.prototype.slice.call(arguments);
    var actualEvent = args[0].type ? args[0].type : args[0];
    if (actualEvent !== 'change') {
      return;
    }
    if (args[0].type) {
      args[0] = getOrientationChangeEvent(eventName, args[0]);
    } else {
      args[0] = eventName;
    }
    var wrapped = wrapCallback(args[1], that);
    if (fnName === 'addEventListener') {
      addTrackedListener(args[1], wrapped);
    }
    if (fnName === 'removeEventListener') {
      removeTrackedListener(args[1]);
    }
    args[1] = wrapped;
    return delegateContext[fnName].apply(delegateContext, args);
  };
}

var trackedListeners: Dict = [];
var originalListeners: Dict = [];

function addTrackedListener(original: Function, wrapped: Function) {
  var idx = originalListeners.indexOf(original);
  if (idx > -1) {
    trackedListeners[idx] = wrapped;
  } else {
    originalListeners.push(original);
    trackedListeners.push(wrapped);
  }
}

function removeTrackedListener(original: Function) {
  var idx = originalListeners.indexOf(original);
  if (idx > -1) {
    originalListeners.splice(idx, 1);
    trackedListeners.splice(idx, 1);
  }
}

function wrapCallback(cb: Function, orientation: any) {
  var idx = originalListeners.indexOf(cb);
  if (idx > -1) {
    return trackedListeners[idx];
  }
  return function wrapped(evt: Event) {
    if (evt.target !== orientation) {
      defineValue(evt, 'target', orientation);
    }
    if (evt.currentTarget !== orientation) {
      defineValue(evt, 'currentTarget', orientation);
    }
    if (evt.type !== 'change') {
      defineValue(evt, 'type', 'change');
    }
    cb(evt);
  };
}

function getLock() {
  var err = 'lockOrientation() is not available on this device.';
  var delegateFn: Function;
  var screen = window.screen;
  if (screen === undefined) {
    delegateFn = function () {
      return false;
    };
    // @ts-ignore
  } else if (typeof screen.msLockOrientation == 'function') {
    // @ts-ignore
    delegateFn = screen.msLockOrientation.bind(screen);
    // @ts-ignore
  } else if (typeof screen.mozLockOrientation == 'function') {
    // @ts-ignore
    delegateFn = screen.mozLockOrientation.bind(screen);
  } else {
    delegateFn = function () {
      return false;
    };
  }

  return function lock(lockType: string) {
    const Promise = window.Promise;
    // @ts-ignore
    if (delegateFn(lockType)) {
      return Promise.resolve(lockType);
    } else {
      return Promise.reject(new Error(err));
    }
  };
}

function getUnlock() {
  var screen = window.screen;
  return screen && screen.orientation && screen.orientation.unlock.bind(screen.orientation) ||
    // @ts-ignore
    screen.msUnlockOrientation && screen.msUnlockOrientation.bind(screen) ||
    // @ts-ignore
    screen.mozUnlockOrientation && screen.mozUnlockOrientation.bind(screen) ||
    function unlock() {
      return;
    };
}

function findDelegate(orientation: ScreenOrientation) {
  const events = ['orientationchange', 'mozorientationchange', 'msorientationchange'];
  const screen = window.screen;

  for (let i = 0; i < events.length; i++) {
    // @ts-ignore
    if (screen['on' + events[i]] === null) {
      return {
        delegate: screen,
        event: events[i]
      };
    }
  }

  if (typeof window.onorientationchange != 'undefined') {
    return {
      delegate: window,
      event: 'orientationchange'
    };
  }

  return {
    delegate: createOwnDelegate(orientation),
    event: 'change'
  };
}

function getOrientationChangeEvent(name: string, props?: EventInit) {
  var orientationChangeEvt;

  try {
    orientationChangeEvt = new Event(name, props);
  } catch (e) {
    orientationChangeEvt = {type: 'change'};
  }
  return orientationChangeEvt;
}

function createOwnDelegate(orientation: ScreenOrientation) {
  var ownDelegate = Object.create({
    addEventListener: function addEventListener(evt: string, cb: Function) {
      // @ts-ignore
      if (!this.listeners[evt]) {
        // @ts-ignore
        this.listeners[evt] = [];
      }
      // @ts-ignore
      if (this.listeners[evt].indexOf(cb) === -1) {
        // @ts-ignore
        this.listeners[evt].push(cb);
      }
    },
    dispatchEvent: function dispatchEvent(evt: Event) {
      // @ts-ignore
      if (!this.listeners[evt.type]) {
        return;
      }
      // @ts-ignore
      this.listeners[evt.type].forEach(function (fn: Function) {
        fn(evt);
      });
      if (typeof orientation.onchange == 'function') {
        orientation.onchange(evt);
      }
    },
    removeEventListener: function removeEventListener(evt: string, cb: Function) {
      // @ts-ignore
      if (!this.listeners[evt]) {
        return;
      }
      // @ts-ignore
      var idx = this.listeners[evt].indexOf(cb);
      if (idx > -1) {
        // @ts-ignore
        this.listeners[evt].splice(idx, 1);
      }
    },
  });

  ownDelegate.listeners = {};

  var mql = getMql();

  // @ts-ignore
  if (mql && typeof mql.matches === 'boolean') {
    // @ts-ignore
    mql.addListener(function () {
      ownDelegate.dispatchEvent(getOrientationChangeEvent('change'));
    });
  }

  return ownDelegate;
}

function getMql() {
  if (typeof window.matchMedia != 'function') {
    return {};
  }
  return window.matchMedia('(orientation: landscape)');
}

function defineValue<T>(obj: T, key: PropertyKey, val: any) {
  Object.defineProperty(obj, key, {
    value: val
  });
}
