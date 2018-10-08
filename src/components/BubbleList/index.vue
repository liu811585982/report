<template>
  <div class="message-list">
    <div class="msg" v-for="msg of messages" :key="msg.creationTime + msg.direction" :class="msg.direction">
      <div class="content" v-html="msg.body"></div><br>
      <div class="tm">{{msg.creationTime | datetime}}</div>
    </div>
    <p v-show="!messages || !messages.length">没有对话消息或对话消息暂时不可见</p>
  </div>
</template>

<script>
export default {
  props: ['messages']
};
</script>

<style lang="scss">
.message-list {
  max-height: 500px;
  overflow: auto;

  .msg {
    padding: 5px 10px;
    position: relative;

    .content {
      padding: 5px;
      border-radius: 4px;
      display: inline-block;
      text-align: left;

      p {
        margin: 0;
      }
    }

    .tm {
      padding: 0 4px;
      background-color: #e2e2e2;
      border-radius: 2px;
      color: #666;
      font-size: 12px;
      display: inline-block;
    }

    &:nth-child(odd) {
      background-color: #F4F4F4;
    }

    &:nth-child(even) {
      background-color: #F5FAFA;
    }

    &.outbound .content {
      background-color: #FFF;
      border: 1px solid #CCC;
    }

    &.inbound {
      text-align: right;
    }

    &.inbound .content {
      background-color: #A2E563;
      border: 1px solid #86BD52;
    }
  }
}
</style>




