import {ClickOnButtonPayload, ClickOnSwipeUpPayload} from "~/src/types";
import {AppearanceManager} from "~/src/storyManager/AppearanceManager";
import {StoryManager} from "~/src/storyManager/StoryManager";

import React, {ComponentProps} from 'react';
import ReactDOM from "react-dom";

import {EventEmitter} from "events";
import {GoodsWidgetRenderingType} from "~/src/types/storyManager/goodsWidget";


import {Slider as SliderCarousel} from "~/src/storyManager/goodsWidget/slider";
import _StoryReader from "~/src/storyManager/widget/_StoryReader";
import {isFunction} from "../../helpers/isFunction";


// from appearance
const arrowColor = 'black';
const arrowIcon = <svg width="32" height="12.5" viewBox="0 0 64 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M56.293 1.23375C58.054 -0.41125 60.846 -0.41125 62.607 1.23375C64.464 2.96775 64.464 5.85675 62.607 7.59075L35.157 23.2288C33.396 24.8738 30.604 24.8738 28.843 23.2288L1.393 7.59075C0.494002 6.75175 0 5.62775 0 4.41275C0 3.19775 0.494002 2.07375 1.393 1.23475C3.154 -0.410251 5.946 -0.410251 7.707 1.23475L32 13.9237L56.293 1.23375Z" fill={arrowColor}/>
</svg>;

export class GoodsWidget extends EventEmitter {

  private readonly storyManager!: StoryManager;
  private readonly widgetInitData!: ClickOnButtonPayload;

  private goodsWidgetRoot!: HTMLDivElement;
  private goodsWidget!: HTMLDivElement;
  private topPanel!: HTMLDivElement;
  private closeClickHandler!: (e: Event) => void;
  private readonly translateYInit!: number;
  private readonly goodsWidgetWrapper!: HTMLDivElement;

  private sliderInstance!: Slider;

  constructor(storyManager: StoryManager, appearanceManager: AppearanceManager, storyReaderInstance: _StoryReader, widgetInitData: ClickOnSwipeUpPayload) {
    super();

    this.storyManager = storyManager;
    this.widgetInitData = widgetInitData;

    // если нет sku handler - то ничего не показываем

    // try catch
    const sku: Array<string> = JSON.parse(widgetInitData.url);
    const skuList = sku.map(value => ({sku: value, title: "", subTitle: "", price: "", oldPrice: "", imgSrc: null, rawData: {}}));

    // для всех типов - будет openGoodsWidgetHandler
    // вызов при обновлении - перерендеринга



    const cb = appearanceManager.goodsWidgetOptions.openGoodsWidgetHandler;
    if (cb && isFunction(cb)) {

      // проще async callback
      // this.storyManager.emit('openGoodsWidget', sku);
      // вернуть массив с данными по sku

      const skuFilledPromise = cb(skuList);


      console.log({widgetInitData});


      if (storyReaderInstance.iframe) {


        const goodsWidgetRoot = document.createElement('div');
        goodsWidgetRoot.style.cssText = `position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 2147483646;`;


        const goodsWidgetWrapper = document.createElement('div');
        const translateYInit = widgetInitData.height + (widgetInitData.verticalMargin * 2);
        this.translateYInit = translateYInit;
        this.goodsWidgetWrapper = goodsWidgetWrapper;
        goodsWidgetWrapper.style.cssText = `
            position: relative;
            margin-top: ${widgetInitData.verticalMargin}px;
            // height: calc(100vh - 100px);
            height: ${widgetInitData.height}px;
            width: ${widgetInitData.width}px;
            transform: translateY(${translateYInit}px);
            margin-left: auto;
            margin-right: auto;
            background-color: rgba(255,255,255,0.35);
            backdrop-filter: blur(5px);
            transition: transform 300ms;
          `;

        goodsWidgetRoot.appendChild(goodsWidgetWrapper);

        // 3 layer - position relative 100% 100% - сама ячейка под виджет

        const goodsWidget = document.createElement('div');
        goodsWidget.style.cssText = `position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: end;`;

        goodsWidgetWrapper.appendChild(goodsWidget);

        // if default or custom items only
        const sliderBackground = document.createElement('div');
        sliderBackground.style.cssText = `
            position: absolute;
            bottom: 0;
            background-color: white;
            width: 100%;
            height: 250px;
          `;
        goodsWidget.appendChild(sliderBackground);
        this.goodsWidget = goodsWidget;

        const closeClickHandler = (e: Event) => {
          console.log({e});
          this.close();
        }
        this.closeClickHandler = closeClickHandler;

        const topPanel = document.createElement('div');
        topPanel.style.cssText = `
            position: absolute;
            top: 0;
            width: 100%;
            height: ${widgetInitData.height - 250}px;
          `;
        goodsWidget.appendChild(topPanel);
        topPanel.addEventListener('click', closeClickHandler);
        this.topPanel = topPanel;




        const sliderRoot = document.createElement('div');
        this.sliderInstance = new Slider(sliderRoot, appearanceManager);
        goodsWidget.appendChild(sliderRoot);

        const clickHandler = (e: Event, item: Dict) => {
          if (appearanceManager.goodsWidgetOptions.itemClickHandler && isFunction(appearanceManager.goodsWidgetOptions.itemClickHandler)) {
            appearanceManager.goodsWidgetOptions.itemClickHandler(item);
          }
          console.log({e, item});
        }



        this.sliderInstance.render(skuList, clickHandler, closeClickHandler);
        skuFilledPromise.then(items => {
          console.log('reRender', items);
          this.sliderInstance.render(items, clickHandler, closeClickHandler);

        }).catch(reason => {
          // что то сделать

        });


        storyReaderInstance.iframe.parentNode?.insertBefore(goodsWidgetRoot, storyReaderInstance.iframe.nextSibling);
        this.goodsWidgetRoot = goodsWidgetRoot;


        // start animation
        window.requestAnimationFrame(_ =>
          window.requestAnimationFrame(_ => goodsWidgetWrapper.style.setProperty('transform', 'translateY(0px)'))
        );


        // create new container

        // shadow dom or scoped css

        // 1 layer // position: fixed;/* inset: 0px; *//* pointer-events: none; */top: 0;bottom: 50px;height: 100%;left: 0;width: 100%;bottom: 0;z-index: 2147483646;
        // 2 layer
        // position: relative;
        // margin-top: 50px;
        // /* margin-bottom: 50px; */
        // height: calc(100vh - 100px);
        // width: 524px;
        // transform: translateY(961px);
        // margin-left: auto;
        // margin-right: auto;
        // background-color: rgba(255,255,255,0.35);
        // /* z-index: 1; */
        // backdrop-filter: blur(5px);
        //

        // 3 layer - position relative 100% 100% - сама ячейка под виджет


        // if (isFunction(this._callbacks.storyLinkClickHandler) || this.listenerCount(StoriesEvents.CLICK_ON_STORY) > 0) {
        //   const cbPayload = { src: 'storyReader', srcRef: 'default', data: payload };
        //   try {
        //     if (isFunction(this._callbacks.storyLinkClickHandler)) {
        //       this._callbacks.storyLinkClickHandler(cbPayload);
        //     }
        //     this.emit(StoriesEvents.CLICK_ON_STORY, cbPayload);
        //   } catch (e) {
        //     console.error(e)
        //   }
        // } else {
        //   window.open(payload.url, '_self');
        // }

      }


    } else {
      throw new Error('NotSupported');
    }
  }

