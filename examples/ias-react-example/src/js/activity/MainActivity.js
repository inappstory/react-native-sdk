import "../../sass/style.scss";
import "normalize.css";

import {Link} from "../router";
import {routes} from "../routes";
import React, {useEffect, useRef, useState} from "react";

import plural from 'plural-ru';
const uuid = require('uuid');

// @ts-ignore

import {StoriesList, StoryManager, AppearanceManager} from "ias-react/ias-react.mjs";
import {StoriesListCardViewVariant} from "~/src/widget-stories-list/index.h";

window.ias = {StoriesList, StoryManager, AppearanceManager};

const extUrl = new URL('../../../public/assets/fifteen-puzzle-game.png', import.meta.url);

const storyManagerConfig = {
  // apiKey: "test-key",
  apiKey: "JCPo0hB5l2efXrfWi9anB5Zmqa5rienq", // gmail
  // apiKey: "wKQWqaxRE53uczlrLGO_a4UiFDiZhFWO", // kiozk
  userId: "cs_kdijhud4454dd5a1",
  // userId: "2760",
  tags: [],
  placeholders: {
    user: "Guest"
  },
  lang: "ru"
};

const createStoryManager = () => new StoryManager(storyManagerConfig);

const createAppearanceManager = () => {
  return new AppearanceManager()
    .setCommonOptions({
      hasLike: true,
      hasFavorite: true
    })
    .setStoriesListOptions({
      title: {
        content: 'The best stories',
        color: '#000',
        font: 'normal',
        marginBottom: 20,
      },
      card: {
        title: {
          color: 'black',
          font: '14px/16px "Segoe UI Semibold"',
          padding: 8
        },
        gap: 10,
        height: 100,
        variant: 'quad',
        border: {
          radius: 20,
          color: 'blue',
          width: 2,
          gap: 3,
        },
        boxShadow: null,
        opacity: 1,
        mask: {
          color: 'rgba(34, 34, 34, 0.3)'
        },
        opened: {
          border: {
            radius: null,
            color: 'red',
            width: null,
            gap: null,
          },
          boxShadow: null,
          opacity: null,
          mask: {
            color: 'rgba(34, 34, 34, 0.1)'
          },
        },
      },
      favoriteCard: {
          title: {
              content: 'Избранное',
              font: 'normal',
              color: '#000',
              padding: 15,
          },
          gap: 10,
          height: 70,
          variant: StoriesListCardViewVariant.CIRCLE,
          border: {
              radius: 0,
              color: 'black',
              width: 2,
              gap: 3,
          },
          boxShadow: null,
          opacity: null,
          mask: {
              color: null,
          },
          opened: {
              border: {
                  radius: null,
                  color: null,
                  width: null,
                  gap: null,
              },
              boxShadow: null,
              opacity: null,
              mask: {
                  color: null,
              },
          },
      },
      layout: {
        height: 0,
        backgroundColor: 'transparent'
      },
      sidePadding: 20,
      topPadding: 20,
      bottomPadding: 20,
      bottomMargin: 17,
      navigation: {
        showControls: false,
        controlsSize: 48,
        controlsBackgroundColor: 'white',
        controlsColor: 'black'
      },
    })
    .setStoryReaderOptions({
      closeButtonPosition: 'right',
      scrollStyle: 'flat',
    }).setStoryFavoriteReaderOptions({
      title: {
        content: 'Избранное'
      }
    })
}

console.log("React.version: ", React.version);

export default function MainActivity() {

  // можно кастомный хук сделать

  const [storyManager, setStoryManager] = useState(null);
  const [appearanceManager, setAppearanceManager] = useState(null);
  useEffect(() => {
    setStoryManager(createStoryManager());
    setAppearanceManager(createAppearanceManager());

    return () => {
      storyManager.destructor();
    };
  }, []);


  return (
    // or pass cb setStoryManager & setAppearanceManager
    <StoriesList storyManager={storyManager} appearanceManager={appearanceManager}/>
  );

}

