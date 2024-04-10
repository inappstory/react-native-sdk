<template>
    <div class="wrapper" v-if="showPanel">
        <transition :appear="true" name="fade">
            <div class="backdrop" v-if="showContent" @click="onBackdropClick"></div>
        </transition>
        <transition :appear="true" name="swipe-up-2" @after-leave="closePanel">
            <div class="main" v-if="showContent" ref="sharePanel" :style="mainStyle">
                <div class="main-elements" :style="mainElementsStyle">
                    <div class="question" :style="questionStyle">
                        {{ String(config.configV2.main.question.text.value).trim() }}
                    </div>
                    <div class="input-wrapper" :style="inputWrapperStyle">
                        <div class="textarea-grow-wrap" :style="inputStyle">
                            <textarea
                                class="input"
                                :placeholder="String(config.configV2.main.input.text.placeholder).trim()"
                                v-model="inputValue"
                                @input="
                                    ($event) => {
                                        $event.target.parentNode.dataset.replicatedValue = $event.target.value;
                                        inputValueInternal = $event.target.value;
                                    }
                                "
                                rows="1"
                                ref="inputElement"
                            />
                        </div>
                    </div>
                </div>
                <div
                    class="button-wrapper"
                    v-if="String(inputValue).trim().length > 0 || inputValueInternal.trim().length > 0"
                >
                    <button class="button" :style="buttonStyle" @click.prevent="onSubmit">
                        {{ String(config.configV2.main.button.text.value).trim() }}
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import { InputModalConfig } from "./InputModal.h";
import { Option } from "../../../../global.h";

@Component({
    name: "InputModal",
    components: {},
})
export default class InputModal extends Vue {
    @Prop({ type: Boolean }) value!: boolean;
    @Prop({ type: Object }) config!: InputModalConfig;

    inputValueInternal = "";
    inputValue = "";

    onSubmit() {
        this.cb = () => {
            this.$emit("inputComplete", { result: true, value: this.inputValue });
            this.inputValue = "";
        };
        this.closeHandler();
    }

