import {createApi, createStore} from 'effector';
import {SessionPlaceholderModel} from "../session";
import {isArray} from "../../../helpers/isArray";
import {isObject} from "../../../helpers/isObject";
import {Dict} from "../../types";

export type Placeholders = Dict<string>;
type PlaceholdersState = {default: Placeholders, user: Placeholders};
const $placeholders = createStore<PlaceholdersState>({default: {}, user: {}});

const {sdkPlaceholdersChanged, addDefaultPlaceholders} = createApi($placeholders, {
    sdkPlaceholdersChanged: (state, data: Placeholders) => ({default: state.default, user: data}),
    addDefaultPlaceholders: (state, data: Array<SessionPlaceholderModel>) => {
        let _placeholders: PlaceholdersState = {default: {}, user: state.user};
        if (isArray(data)) {
            data.forEach(item => {
                if (isObject(item) && item['name'] !== undefined && item['default_value'] !== undefined) {
                    _placeholders.default[item['name']] = item['default_value'];
                }
            });
        }
        return _placeholders;
    }
});

export {$placeholders, sdkPlaceholdersChanged, addDefaultPlaceholders};
