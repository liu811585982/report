<template>
  <span @mouseleave="active = false" @mouseenter="active = true">
    <span v-if="!isInput || column.property === 'interval'">
      <span @dblclick="dblclick">{{column.label}}</span>
      <i class="el-icon-tickets icon" @click="handleChart"
         v-if="interval !== 'realTime' && column.level === 1 && column.property !== 'interval'"></i>
    </span>
    <input type="text" v-else :style="style" v-model="value" @change="changed = true">
  </span>
</template>

<script>
  export default {
    name: 'ColumnHeader',
    props: {
      column: {
        required: true
      },
      interval: {
        type: String,
        required: true
      }
    },
    data () {
      return {
        isInput: false,
        value: '',
        active: false,
        changed: false
      };
    },
    computed: {
      style () {
        const width = this.column.label.length * 18;
        return `width: ${width}px`;
      }
    },
    created () {
      window.addEventListener('click', this.handleChange);
    },
    beforeDestroy () {
      window.removeEventListener('click', this.handleChange);
    },
    methods: {
      dblclick () {
        this.isInput = true;
        this.changed = false;
        this.value = this.column.label;
      },
      handleChange () {
        if (!this.active) {
          this.isInput = false;
          if (this.changed) {
            this.changed = false;
            this.$emit('change', this.value, this.column);
          }
        }
      },
      handleChart () {
        const scope = {};
        scope.column = this.column;
        this.$emit('chart', scope);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .icon {
    cursor: pointer; color: #67C23A;
  }
</style>