    showPanel = false;
    showContent = false;
    cb = () => {};
    closePanel() {
        this.showPanel = false;
        this.$emit("input", false);
        this.cb();
    }
    closeHandler() {
        this.showContent = false;
    }
    @Watch("value")
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
            this.$emit("inputComplete", { result: false, value: this.inputValue });
        };
        this.closeHandler();
    }

    panelHeight: string = "100%";
    updatePanelHeight() {
        if (this.$refs.sharePanel) {
            this.panelHeight = window.getComputedStyle(this.$refs.sharePanel as any).height;
        }
    }

    // window.__factor =  viewportWidth / fontSize;

    // borderRadius = params.border.radius * (viewportWidth / factor)
    // пример в px: borderRadius = .8 * (418px / 18.13) = 18.44px
    // factor и params.border.radius приходят из js, viewportWidth - считаешь в удобных единицах
    //
    // это позволит каждой платформе работать с теми размерностями, которые ей нужны
    //
    // все что черное - это область текста, все что цветное - это padding данного контейнера

    relativeSize(size: number) {
        return size * (this.config.size.viewportWidth / (this.config.size.viewportWidth / this.config.size.fontSize));
    }

    // styles
    get mainStyle() {
        const main = this.config.configV2.main;
        return {
            width: `${this.config.size.absolute.width}px`,
            height: `auto`,
            left: `${
                this.config.size.absolute.center.x - this.config.size.absolute.width / 2 - this.config.size.slideOffsetX
            }px`,
            // top: `${(this.config.size.absolute.center.y - this.config.size.absolute.height/2) - this.config.size.slideOffsetY}px`,
            // top: `${(this.config.size.absolute.center.y - this.config.size.absolute.height/2) - this.config.size.slideOffsetY}px`,
            // right: `${this.config.size.absolute.right}px`,

            // only for mobile
            top: `25%`,

            backgroundColor: `${main.background.color}`,
            border: `${main.border.visible && `${this.relativeSize(main.border.width)}px solid ${main.border.color}`}`,
            borderRadius: `${this.relativeSize(main.border.radius)}px`,
        };
    }
    get mainElementsStyle() {
        const main = this.config.configV2.main;
        return {
            width: `100%`,
            padding: `${this.relativeSize(main.padding.top)}px ${this.relativeSize(
                main.padding.right
            )}px ${this.relativeSize(main.padding.bottom)}px ${this.relativeSize(main.padding.left)}px`,
        };
    }
    get questionStyle() {
        const question = this.config.configV2.main.question;
        return {
            padding: `${this.relativeSize(question.padding.top)}px ${this.relativeSize(
                question.padding.right
            )}px ${this.relativeSize(question.padding.bottom)}px ${this.relativeSize(question.padding.left)}px`,
            color: `${question.text.color}`,
            fontSize: `${this.relativeSize(question.text.size)}px`,
            lineHeight: `${question.text.lineHeight}`,
            textAlign: `${question.text.align}`,
            fontFamily: `${question.text.type}`,
            fontWeight: `${question.text.weight}`,
            fontStyle: `${question.text.style}`,
        };
    }
    get inputWrapperStyle() {
        const input = this.config.configV2.main.input;
        return {
            padding: `${this.relativeSize(input.padding.top)}px ${this.relativeSize(
                input.padding.right
            )}px ${this.relativeSize(input.padding.bottom)}px ${this.relativeSize(input.padding.left)}px`,
            backgroundColor: `${input.background.color}`,
            border: `${this.relativeSize(input.border.width)}px solid ${input.border.color}`,
            borderRadius: `${this.relativeSize(input.border.radius)}px`,
            lineHeight: `${input.text.lineHeight}`,
            maxHeight: `${input.text.lineHeight * 3}em`,
            fontSize: `${this.relativeSize(input.text.size)}px`,
        };
    }
    get inputStyle() {
        const input = this.config.configV2.main.input;
        return {
            color: `${input.text.color}`,
            fontSize: `${this.relativeSize(input.text.size)}px`,
            lineHeight: `${input.text.lineHeight}`,
            textAlign: `${input.text.align}`,
            fontFamily: `${input.text.type}`,
            fontWeight: `${input.text.weight}`,
            fontStyle: `${input.text.style}`,
        };
    }
    get buttonStyle() {
        const button = this.config.configV2.main.button;
        return {
            padding: `${this.relativeSize(button.padding.top)}px ${this.relativeSize(
                button.padding.right
            )}px ${this.relativeSize(button.padding.bottom)}px ${this.relativeSize(button.padding.left)}px`,
            backgroundColor: `${button.background.color}`,
            border: `${this.relativeSize(button.border.width)}px solid ${button.border.color}`,
            color: `${button.text.color}`,
            fontSize: `${this.relativeSize(button.text.size)}px`,
            lineHeight: `${button.text.lineHeight}`,
            textAlign: `${button.text.align}`,
            fontFamily: `${button.text.type}`,
            fontWeight: `${button.text.weight}`,
            fontStyle: `${button.text.style}`,
        };
    }

    @Watch("showPanel")
    onShowPanel(to: Option<boolean>, from: Option<boolean>) {
        if (to) {
            this.$nextTick(() => {
                const input = this.$refs.inputElement as HTMLTextAreaElement;
                if (input) {
                    setTimeout(() => input.focus());
                }
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.wrapper {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans",
        sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;

    .backdrop {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
    }
}

.main {
    position: absolute;
    z-index: 2;
    user-select: none;
    display: flex;
    flex-direction: column;

    text-rendering: geometricprecision;

    overflow: hidden;

    .question {
        &:empty {
            display: none;
        }
        width: 100%;
        height: auto;
    }

    .input-wrapper {
        overflow: hidden;
        box-sizing: content-box;
        .input {
            background: none;
            -webkit-tap-highlight-color: transparent;
            text-rendering: inherit;
            outline: none;
            &::placeholder {
                color: inherit;
            }
        }
    }
}

.textarea-grow-wrap {
    /* easy way to plop the elements on top of each other and have them both sized based on the tallest one's height */
    display: grid;
    max-width: 100%;
    word-break: break-all;
}
.textarea-grow-wrap::after {
    /* Note the weird space! Needed to preventy jumpy behavior */
    content: attr(data-replicated-value) " ";

    /* This is how textarea text behaves */
    white-space: pre-wrap;

    /* Hidden from view, clicks, and screen readers */
    visibility: hidden;
}
.textarea-grow-wrap > textarea {
    /* You could leave this, but after a user resizes, then it ruins the auto sizing */
    resize: none;

    /* Firefox shows scrollbar on growth, you can hide like this. */
    overflow: hidden;
}
.textarea-grow-wrap > textarea,
.textarea-grow-wrap::after {
    /* Identical styling required!! */
    border: inherit;
    padding: inherit;
    font: inherit;
    text-rendering: inherit;
    text-align: inherit;
    line-height: normal;
    color: inherit;

    /* Place on top of each other */
    grid-area: 1 / 1 / 2 / 2;
}

.button-wrapper {
    width: 100%;

    .button {
        width: 100%;
        cursor: pointer;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 300ms;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
