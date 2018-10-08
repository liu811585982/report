<template>
  <iframe :src="reportUrl" ref="iframe"></iframe>
</template>

<script>
export default {
  data () {
    return {
      reportUrl: window.topicReportUrl
    };
  },
  mounted () {
    this.$nextTick(this.resizeIframe);
    window.onresize = () => {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }

      this.resizeTimer = setTimeout(() => {
        this.resizeIframe();
        this.resizeTimer = null;
      }, 200);
    };
  },
  destroyed () {
    window.onresize = null;
  },
  methods: {
    resizeIframe () {
      const height = document.documentElement.clientHeight;
      const top = this.$refs.iframe.getBoundingClientRect().top;
      this.$refs.iframe.style.height = (height - top - 20) + 'px';
    }
  }
};
</script>

<style lang="postcss" scoped>
iframe {
  width: 100%;
  height: 400px;
  border: none;
}
</style>


