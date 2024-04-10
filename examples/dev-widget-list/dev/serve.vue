<script lang="ts">
import Vue from 'vue';
// Uncomment import and local "components" registration if library is not registered globally.
// import { SfcTestSample } from '@/entry.esm';



export default Vue.extend({
  name: 'ServeDev',
  components: {
   SfcTestSample,
  }
});
</script>

<template>
  <div id="app">
    <sfc-test-sample />
  </div>
</template>
