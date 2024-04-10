import {Module as VuexModule } from "vuex";
import RootState from "./rootState";

export interface UserState {
    deviceId: number|null;
}

const module: VuexModule<UserState, RootState> = {
  namespaced: true,
  state: {
    deviceId: null,
  },
  getters: {
    deviceId: (state: UserState) => state.deviceId,
  },
  /** ns https://morningstar.engineering/managing-your-vue-js-applications-state-with-vuex-part-2-5e5c3a0cd507 */
  /** https://stackoverflow.com/questions/40390411/vuex-2-0-dispatch-versus-commit */
  // synchronous and freeze frontend
  mutations: {
    updateDeviceId(state: UserState, deviceId) {
      state.deviceId = deviceId;
    },
  },
  actions: {
    updateDeviceId(context, deviceId) {
      context.commit('updateDeviceId', deviceId);
    }
  }
};

export default module;