  public close() {
    if (this.widgetInitData && this.goodsWidgetWrapper) {

      this.goodsWidgetWrapper.style.setProperty('transform', `translateY(${this.translateYInit}px)`);
      // лучше handler на окончание transition

      setTimeout(() => {
        let oldChild = this.goodsWidgetRoot.parentNode?.removeChild(this.goodsWidgetRoot);

        // @ts-ignore
        this.goodsWidgetRoot = null;
        // @ts-ignore
        oldChild = null;

        if (this.closeClickHandler) {
          this.topPanel.removeEventListener('click', this.closeClickHandler);
        }
        // @ts-ignore
        this.topPanel = null;

        this.emit('close', {elementId: this.widgetInitData.elementId});

      }, 300);

    }
  }

}

class Slider {
  private readonly root!: HTMLDivElement;
  private readonly appearanceManager!: AppearanceManager;
  constructor(sliderRoot: HTMLDivElement, appearanceManager: AppearanceManager) {
    this.root = sliderRoot;
    this.appearanceManager = appearanceManager;

    sliderRoot.style.cssText = `
    position: relative;
    display: flex;
    flex-direction: column;
    margin-left: 0;

    margin-bottom: 30px;
    `;

  }

  public render(items: Array<Dict>, clickHandler: Function, closeClickHandler: Function) {
    // rerender ?
    ReactDOM.render(<SliderComponent items={items} clickHandler={clickHandler} closeClickHandler={closeClickHandler} appearanceManager={this.appearanceManager}/>, this.root, () => {
      // onAllMediaLoaded(rootElement, cb);
    })
  }

}

function SliderComponent(props: ComponentProps<any>) {

  let items = '';
  if (props.appearanceManager.goodsWidgetOptions.goodsWidgetRenderingType === GoodsWidgetRenderingType.DEFAULT) {
    items = props.items.map((item: Dict, index: number) => <SliderCard key={index} imgSrc={item.imgSrc}
                                                                           title={item.title} subTitle={item.subTitle}
                                                                           price={item.price} oldPrice={item.oldPrice}
                                                                           index={index}
                                                                           clickHandler={(e: MouseEvent) => props.clickHandler(e, item)}
    />);
  } else if (props.appearanceManager.goodsWidgetOptions.goodsWidgetRenderingType === GoodsWidgetRenderingType.CUSTOM_CARD) {
    if (props.appearanceManager.goodsWidgetOptions.getCardHtml && isFunction(props.appearanceManager.goodsWidgetOptions.getCardHtml)) {
      items = props.items.map((item: Dict, index: number) => <div
        key={index}
        dangerouslySetInnerHTML={{__html: props.appearanceManager.goodsWidgetOptions.getCardHtml(item, index)}}
        onClick={e => props.clickHandler(e, item)}
      />);
    }
  }
  return (
    <>
    <SliderCarousel>{items}</SliderCarousel>
    {/*<div style={{display: "flex", flexWrap: "nowrap", overflowX: "scroll", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth"}}>{items}</div>*/}
      <div style={{display: "flex", flexDirection: 'column', alignItems: "center", marginTop: 20}}><span onClick={props.closeClickHandler} style={{cursor: "pointer"}}>{arrowIcon}</span></div>
    </>
  );
}

function SliderCard(props: ComponentProps<any>) {

  return (
    <div style={{width: 100, marginRight: 15, marginLeft: props.index === 0 ? 15 : 0}} onClick={props.clickHandler}>
      <img src={props.imgSrc} style={{width: 100, height: 100}} alt=""/>
      <div style={{fontSize: '16px', fontWeight: 'bold'}}>{props.title}</div>
      <div style={{fontSize: '16px', fontWeight: 'normal'}}>{props.subTitle}</div>
      <div style={{fontSize: '16px', fontWeight: 'bold'}}>{props.price}</div>
      <div style={{fontSize: '16px', fontWeight: 'bold'}}>{props.oldPrice}</div>
    </div>
  );

}