import {StoryManager} from "../story-manager";
import {AppearanceManager} from "../story-manager/AppearanceManager";
import {createEvent, createStore} from "effector";
import {Option} from "../../global.h";
import {useBeforeFirstRender} from "./useBeforeFirstRender";
import {useStore} from "effector-react";

const setManagers = createEvent<{ storyManager: Option<StoryManager>, appearanceManager: Option<AppearanceManager> }>();
const $managers = createStore<{
    storyManager: Option<StoryManager>;
    appearanceManager: Option<AppearanceManager>;
}>({storyManager: null, appearanceManager: null}).on(
    setManagers,
    (state, value) => value
);

export const useIas = (
    createStoryManager: () => StoryManager,
    createAppearanceManager: () => AppearanceManager
) => {
    const managers = useStore($managers);
    useBeforeFirstRender(() => {
        if (managers.storyManager == null || managers.appearanceManager == null) {
            setManagers({
                storyManager: createStoryManager(),
                appearanceManager: createAppearanceManager(),
            });
        }
    });
    return managers;
};
