
(function () {
    const requestAnimationFrame = (window as any).requestAnimationFrame || (window as any).mozRequestAnimationFrame ||
      (window as any).webkitRequestAnimationFrame || (window as any).msRequestAnimationFrame;
  (window as any).requestAnimationFrame = requestAnimationFrame;
})();


export interface ForceEndFunc {
    (): boolean;
}

export interface PausedFunc {
    (): boolean;
}

export interface TimingFunc {
    (timeFraction: number): number;
}

export interface DrawFunc {
    (progress: number): void;
}

export interface IAnimateOptions {
    duration: number;
    forceEnd: ForceEndFunc;
    paused: PausedFunc;
    timing: TimingFunc;
    draw: DrawFunc;
}

export function animate(options: IAnimateOptions) {

    let start: number;
    if ("performance" in window == false || "now" in window.performance == false) {
        let nowOffset = Date.now();
        if (performance.timing && performance.timing.navigationStart){
            nowOffset = performance.timing.navigationStart
        }
        start = Date.now() - nowOffset
    } else {
        start = performance.now();
    }

    requestAnimationFrame(function animate(time) {
        // timeFraction от 0 до 1
        let timeFraction: number;
        timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;

        if (options.forceEnd()) {
            timeFraction = 1
        }

        if (!options.paused()) {
            // текущее состояние анимации
            let progress = options.timing(timeFraction);

            options.draw(progress);

            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            }

        }

    });
}


export function transitionEndEventName () {
  let i,
    el = document.createElement('div'),
    transitions = {
      'transition':'transitionend',
      'OTransition':'otransitionend',  // oTransitionEnd in very old Opera
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    };

    // @ts-ignore
  for (i in transitions) {
    // @ts-ignore
    if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
      // @ts-ignore
      return transitions[i];
    }
  }

  return undefined;
}

const transitionEnd = transitionEndEventName();

export function executeTransition(element: HTMLElement, property: string, time: number): Promise<void> {
  return new Promise(resolve => {
    let isDone = false;
    const transitionDone = () => {
      isDone = true;
      clearTimeout(timeOutId);
      if (transitionEnd !== undefined) {
        element.removeEventListener(transitionEnd, transitionEndHandler);
      }
      element.style.setProperty('transition', `${property} 0ms`);
      resolve();
    };

    const transitionEndHandler = (e: TransitionEvent) => {
      if (e.propertyName === property) {
        if (!isDone) {
          transitionDone();
        }
      }
    };

    if (transitionEnd !== undefined) {
      element.addEventListener(transitionEnd, transitionEndHandler, false);
    }
    const timeOutId = setTimeout(() => {
      if (!isDone) {
        transitionDone();
      }
    }, time + 20); // plus a grace period (1+ frame)

    element.style.setProperty('transition', `${property} ${time}ms`);
  });
}
