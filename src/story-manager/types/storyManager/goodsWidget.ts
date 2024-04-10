import {Dict, Optional} from "../index";


export enum GoodsWidgetRenderingType {
  DEFAULT = 'default',
  CUSTOM_CARD = 'customCard',
  CUSTOM_WIDGET = 'customWidget'
}

export type GoodsWidgetOptions = {
  goodsWidgetRenderingType: GoodsWidgetRenderingType;
  openGoodsWidgetHandler?: (skuList: Array<Dict>) => Promise<Array<Dict>>;
  // требуется если тип GoodsWidgetRenderingType.CUSTOM_CARD - описать это в ts
  getCardHtml?: (item: Dict, index: number) => string;
  // требуется для всех кроме custom widget
  itemClickHandler?: (item: Dict) => void;

  loader?: {
    default: {
      color: Optional<string>,
      accentColor: Optional<string>,
    },
    custom: Optional<string>
  };



};

const GoodsWidgetOptionsDefault: GoodsWidgetOptions = {
  goodsWidgetRenderingType: GoodsWidgetRenderingType.DEFAULT,
  loader: {
    default: {
      color: null,
      accentColor: null,
    },
    custom: null
  },
};

export {GoodsWidgetOptionsDefault};