<template>
  <svg aria-hidden="true" :style="svgStyle">
    <use :href="symbolId"  :height="height" :width="width" />
  </svg>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'SvgIcon',
  props: {
    prefix: {
      type: String,
      default: 'icon',
    },
    name: {
      type: String,
      required: true,
    },
    height:{
      type: String,
      default: '18px'
    },
    width:{
      type: String,
      default: '18px'
    }
  },
  computed: {
    svgStyle() {
      return {
        display: 'inline-block',
        verticalAlign: 'middle',
        width: this.width,
        height: this.height,
      }
    },
  },
  setup(props) {
    const symbolId = computed(() => `#${props.prefix}-${props.name}`)
    return { symbolId }
  },
})
</script>


<style scoped>

</style>