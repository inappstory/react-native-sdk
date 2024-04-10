import u from '../util/event'
import {getTranslateValues} from '../util/css'
import {isNumber} from "../../helpers/isNumber";

const POINTER_START_EVENTS = ['mousedown', 'touchstart']
const POINTER_MOVE_EVENTS = ['mousemove', 'touchmove']
const POINTER_END_EVENTS = ['mouseup', 'touchend']

const api = function () {
  let currentPosition = {
    x: 0, y: 0, z: 0
  };
  let isDragging = false

  const scrollTo = function (vnode, diffX, diffY) {
    const target = vnode.elm;
    if (!isDragging) {
      isDragging = true;
      target.style.transition = 'transform 300ms';
      setTimeout(_ => {
        target.style.transition = '';
        isDragging = false;
      }, 300);
      scrollToImm(vnode, diffX, diffY);
    }
  }

  const scrollToImm = function (vnode, diffX, diffY) {
    const target = vnode.elm;
    diffX = parseFloat(diffX);
    diffY = parseFloat(diffY);
    if (isNumber(diffX) && !isNaN(diffX)) {
      currentPosition.x = parseFloat(currentPosition.x) + diffX;
    }
    if (isNumber(diffY) && !isNaN(diffY)) {
      currentPosition.y = parseFloat(currentPosition.y) + diffY;
    }

    if (currentPosition.x >= 0) {
      currentPosition.x = 0;
    }
    if (((-1 * currentPosition.x) + target.clientWidth) >= target.scrollWidth) {
      currentPosition.x = -1 * (target.scrollWidth - target.clientWidth);
    }

    target.style.transform = `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0px)`;

    u.emitEvent(vnode, 'dragscrollend', currentPosition)
  }

  const init = function (el, binding, vnode) {
    // Default parameters
    let target = el // the element to apply the dragscroll on
    let active = true // enable/disable
    // let dragscroll
    let container = window

    let positionX = 0;
    let positionY = 0;

    // config type: boolean
    // Example: v-dragscroll="true" or v-dragscroll="false"
    if (typeof binding.value === 'boolean') {
      active = binding.value
    } else if (typeof binding.value === 'object') {
      // config type: object
      // Example: v-dragscroll="{ active: true , target: "child" }"

      // parameter: target
      if (typeof binding.value.target === 'string') {
        target = el.querySelector(binding.value.target)
        if (!target) {
          console.error('There is no element with the current target value.')
        }
      } else if (typeof binding.value.target !== 'undefined') {
        console.error('The parameter "target" should be either \'undefined\' or \'string\'.')
      }
      // parameter: container
      if (typeof binding.value.container === 'string') {
        container = document.querySelector(binding.value.container)
        if (!container) {
          console.error('There is no element with the current container value.')
        }
      } else if (typeof binding.value.container !== 'undefined') {
        console.error('The parameter "container" should be be either \'undefined\' or \'string\'.')
      }

      // parameter: active
      if (typeof binding.value.active === 'boolean') {
        active = binding.value.active
      } else if (typeof binding.value.active !== 'undefined') {
        console.error('The parameter "active" value should be either \'undefined\', \'true\' or \'false\'.')
      }

      // parameter: positionX
      if (typeof binding.value.positionX === 'number') {
        positionX = binding.value.positionX
      } else if (typeof binding.value.positionX !== 'undefined') {
        console.error('The parameter "positionX" value should be either \'undefined\', \'number\'.')
      }
      // parameter: positionY
      if (typeof binding.value.positionY === 'number') {
        positionY = binding.value.positionY
      } else if (typeof binding.value.positionY !== 'undefined') {
        console.error('The parameter "positionY" value should be either \'undefined\', \'number\'.')
      }

    } else if (typeof binding.value !== 'undefined') {
      // Throw an error if invalid parameters
      console.error('The passed value should be either \'undefined\', \'true\' or \'false\' or \'object\'.')
    }


    var scrollBy = function (x, y) {

      if (container === window) {
        window.scrollBy(x, y)
      } else {
        container.scrollLeft += x
        container.scrollTop += y
      }
    }

    var reset = function () {
      let lastClientX, lastClientY, pushed;
      let startClientX;
      let startClientY;
      const tresshold = 1;

      target.md = function (e) {
        // e.preventDefault()
        const isMouseEvent = e instanceof window.MouseEvent
        // The coordinates of the mouse pointer compared to the page when the mouse button is clicked on an element
        const pageX = isMouseEvent ? e.pageX : e.touches[0].pageX
        const pageY = isMouseEvent ? e.pageY : e.touches[0].pageY
        const clickedElement = document.elementFromPoint(pageX - window.pageXOffset, pageY - window.pageYOffset)

        const hasNoChildDrag = binding.arg === 'nochilddrag'
        const ignoreLeft = binding.modifiers.noleft
        const ignoreRight = binding.modifiers.noright
        const ignoreMiddle = binding.modifiers.nomiddle
        const ignoreBack = binding.modifiers.noback
        const ignoreForward = binding.modifiers.noforward
        const hasFirstChildDrag = binding.arg === 'firstchilddrag'
        const isEl = clickedElement === target
        const isFirstChild = clickedElement === target.firstChild
        const isDataDraggable = hasNoChildDrag ? typeof clickedElement.dataset.dragscroll !== 'undefined' : typeof clickedElement.dataset.noDragscroll === 'undefined'

        if (!isEl && (!isDataDraggable || (hasFirstChildDrag && !isFirstChild))) {
          return
        }

        if (e.which === 1 && ignoreLeft) {
          return
        } else if (e.which === 2 && ignoreMiddle) {
          return
        } else if (e.which === 3 && ignoreRight) {
          return
        } else if (e.which === 4 && ignoreBack) {
          return
        } else if (e.which === 5 && ignoreForward) {
          return
        }

        pushed = 1
        // The coordinates of the mouse pointer compared to the viewport when the mouse button is clicked on an element
        lastClientX = isMouseEvent ? e.clientX : e.touches[0].clientX;
        lastClientY = isMouseEvent ? e.clientY : e.touches[0].clientY;

        startClientX = lastClientX;
        startClientY = lastClientY;

        u.addEventListeners(window, POINTER_END_EVENTS, target.mu);
        u.addEventListeners(window, POINTER_MOVE_EVENTS, target.mm);

      }

      target.mu = function (e) {
        pushed = 0;
        if (isDragging) {
          u.emitEvent(vnode, 'dragscrollend', {...currentPosition, mouseup: true});
        }
        isDragging = false;

        u.removeEventListeners(window, POINTER_END_EVENTS, target.mu);
        u.removeEventListeners(window, POINTER_MOVE_EVENTS, target.mm);
      }

      target.mm = function (e) {
        const isMouseEvent = e instanceof window.MouseEvent;
        let newScrollX, newScrollY;
        const eventDetail = {};
        if (pushed) {
          e.preventDefault();

          // get new scroll dimentions
          newScrollX = (-lastClientX + (lastClientX = isMouseEvent ? e.clientX : e.touches[0].clientX));
          newScrollY = (-lastClientY + (lastClientY = isMouseEvent ? e.clientY : e.touches[0].clientY));

          if (!isDragging) {
            if (Math.abs(startClientX - lastClientX) >= tresshold || Math.abs(startClientY - lastClientY) >= tresshold) {
              // Emit start event
              if (!isDragging) {
                u.emitEvent(vnode, 'dragscrollstart', {});
              }
              isDragging = true;
            }
          }

          // when we reach the end or the begining of X or Y
          // reach left side end
          if (currentPosition.x >= 0 && newScrollX > 0) {
            newScrollX = 0;
          }
          if (((-1 * currentPosition.x) + target.clientWidth) >= target.scrollWidth && newScrollX < 0) {
            newScrollX = 0;
          }

          const isEndX = (((-1 * currentPosition.x) + target.clientWidth) >= target.scrollWidth) || currentPosition.x === 0;
          const isEndY = (((-1 * currentPosition.y) + target.clientHeight) >= target.scrollHeight) || currentPosition.y === 0;

          if (binding.modifiers.pass) {
            // compute and scroll
            target.scrollLeft -= binding.modifiers.y ? -0 : newScrollX;
            target.scrollTop -= binding.modifiers.x ? -0 : newScrollY;
            if (target === document.body) {
              target.scrollLeft -= binding.modifiers.y ? -0 : newScrollX;
              target.scrollTop -= binding.modifiers.x ? -0 : newScrollY;
            }

            // if one side reach the end scroll container
            if (isEndX || binding.modifiers.y) {
              scrollBy(-newScrollX, 0);
            }
            if (isEndY || binding.modifiers.x) {
              scrollBy(0, -newScrollY);
            }
          } else {
            // disable one scroll direction in case x or y is specified
            if (binding.modifiers.x) newScrollY = -0;
            if (binding.modifiers.y) newScrollX = -0;

            // compute and scroll
            scrollToImm(vnode, newScrollX, newScrollY);

            // target.scrollLeft -= newScrollX
            // target.scrollTop -= newScrollY
            // if (target === document.body) {
            //     target.scrollLeft -= newScrollX
            //     target.scrollTop -= newScrollY
            // }


          }

          // Emit events
          eventDetail.deltaX = -newScrollX
          eventDetail.deltaY = -newScrollY
          u.emitEvent(vnode, 'dragscrollmove', eventDetail)
        }
      }

      u.addEventListeners(target, POINTER_START_EVENTS, target.md)


    }

    target.style.overflow = 'visible'

    currentPosition = getTranslateValues(target);

    // scrollTo(target, positionX, positionY);

    // if value is undefined or true we will init
    if (active) {
      if (document.readyState === 'complete') {
        reset()
      } else {
        window.addEventListener('load', reset)
      }
    } else {
      // if value is false means we disable
      // window.removeEventListener('load', reset)
      u.removeEventListeners(target, POINTER_START_EVENTS, target.md)
      u.removeEventListeners(window, POINTER_END_EVENTS, target.mu)
      u.removeEventListeners(window, POINTER_MOVE_EVENTS, target.mm)
    }
  }
  return {
    currentPosition, init, scrollTo
  };
}();


const exported = {
  inserted: function (el, binding, vnode) {
    api.init(el, binding, vnode)
  },
  update: function (el, binding, vnode, oldVnode) {

    // update the component only if the parameters change
    // каждый раз вешает еще слушателей
    // if (JSON.stringify(binding.value) !== JSON.stringify(binding.oldValue)) {
    //     api.init(el, binding, vnode)
    // }
    // update scrollPosition
    if (typeof binding.value === 'object') {
      if (binding.value.positionX !== undefined) {
        const positionX = parseFloat(binding.value.positionX);
        const positionY = parseFloat(binding.value.positionY);
        api.scrollTo(vnode, positionX, positionY)
      }
    }


  },
  unbind: function (el, binding, vnode) {
    const target = el
    u.removeEventListeners(target, POINTER_START_EVENTS, target.md)
    u.removeEventListeners(window, POINTER_END_EVENTS, target.mu)
    u.removeEventListeners(window, POINTER_MOVE_EVENTS, target.mm)
  }
};

export {exported as dragscroll}
