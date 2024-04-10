<template>
  <div class="stories-item" ref="storiesItem">
    <div class="stories-slide _dummy"></div>
  </div>
</template>
<script lang="ts">
import {Vue} from "vue-property-decorator"

const StoriesSliderBlank = Vue.extend({
  name: "StoriesSliderBlank",
});
export default StoriesSliderBlank;
</script>
<style lang="scss">
</style>
