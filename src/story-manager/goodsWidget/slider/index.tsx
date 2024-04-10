import React, {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEventHandler,
  TouchEventHandler,
  useEffect,
  useRef,
  useState,
  Children
} from 'react';

import "./index.scss";
import classNames from "classnames";
import {Simulate} from "react-dom/test-utils";
import {getTranslateValues} from '~/src/stories_widget/util/css';
import {executeTransition} from "~/src/stories_widget/util/animation";

interface ISliderProps extends HTMLAttributes<HTMLDivElement> {
  // /** Текст внутри кнопки */
  // text: string,
  // /** Тип кнопки, извлеченный из перечисления ButtonTypes */
  // type: ButtonTypes,
  // /** Функция, выполняемая после нажатия кнопки */
  // action: () => void

}

const Slider: React.FC<ISliderProps> = (props) => {

  const sliderRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  let maxScrollLeftRef = useRef(0);
  let leftRef = useRef(0);
  let cardWidth: Optional<number>; // all width / cards cnt

  const updateLeftRef = () => {
    if (itemsRef.current) {
      leftRef.current = -1 * getTranslateValues(itemsRef.current).x;
    }
  };


  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const pauseUIRef = useRef(false);

  const getItemWidth = () => {
    const childCnt = Children.count(props.children);
    if (itemsRef.current && childCnt) {
      return itemsRef.current.scrollWidth / childCnt;
    }
    return 0;
  };

  let supportsTouch = false;
  useEffect(() => {

    if ('ontouchstart' in window) {
      supportsTouch = true;
    } else if ((window.navigator as any).msPointerEnabled) {
      supportsTouch = true;
    } else if ('ontouchstart' in document.documentElement) {
      supportsTouch = true;
    }


    if (!supportsTouch) {
      // здесь без gap
      if (itemsRef.current) {
        // считать как width / count
        cardWidth = (itemsRef.current.children[0] as HTMLElement)?.offsetWidth;
      }

      if (itemsRef.current) {
        maxScrollLeftRef.current = itemsRef.current.scrollWidth - itemsRef.current.clientWidth;
        // leftRef.current = itemsRef.current.scrollLeft;
        updateLeftRef();
      }

      if (maxScrollLeftRef.current === leftRef.current) {
        setShowRight(false);
      } else {
        setShowRight(true);
      }
      if (leftRef.current === 0) {
        setShowLeft(false);
      } else {
        setShowLeft(true);
      }

      /*if(options.scrolling){

        element.bind("DOMMouseScroll mousewheel", function (event) {
          var oEvent = event.originalEvent,
            direction = oEvent.detail ? oEvent.detail * -amount : oEvent.wheelDelta,
            position = element.scrollLeft();
          position += direction > 0 ? -amount : amount;

          $(this).scrollLeft(position);
          event.preventDefault();
          maxScrollLeft = element.get(0).scrollWidth - element.get(0).clientWidth;
          left = element.scrollLeft();
          if(maxScrollLeft == left) {
            rightElem.fadeOut(200);
          } else {
            rightElem.fadeIn(200);
          }
          if(left == 0) {
            leftElem.fadeOut(200);
          } else {
            leftElem.fadeIn(200);
          }

        });
      }*/


      // $(window).on('resize', function(){
      //   element.each( function(){
      //     elements = $(this);
      //     maxScrollLeft = elements.get(0).scrollWidth - elements.get(0).clientWidth;
      //     left = elements.scrollLeft();
      //     if(maxScrollLeft == left) {
      //       rightElem.fadeOut(200);
      //     } else {
      //       rightElem.fadeIn(200);
      //     }
      //     if(left == 0) {
      //       leftElem.fadeOut(200);
      //     } else {
      //       leftElem.fadeIn(200);
      //     }
      //   });
      // });


      // $(document).on("mouseup mousedown click", ".nonclick a", function(e){  //prevent clicking while moving
      //   e.preventDefault();
      // });


    }

    return () => {
      // document.removeEventListener('mouseup', mouseUpHandler);
    }

  }, []);

  let clickDownRef = useRef(false);
  let pageXRef = useRef(0);
  let newPageX = 0;
  let oldPageX = 0;

  const handleMouseDown: MouseEventHandler = e => {
    if (pauseUIRef.current) return;
    e.preventDefault();
    clickDownRef.current = true;
    pageXRef.current = e.pageX;
    if (itemsRef.current) {
      maxScrollLeftRef.current = itemsRef.current.scrollWidth - itemsRef.current.clientWidth;
    }
    if (itemsRef.current) {
      // leftRef.current = itemsRef.current.scrollLeft;
      updateLeftRef();

      // itemsRef.current.style.setProperty('cursor', 'grabbing');
    }
    // document.body.style.setProperty('cursor', 'grabbing');
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const handleTouchStart: TouchEventHandler = e => {
    if (pauseUIRef.current) return;
    e.preventDefault();
    clickDownRef.current = true;
    pageXRef.current = e.touches && e.touches[0].pageX;
    if (itemsRef.current) {
      maxScrollLeftRef.current = itemsRef.current.scrollWidth - itemsRef.current.clientWidth;
    }
    if (itemsRef.current) {
      // leftRef.current = itemsRef.current.scrollLeft;
      updateLeftRef();

      // itemsRef.current.style.setProperty('cursor', 'grabbing');
    }
    // document.body.style.setProperty('cursor', 'grabbing');

    document.addEventListener('touchmove', mouseMoveHandler);
    document.addEventListener('touchend', mouseUpHandler);
  };


  const nonClickRef = useRef(false);

  const [scrollLeft, setScrollLeft] = useState(0);

  const setScrollLeftSafe = (scrollLeft: number) => {
    if (scrollLeft < 0) {
      scrollLeft = 0;
    }
    if (scrollLeft > maxScrollLeftRef.current) {
      scrollLeft = maxScrollLeftRef.current;
    }
    setScrollLeft(scrollLeft);
  };

  useEffect(() => {

    if (scrollLeft === maxScrollLeftRef.current) {
      setShowRight(false);
    } else {
      setShowRight(true);
    }

    if (scrollLeft === 0) {
      setShowLeft(false);
    } else {
      setShowLeft(true);
    }


    //
    // if (maxScrollLeft === oldXRef.current) {
    //   // rightElem.fadeOut(200);
    //   setShowRight(false);
    // } else {
    //   setShowRight(true);
    //   // rightElem.fadeIn(200);
    // }
    // if (oldXRef.current === 0) {
    //   setShowLeft(false);
    //   // leftElem.fadeOut(200);
    // } else {
    //   setShowLeft(true);
    //   // leftElem.fadeIn(200);
    // }

    // if (itemsRef.current) {
    //   itemsRef.current.scrollLeft = scrollLeft;
    // }
  }, [scrollLeft]);

  const mouseMoveHandler = (e: MouseEvent | TouchEvent) => {
    if (pauseUIRef.current) return;
    if (clickDownRef.current) {
      const valX = e instanceof MouseEvent ? e.pageX : (e.touches && e.touches[0].pageX);
      if (valX !== pageXRef.current) {
        nonClickRef.current = true;

        newPageX = valX;

        const cursorDiff = pageXRef.current - newPageX;
        let diff = leftRef.current + cursorDiff;
        // console.log({diff, cursorDiff, maxScrollLeft});
        setScrollLeftSafe(diff);
      }
    } else {
      nonClickRef.current = false;
    }
  };

  const mouseUpHandler = (e: MouseEvent | TouchEvent) => {
    if (nonClickRef.current) {
      e.preventDefault();
      console.log('prevent')
    }
    setTimeout(() => {
      nonClickRef.current = false;
    });

    clickDownRef.current = false;

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);

    document.removeEventListener('touchmove', mouseMoveHandler);
    document.removeEventListener('touchend', mouseUpHandler);

    // document.body.style.removeProperty('cursor');
  };

  const handleClick: MouseEventHandler = e => {
    if (nonClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const handleArrowLeftClick: MouseEventHandler = async (e) => {
    if (pauseUIRef.current) return;
    updateLeftRef();
    let diff = leftRef.current - getItemWidth();
    setScrollLeftSafe(diff);
    pauseUIRef.current = true;
    if (itemsRef.current) {
      await executeTransition(itemsRef.current, 'transform', 300);
    }
    pauseUIRef.current = false;
  };

  const handleArrowRightClick: MouseEventHandler = async (e) => {
    if (pauseUIRef.current) return;
    updateLeftRef();
    let diff = leftRef.current + getItemWidth();
    setScrollLeftSafe(diff);
    pauseUIRef.current = true;
    if (itemsRef.current) {
      await executeTransition(itemsRef.current, 'transform', 300);
    }
    pauseUIRef.current = false;
  };


  return (
    <>
      <div style={{position: "relative"}}>
        <div className={classNames("g-scrolling-carousel")} ref={sliderRef} onMouseDown={handleMouseDown}
             onTouchStart={handleTouchStart} onClickCapture={handleClick}>
          <div className="items" ref={itemsRef} style={{transform: `translateX(${-1 * scrollLeft}px)`}}>
            {props.children}
          </div>
        </div>
        {!supportsTouch && <>
          <span className={classNames("jc-left", {show: showLeft})} onClick={handleArrowLeftClick}>
            <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </span>
          <span className={classNames("jc-right", {show: showRight})} onClick={handleArrowRightClick}>
            <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </span>
        </>}
      </div>
    </>);

};

export {Slider};