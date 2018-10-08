<template>
  <span class="transfer-item">
    <el-button type="text" class="sort" icon="el-icon-sort-up" v-if="option.order > 0" :disabled="option.order <= 1" @click="handleSortUp"></el-button>
    <el-button type="text" class="sort" icon="el-icon-sort-down" v-if="option.order > 0" :disabled="option.order === length" @click="handleSortDown"></el-button>
    <span>{{option.label}}</span>
  </span>
</template>

<script>
  export default {
    name: 'transferItem',
    props: {
      option: {
        required: true
      },
      length: {
        type: Number,
        required: true
      }
    },
    data () {
      return {
        msg: 'Hello Item'
      };
    },
    created () {
      // console.log(this.option);
      // console.log(this.length);
    },
    methods: {
      handleSortUp () {
        this.$emit('sort', this.option, 'up');
      },
      handleSortDown () {
        this.$emit('sort', this.option, 'down');
      }
    }
  };
</script>

<style lang="scss" scoped>
  .transfer-item {
    .sort {
      padding: 0 !important;
    }
  }
</style>
