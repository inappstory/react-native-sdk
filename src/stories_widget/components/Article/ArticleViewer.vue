<template>
  <div class="article-viewer" style="overflow: auto; -webkit-overflow-scrolling: touch">

    <div class="article-viewer-header">

      <button @click.stop.prevent="closeArticleViewer" class="article-viewer-back" style="pointer-events: all">
        <svg width="16px" height="30px" viewBox="0 0 16 30" version="1.1" xmlns="http://www.w3.org/2000/svg"
             xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Icon-/-Back" fill="#333333">
              <g id="Group" transform="translate(0.000000, 6.000000)">
                <polygon id="Combined-Shape"
                         points="10.1423148 16.2675245 9.05808438 17.3517549 0.577726389 8.87936213 9.05808438 0.360159185 10.1423148 1.44438958 2.74768318 8.87289288"></polygon>
                <polygon id="Rectangle"
                         transform="translate(8.510252, 9.000000) rotate(-360.000000) translate(-8.510252, -9.000000) "
                         points="2 8.2470671 15.0205048 8.21959957 15.0205048 9.7529329 2 9.78040043"></polygon>
              </g>
            </g>
          </g>
        </svg>
      </button>

      <h5 class="article-viewer-header-title">{{ headerTitle }}</h5>

    </div>

    <iframe ref="articleIframe"
            height="100%"
            width="100%"
            frameborder="0"
            style="
                overflow: auto;
                -webkit-overflow-scrolling: touch;
    position: absolute;
    top: 50px;
    left: 0;
    bottom: 0;
    height: calc(100% - 50px);
    z-index: 1;"

            @load="iframeOnLoad"
    ></iframe>

  </div>
</template>

<script lang="ts">


import {Component, Prop, Inject, Emit, Watch, Vue} from "vue-property-decorator";

import {_winWidth, _winHeight} from '../../util/window-size';
import {IAnimateOptions, animate} from '../../util/animation';
import {WidgetStoriesOptions} from "../../models/WidgetStoriesOptions";

import Article, {ArticleOptions} from "../../models/Article";
import IssueArticle, {IssueArticleOptions} from "../../models/IssueArticle"
import StoriesViewer from '../../components/Stories/StoriesViewer/StoriesViewer.vue';

const namespace: string = 'article';

@Component({
  name: "ArticleViewer",
})

export default class ArticleViewer extends Vue {
  /** property значения которые получает компонент */
  @Prop({type: String}) id!: string; // article slug_or_id for view
  @Prop({type: String}) type!: string; // articleType article || issueArticle
  @Prop({type: String, default: ''}) uid!: string;

  headerTitle: string = '';

  @Watch('uid')
  onUidChanged(to: string, from: string) {
    if (to !== '') {
      this.showArticle();
    }
  }

  iframeOnLoad(el: Event): void {
    const iframeElement = (el.target as HTMLFrameElement);
    if (iframeElement.contentWindow !== null && iframeElement.contentWindow.document !== null) {
      if (iframeElement.contentWindow !== null && iframeElement.contentWindow.document !== null) {
        /** since ie does not support Array.from and Object.forEach */
        [].slice.call(iframeElement.contentWindow.document.querySelectorAll('a')).forEach((el: Element) => {
          el.setAttribute('target', '_blank');
        });
      }
    }
  }


  showArticle(): void {
    if (this.type === IssueArticleOptions.TYPE) {
      this.$store.dispatch(`${namespace}/FETCH_ISSUE_ARTICLES`, [this.id]).then(_ => {

        let issueArticle = null;
        this.$store.getters[`${namespace}/issueArticles`].forEach((item: Article) => {
          if (item.slug_or_id === this.id) {
            issueArticle = item;
          }
        });
        if (issueArticle !== null) {

          this.headerTitle = (issueArticle as IssueArticle).magazine_name;

          this.updateIframeContent((issueArticle as IssueArticle).content);

        }

      });

    } else if (this.type === ArticleOptions.TYPE) {
      this.$store.dispatch(`${namespace}/FETCH_ARTICLES`, [this.id]).then(_ => {
        let article: Article | null = null;
        this.$store.getters[`${namespace}/articles`].forEach((item: Article) => {
          if (item.slug_or_id === this.id) {
            article = item;
          }
        });
        if (article !== null) {
          this.headerTitle = (article as Article).magazine_name;
          this.updateIframeContent((article as Article).content);
        }

      });
    }
  }

  updateIframeContent(content: string): void {
    if (this.$refs['articleIframe'] !== null && this.$refs['articleIframe'] !== undefined) {
      const iframeElement = (this.$refs['articleIframe'] as HTMLFrameElement);
      if (iframeElement.contentWindow !== null && iframeElement.contentWindow.document !== null) {
        iframeElement.contentWindow.document.write(content);
        iframeElement.contentWindow.document.close();
      }
    }
  }

  closeArticleViewer(): void {

    const iframeElement = (this.$refs['articleIframe'] as HTMLFrameElement);
    if (iframeElement.contentWindow !== null) {
      iframeElement.src = 'about:blank';
    }

    // @ts-ignore
    (this.$parent as StoriesViewer).closeArticleViewer();

    // @ts-ignore
    (this.$parent as StoriesViewer).resumeAndEnableViewerUIForArticleViewer();
  }

}

</script>

<style lang="scss">

.article-viewer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background-color: white;
  z-index: 1;

  /*background-color: rgba(255,255,255,0.8);*/
  user-select: none;
  pointer-events: all;
}

.article-viewer-header {
  height: 50px;
  border-bottom: 1px solid #ededed;
}

button.article-viewer-back {
  border: 0;
  padding: 0;
  background: transparent;
  position: absolute;
  left: 10px;
  top: 0;
  height: 50px;
  pointer-events: all;
  outline: none;

  &:focus {
    outline: none;
  }

  cursor: pointer;


  /*span {*/
  display: block;
  width: 16px;
  /*width: 25px;*/
  /*height: 25px;*/
  fill: #333;
  color: #333;
  /*stroke: white;*/

  /*}*/


}


.article-viewer-header-title {
  height: 50px;
  line-height: 50px;

  margin-left: 10px;
  margin-right: 10px;
  overflow: hidden;
  max-lines: 1;
  text-overflow: ellipsis;

}

</style>
