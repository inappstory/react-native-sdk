import EventEmitter from 'events';
// import {EventBus} from '~/src/stories_widget/event-bus';
import {Store} from "vuex";
import RootState from "../store/rootState";
import Article, {ArticleOptions} from "../models/Article";
import {IssueArticleOptions} from "../models/IssueArticle";
import {SessionState} from "../store/vuex-session-module";
import {debug} from "../util/debug";
import {Session} from "../models/Session";
import {Utility} from "../../helpers/utility";


export const EVENT_OPEN_VIEWER: string = 'open';

export const EVENT_STORIES_NEXT_SLIDE: string = 'storiesNextSlide';
export const EVENT_STORIES_TRANSITION_FROM_SLIDE = 'storiesTransitionFromSlide';

export const EVENT_ARTICLE_CLOSE: string = 'storiesArticleClose';
export const EVENT_ISSUE_ARTICLE_CLOSE: string = 'storiesIssueArticleClose';


interface IDataForSending {
    data: Array<any>
}

export interface CloseStoriesViewerEvent {
    storyId: number;
    slideIndex: number;
}
export interface TransitionFromSlideEvent {
    storyId: number;
    slideIndex: number;
    transitionToType: string;
    transitionToId: number;
}

export interface NextStoryEvent {
    toStoryId: number;
    fromStoryId: number;
    fromSlideIndex: number;
}

export interface NextSlideEvent {
    fromStoryId: number;
    fromSlideIndex: number;
}


export interface ArticleCloseEvent {
    id: number; // Уникальный идентификатор стать (в зависимости от типа или для IssueArticle или Article)
}

export interface IssueArticleCloseEvent {
    id: number; // Уникальный идентификатор стать (в зависимости от типа или для IssueArticle или Article)
}

export interface ClickOnDeeplinkEvent {
    storyId: number;
}

export class StoriesStatistic extends EventEmitter {

    // statistics
    private _slideStartedAt!: number;
    private _sendStatisticTimer!: number | null;
    private _lastStatSent!: boolean | null;
    private _lastStatLength: number|null = null;

    private _articleOpenAt: number = 0;
    private _issueArticleOpenAt: number = 0;

    private _articleOpenTransitionEventIndex: number = 0;
    private _issueArticleOpenTransitionEventIndex: number = 0;

    private _store!: Store<RootState>;

    public storeStatisticNS: string = 'statistics';
    public storeStoriesNS: string = 'stories';
    public storeArticleNS: string = 'article';

    private readonly storyManagerProxy;
    public constructor(store: Store<RootState>, storyManagerProxy: (name: string, data: any) => Promise<any>) {
        super();

        this.storyManagerProxy = storyManagerProxy;
        this._store = store;

        debug('init stories statistic');
        this._slideStartedAt = Date.now();

        // TODO Handler on page close - send statistic close
        this._sendStatisticTimer = window.setTimeout(() => {this.flushStatistics()}, 30000);

        this.on('showStoriesViewerAfterHide', () => {

            debug('showStoriesViewerAfterHide event triggered')

            //
            // if (this._sendStatisticTimer !== null) {
            //     clearTimeout(this._sendStatisticTimer);
            //     this._sendStatisticTimer = null
            // }
            // this._sendStatisticTimer = window.setTimeout(() => {this.flushStatistics()}, 30000)

        });


        this.on(EVENT_STORIES_TRANSITION_FROM_SLIDE, (e: TransitionFromSlideEvent) => {

            const now = Date.now();
            const slideDuration = now - this._slideStartedAt;
            this._slideStartedAt = now;

            // sync commit
            this._store.commit(`${this.storeStatisticNS}/PUT_STORIES_STAT`, {
                action: 2,
                storyId: e.storyId,
                slideIndex: e.slideIndex, // индекс слайда
                slideDuration
            });

            /**
             * Сохраняем состояние сразу после перехода в статью (статью из выпуска)
             */
            if (e.transitionToType === ArticleOptions.TYPE) {
                this._articleOpenAt = now;
                this._articleOpenTransitionEventIndex = this._store.getters[`${this.storeStatisticNS}/lastInsertedIndex`];
            } else if (e.transitionToType === IssueArticleOptions.TYPE) {
                this._issueArticleOpenAt = now;
                this._issueArticleOpenTransitionEventIndex = this._store.getters[`${this.storeStatisticNS}/lastInsertedIndex`];
            }

        });


        this.on('closeStoriesViewer', (e: CloseStoriesViewerEvent) => {

            const now = Date.now();
            const slideDuration = now - this._slideStartedAt;

            this._store.commit(`${this.storeStatisticNS}/PUT_STORIES_STAT`, {
                action: 1, // Прочтение
                storyId: e.storyId, // id story,
                slideIndex: e.slideIndex, // индекс слайда
                slideDuration
            });

            // отправлять данные синхронно либо через beacon
            if (this._sendStatisticTimer !== null) {
                clearTimeout(this._sendStatisticTimer);
            }
            this._sendStatisticTimer = null;
            this.flushStatisticOnClose();
        });


        this.on('nextStory', (e: NextStoryEvent) => {

        });

        this.on(EVENT_STORIES_NEXT_SLIDE, (e: NextSlideEvent) => {

            const now = Date.now();
            const slideDuration = now - this._slideStartedAt;
            this._slideStartedAt = now;

            this._store.commit(`${this.storeStatisticNS}/PUT_STORIES_STAT`, {
                action: 1,
                storyId: e.fromStoryId,
                slideIndex: e.fromSlideIndex, // индекс слайда
                slideDuration
            });

        });

        this.on(EVENT_ARTICLE_CLOSE, (e: ArticleCloseEvent) => {

            const now = Date.now();
            const articleDuration = now - this._articleOpenAt;
            this._articleOpenAt = 0;

            this._store.commit(`${this.storeStatisticNS}/PUT_STORIES_ARTICLE_STAT`, {
                action: 3,
                associatedEventIndex: this._articleOpenTransitionEventIndex,
                id: e.id,
                spendTime: articleDuration
            });
        });

        this.on(EVENT_ISSUE_ARTICLE_CLOSE, (e: IssueArticleCloseEvent) => {

            const now = Date.now();
            const issueArticleDuration = now - this._issueArticleOpenAt;
            this._issueArticleOpenAt = 0;

            this._store.commit(`${this.storeStatisticNS}/PUT_STORIES_ARTICLE_STAT`, {
                action: 4,
                associatedEventIndex: this._issueArticleOpenTransitionEventIndex,
                id: e.id,
                spendTime: issueArticleDuration
            });
        });

    }


