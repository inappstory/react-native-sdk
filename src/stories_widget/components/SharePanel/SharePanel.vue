<template>
    <div class="share-panel-wrapper" v-if="showPanel">
        <transition :appear="true" name="fade">
            <div class="share-panel-backdrop" v-if="showContent" @click="onBackdropClick"></div>
        </transition>
        <transition :appear="true" name="swipe-up" @after-leave="closePanel">
            <div class="share-panel" v-if="showContent" ref="sharePanel" :style='{"--height": panelHeight}'>
                <div class="share-panel-row title-row">
                    <div class="share-url-favicon"><img
                        :src="`${readerOptions.faviconApiUrl || faviconApiUrl}?sz=64&domain_url=${shareUrlDomain}`" alt=""></div>
                    <span class="title">{{ shareLink }}</span>
                </div>
                <div class="share-panel-separator"></div>
                <div class="share-panel-row">
                    <a class="share-item" :href="`https://vk.com/share.php?url=${shareLink}`"
                       @click.prevent.stop="openWindow(`https://vk.com/share.php?url=${shareLink}`, 'newwindow', 'width=650,height=570')"
                       target="_blank">
                        <VkIcon width="50px" height="50px"/>
                        <span class="share-item-title">Vk</span></a>
                </div>
                <div class="share-panel-separator"></div>
                <div class="share-panel-row">
                    <a class="share-item" @click.prevent="onCopyClick">
                        <CopyIcon width="31.5px" height="35px" color="white"/>
                        <span class="share-item-title">Copy link</span></a>
                </div>
                <div class="share-panel-separator"></div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">

/**
 * tmp remove from SharePanel
 *
 * <a class="share-item" :href="`https://www.facebook.com/sharer.php?u=${shareLink}`"
 *                        @click.prevent.stop="openWindow(`https://www.facebook.com/sharer.php?u=${shareLink}`, 'newwindow', 'width=650,height=570')"
 *                        target="_blank">
 *                         <FacebookIcon width="50px" height="50px"/>
 *                         <span class="share-item-title">Facebook</span></a>
 *                     <a class="share-item" :href="`https://twitter.com/share?url=${shareLink}`"
 *                        @click.prevent.stop="openWindow(`https://twitter.com/share?url=${shareLink}`, 'newwindow', 'width=650,height=570')"
 *                        target="_blank">
 *                         <TwitterIcon width="50px" height="50px"/>
 *                         <span class="share-item-title">Twitter</span></a>
 *                     <a class="share-item" :href="`https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}`"
 *                        @click.prevent.stop="openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}`, 'newwindow', 'width=650,height=570')"
 *                        target="_blank">
 *                         <LinkedInIcon width="50px" height="50px"/>
 *                         <span class="share-item-title">LinkedIn</span></a>
 */


import {Component, Vue, Watch, Prop} from "vue-property-decorator";
import FacebookIcon from "../../components/svg/FacebookIcon.vue";
import TwitterIcon from "../../components/svg/TwitterIcon.vue";
import LinkedInIcon from "../../components/svg/LinkedInIcon.vue";
import VkIcon from "../../components/svg/VkIcon.vue";
import CopyIcon from "../../components/svg/CopyIcon.vue";
import {addOnceEventListener} from "../../util/event";
import {Getter} from "vuex-class";
import Clipboard from "../../../helpers/clipboard";
import {ReaderOptions} from "../../models/WidgetStoriesOptions";

const namespace: string = 'stories';

@Component({
    name: "SharePanel",
    components: {CopyIcon, VkIcon, LinkedInIcon, TwitterIcon, FacebookIcon},
})
export default class SharePanel extends Vue {
    @Prop({type: Boolean}) value!: boolean;
    @Prop({type: String}) shareLink!: string;

    @Getter('readerOptions', {namespace}) readerOptions!: ReaderOptions;

    get shareUrlDomain() {
        try {
            const shareUrl: URL = new URL(this.shareLink);
            return shareUrl.host;
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    onCopyClick() {
        Clipboard.copy(this.shareLink);
        this.cb = () => {
            this.$emit('shareComplete', true);
        }
        this.closeHandler();
    }

    openWindow(url?: string, target?: string, features?: string) {
        addOnceEventListener(window, 'focus', this.focusCb);
        window.open(url, target, features);
    }
    showPanel = false;
    showContent = false;
    faviconApiUrl = process.env.FAVICON_API_URL;
    cb = () => {};
    closePanel() {
        this.showPanel = false;
        this.$emit('input', false);
        this.cb();
    }
    closeHandler() {
        this.showContent = false;
    }
    focusCb() {
        this.closeHandler();
        this.cb = () => {
            this.$emit('shareComplete', true);
        };
    }
    @Watch('value')
    onChangeValue(val: boolean) {
        if (val) {
            this.showPanel = this.showContent = true;
            this.$nextTick(() => this.updatePanelHeight());
        } else {
            this.closeHandler();
        }
    }

    onBackdropClick() {
        this.cb = () => {
            this.$emit('shareComplete', false);
        }
        this.closeHandler();
    }

    panelHeight: string = '100%';
    updatePanelHeight() {
        if (this.$refs.sharePanel) {
            this.panelHeight = window.getComputedStyle((this.$refs.sharePanel as any)).height;
        }
    }

}

</script>

<style lang="scss">

.share-panel-wrapper {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;

    .share-panel-backdrop {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        background-color: rgba(0, 0, 0, .5);
    }
}

.share-panel {
    position: absolute;
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #202125;
    z-index: 2;
    user-select: none;

    border-top-left-radius: 20px;
    border-top-right-radius: 20px;

}

.share-panel-row {
    width: 100%;
    height: 150px;
    display: flex;
    flex-direction: row;
    align-items: center;

    .share-item {
        cursor: pointer;
        flex: 0 0 auto;
        width: 69px; // 90 in original
        height: 90px;
        margin: 0 10px;

        &:first-child {
            margin-left: 20px;
        }

        &:last-child {
            margin-right: 20px;
        }


        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        &, &:visited, &:active, &:focus {
            text-decoration: none;
            color: white;
        }

        .share-item-title {
            margin-top: 20px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;

        }
    }


    // h 90px;

    &.title-row {
        height: 120px;
        padding: {
            top: 30px;
            bottom: 30px;
            left: 20px;
            right: 20px;
        };

        .share-url-favicon {
            width: 60px;
            height: 60px;
            background-color: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;

            img {
                width: 30px;
                height: 30px;
            }
        }

        .title {
            color: white;
            font-size: 16px;
            line-height: 1.4rem;
            margin-left: 15px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }


}

.share-panel-separator {
    width: 100%;
    height: 1px;
    background-color: #36373b;
}

.share-panel {
    will-change: transform;
}
.swipe-up-enter-active, .swipe-up-leave-active {
    transition: transform 300ms;
}
.swipe-up-enter, .swipe-up-leave-to {
    transform: translateY(var(--height, 100%));
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 300ms;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}


</style>