// function MainActivity2() {
//
//     useEffect(() => {
//
//         const storyManagerConfig = {
//             // apiKey: "test-key",
//             // apiKey: "JCPo0hB5l2efXrfWi9anB5Zmqa5rienq", // gmail
//             // apiKey: "wKQWqaxRE53uczlrLGO_a4UiFDiZhFWO", // kiozk
//             apiKey: "test-key",
//             userId: "cs_kdijhud4454dd5a1",
//             // userId: "2760",
//             tags: [],
//             placeholders: {
//                 user: "Guest"
//             },
//             lang: "ru"
//         };
//
//         const storyManager = new IAS.StoryManager(storyManagerConfig);
//
//         const appearanceManager = new IAS.AppearanceManager();
//         appearanceManager.setCommonOptions({
//             hasLike: true,
//             hasFavorite: true
//         })
//             .setStoriesListOptions({
//                 title: {
//                     content: 'The best stories',
//                     color: '#000',
//                     font: 'normal',
//                     marginBottom: 20,
//                 },
//                 card: {
//                     title: {
//                         color: 'black',
//                         font: '14px/16px "Segoe UI Semibold"',
//                         padding: 8
//                     },
//                     gap: 10,
//                     height: 100,
//                     variant: 'quad',
//                     border: {
//                         radius: 20,
//                         color: 'blue',
//                         width: 2,
//                         gap: 3,
//                     },
//                     boxShadow: null,
//                     opacity: 1,
//                     mask: {
//                         color: 'rgba(34, 34, 34, 0.3)'
//                     },
//                     opened: {
//                         border: {
//                             radius: null,
//                             color: 'red',
//                             width: null,
//                             gap: null,
//                         },
//                         boxShadow: null,
//                         opacity: null,
//                         mask: {
//                             color: 'rgba(34, 34, 34, 0.1)'
//                         },
//                     },
//                 },
//                 favoriteCard: {
//                 },
//                 layout: {
//                     height: 0,
//                     backgroundColor: 'transparent'
//                 },
//                 sidePadding: 20,
//                 topPadding: 20,
//                 bottomPadding: 20,
//                 bottomMargin: 17,
//                 navigation: {
//                     showControls: false,
//                     controlsSize: 48,
//                     controlsBackgroundColor: 'white',
//                     controlsColor: 'black'
//                 },
//             })
//             .setStoryReaderOptions({
//                 closeButtonPosition: 'right',
//                 scrollStyle: 'flat',
//             }).setStoryFavoriteReaderOptions({
//             title: {
//                 content: 'Избранное'
//             }
//         });
//
//         const storiesList = new storyManager.StoriesList("#stories_widget", appearanceManager, 'default');
//         //
//         window.appearanceManager = appearanceManager;
//         window.storiesList = storiesList;
//         //
//         //
//         //
//         //
//         // // 4. Override default loading animation
//         storiesList.on('startLoader', loaderContainer => loaderContainer.style.background = 'url("https://inappstory.com/stories/loader.gif") center / 45px auto no-repeat transparent');
//         storiesList.on('endLoader', (loaderContainer, loadedStoriesLength) => {
//             loaderContainer.style.background = 'none';
//             console.log({loadedStoriesLength});
//         });
//
//         // SharePage example
//         /*const id = "krtdhze"; // from url path
//         // or 720
//
//         const sharePage = new storyManager.SharePage(id, appearanceManager, {
//           handleStartLoading: () => console.log("handleStartLoading"),
//           handleStopLoading: (result) => console.log("handleStartLoading", result),
//           // handleStoryReaderClose: () => console.log("handleStoryReaderClose")
//         });
//         sharePage.on("startLoading", () => console.log('sharePage startLoading'));
//         sharePage.on("endLoading", (e) => console.log('sharePage endLoading', e.result));
//         sharePage.on("closeStoryReader", () => console.log('sharePage closeStoryReader'));
//
//         // meta only
//         const response = await window.fetch(`https://api.test.inappstory.com/v2/story-share-page-info/${id}`, {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${storyManagerConfig.apiKey}`,
//           },
//         });
//         const storyData = await response.json();*/
//
//         storyManager.storyLinkClickHandler = payload => console.log({payload});
//
//         appearanceManager.setGoodsWidgetOptions({
//             goodsWidgetRenderingType: 'customCard',
//             getCardHtml: (item, index) => {
//
//                 console.log({item, index})
//
//                 const html = `
//           <div style="width: 100px; margin-right: 15px; margin-left: ${index === 0 ? "15px" : 0}">
//             <img src="${item.imgSrc}" style="width: 100px; height: 100px"/>
//           </div>
//         `;
//
//
//                 // <div style={{width: 100, marginRight: 15, marginLeft: props.index === 0 ? 15 : 0}} onClick={props.clickHandler}>
//                 //   <img src={props.imgSrc} style={{width: 100, height: 100}} alt=""/>
//                 //   <div style={{fontSize: '16px', fontWeight: 'bold'}}>{props.title}</div>
//                 //   <div style={{fontSize: '16px', fontWeight: 'normal'}}>{props.subTitle}</div>
//                 //   <div style={{fontSize: '16px', fontWeight: 'bold'}}>{props.price}</div>
//                 //   <div style={{fontSize: '16px', fontWeight: 'bold'}}>{props.oldPrice}</div>
//                 // </div>
//
//                 return html;
//
//             },
//
//             // skuList - сразу модельки кидать
//             openGoodsWidgetHandler: skuList => {
//                 console.log({skuList});
//
//                 return new Promise((resolve, reject) => {
//
//                     setTimeout(_ => {
//
//                         const items = skuList.map(item => ({
//                             ...item,
//                             imgSrc: "https://cs.test.inappstory.com/np/story/dqp/r8v/lfs/2ndogje88pv5rnr1kttijgf/logo-350x440.jpg",
//                             title: "Roger",
//                             subTitle: "Alien",
//                             price: "1$",
//                             oldPrice: "5$"
//                         }));
//
//                         resolve(items);
//                         // resolve([
//                         //   {sku: "sku_1", title: 'title1', price: '1$'}
//                         // ]);
//                     }, 500);
//
//                 });
//
//             },
//
//
//
//
//
//         });
//
//     }, []);
//
//     return (
//         <div>
//
//
//             <div id="stories_widget"/>
//
//             <p>Main activity</p>
//             <Link to={routes.main.path}>Home</Link>
//             <img src={extUrl} alt="image main"/>
//         </div>
//     )
//
// }