    flushStatisticOnClose(): Promise<any> {

        let dataForSending: IDataForSending = {
            data: []
        };

        // не отправляем повторно те данные которые еще не ушли
        if (this._lastStatSent) {
            dataForSending.data = this._store.getters[`${this.storeStatisticNS}/data`];
        } else {
            let offset = this._lastStatLength || 0;
            dataForSending.data = this._store.getters[`${this.storeStatisticNS}/data`].slice(offset)
        }

        return this._store.dispatch(`${this.storeStatisticNS}/FLUSH_STORIES_STAT_ON_CLOSE`, {
            storyManagerProxy: this.storyManagerProxy,
            data: dataForSending,
            dataLength: dataForSending.data.length
        });
        // don`t use close more
        // just send data on reader close
        // .then(() => {
        //     let session: SessionState = this._store.getters['shared/session'];
        //     session.id = '';
        //     session.closed = true;
        //     try {
        //         if ((session as any).rawData) {
        //             (session as any).rawData.session.closed = true;
        //             (session as any).rawData.session.id = '';
        //         }
        //     } catch (e) {
        //         console.error(e);
        //     }
        //
        //     this._store.commit('shared/setSession', {session});
        // })

    }

    flushStatistics(): Promise<any> | void {

            if (this._store.getters[`${this.storeStatisticNS}/data`].length > 0) {

                let dataForSending: IDataForSending = {
                    data: this._store.getters[`${this.storeStatisticNS}/data`]
                };

                this._lastStatSent = false;
                this._lastStatLength = dataForSending.data.length;


                return this._store.dispatch(`${this.storeStatisticNS}/FLUSH_STORIES_STAT`, {
                    storyManagerProxy: this.storyManagerProxy,
                    data: dataForSending,
                    dataLength: dataForSending.data.length
                }).then(() => {
                    this._sendStatisticTimer = window.setTimeout(() => {this.flushStatistics()}, 15 * 1000);
                    this._lastStatSent = true;
                })

            } else {
                // переводим на 5 мин
                let dataForSending: IDataForSending = {
                    data: []
                };

                this._lastStatSent = false;
                this._lastStatLength = dataForSending.data.length;

                return this._store.dispatch(`${this.storeStatisticNS}/FLUSH_STORIES_STAT`, {
                    storyManagerProxy: this.storyManagerProxy,
                    data: dataForSending,
                    dataLength: dataForSending.data.length
                }).then(() => {
                    this._sendStatisticTimer = window.setTimeout(() => {this.flushStatistics()}, 5 * 60 * 1000);
                    this._lastStatSent = true
                })

            }
    }



}
