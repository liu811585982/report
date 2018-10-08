<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" class="demo-form-inline" v-model="searchData">
        <el-form-item label="颗粒度">
          <el-select placeholder="颗粒度" v-model="searchData.interval" clerable @change="onChangeInterval">
            <el-option v-for="(item,index) in interval" :label="item.label" :value="item.value" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间" v-show="searchData.interval !== 'realTime'">
          <el-date-picker type="datetimerange" align="left" clerable v-model="searchData.dateRange"
                          range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-waves icon="el-icon-search" :loading="loading" @click="isInput = false">确定</el-button>
          <el-button type="success" v-waves icon="el-icon-download" :loading="loading">导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <el-table
        :data="pageData"
        stripe
        style="width: 100%"
        v-loading="loading">
        <el-table-column
          v-for="item in columns"
          :key="item.key"
          :prop="item.key"
          :label="item.label"
          :width="item.width"
          :render-header="item.render">
          <el-table-column
            v-for="child in item.children"
            :key="child.key"
            :prop="child.key"
            :label="child.label"
            :width="child.width"
            :render-header="child.render">
          </el-table-column>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  /* eslint-disable */
  import ColumnHeader from './columnHeader';
  export default {
    name: 'BotChart',
    components: {
      ColumnHeader
    },
    data () {
      return {
        searchData: {
          dateRange: [],
          interval: 'realTime'
        },
        interval: [
          {
            label: '实时',
            value: 'realTime'
          },
          {
            label: '每半个小时',
            value: 'halfHour'
          },
          {
            label: '每日',
            value: 'day'
          },
          {
            label: '每月',
            value: 'month'
          }
        ],
        intervalLabel: '实时',
        loading: false,
        dialogVisible: false,
        pageSize: 20,
        pageNo: 1,
        total: 0,
        tableData: [],
        pageData: [],
        column: {},
        timer: 0,
        columns: [
          {
            label: '实时',
            key: 'interval',
            width: 100
          },
          {
            label: '在线客服请求量',
            key: 'visit',
            width: 140
          },
          {
            label: '各渠道在线客服请求量',
            children: [
              {
                label: '移动',
                key: 'mobileVisit'
              },
              {
                label: '微信',
                key: 'wechatVisit'
              },
              {
                label: 'PC',
                key: 'webVisit'
              },
              {
                label: 'app',
                key: 'appVisit'
              },
              {
                label: '触屏',
                key: 'touchScreenVisit'
              }
            ]
          },
          {
            label: '机器人渠道对话量',
            key: '',
            children: [
              {
                label: '移动',
                key: 'mobileValidVisit'
              },
              {
                label: '微信',
                key: 'wechatValidVisit'
              },
              {
                label: 'PC',
                key: 'webValidVisit'
              },
              {
                label: 'app',
                key: 'appValidVisit'
              },
              {
                label: '触屏',
                key: 'touchScreenValidVisit'
              }
            ]
          },
          {
            label: '有帮机器人接入量',
            key: 'botVisit',
            width: 160
          },
          {
            label: '机器人转live800量',
            key: 'faqTopicSession',
            width: 140
          },
          {
            label: '机器人对话后转人工量',
            key: 'chatTopic',
            width: 200
          },
          {
            label: '有帮机器人转人工量',
            key: 'chatTopicByBot',
            width: 180
          },
          {
            label: '机器人对话后评价总量',
            key: 'totalComment',
            width: 200
          },
          {
            label: '机器人对话后未评价量',
            key: 'notRated',
            width: 200
          },
          {
            label: '机器人对话后评价数量分布',
            key: '',
            children: [
              {
                label: '已解决',
                key: 'rate.value.resolved'
              },
              {
                label: '未解决',
                key: 'rate.value.notSatisfied'
              },
              {
                label: '答非所问',
                key: 'rate.value.irrelevantAnswer'
              },
              {
                label: '太复杂看不懂',
                key: 'rate.value.tooComplicatedToUnderstand',
                width: 120
              },
              {
                label: '太简单没解决问题',
                key: 'rate.value.tooSimpleToSolveTheProblem',
                width: 160
              },
              {
                label: '对产品流程不满意',
                key: 'rate.value.notSatisfiedWithProductProcess',
                width: 160
              },
              {
                label: '其他原因',
                key: 'rate.value.otherReason'
              }
            ]
          },
          {
            label: '人工客服对话后评价数量',
            key: '',
            children: [
              {
                label: '非常满意',
                key: 'rate.value.verySatisfied'
              },
              {
                label: '满意',
                key: 'rate.value.satisfied'
              },
              {
                label: '对客服代表不满意',
                key: 'rate.value.dissatisfiedWithStaff',
                width: 160
              },
              {
                label: '对业务规定不满意',
                key: 'rate.value.dissatisfiedWithBusinessRule',
                width: 160
              }
            ]
          },
          {
            label: '机器人对话量',
            key: 'validVisit',
            width: 120
          },
          {
            label: '有帮机器人负责话题对话量',
            key: 'botTopic',
            width: 240
          },
          {
            label: '访客对机器人提问条数',
            key: 'botTotalTopic',
            width: 200
          }
        ],
        isInput: false,
        columnIndex: -1
      };
    },
    created () {
      this.columns.forEach(item => {
        item.render = this.renderHeader;
        if (item.children) {
          item.children.forEach(child => {
            child.render = this.renderHeader;
          });
        }
      });
    },
    methods: {
      render:  function(h, scope) {
        if (scope.$index === 0 && scope.column.level === 1) {
          return h('span', scope.column.label);
        } else {
          if (this.isInput) {
            if (this.column === scope.column) {

              let width = scope.column.width;
              if (!width) {
                width = 80;
              }
              width = width - 7 * 2 - 1;
              return h('input', {
                attrs: {
                  style: `width: ${width}px`
                }
              });
            } else {
              return h('span', scope.column.label);
            }
          } else {
            if (this.searchData.interval === 'realTime' || scope.column.level === 2) {
              return h('span', {
                on: {
                  dblclick: () => {
                    this.isInput = true;
                    this.column = scope.column;
                  }
                }
              }, scope.column.label);
            } else {
              return h('span', [
                h('span', {
                  on: {
                    dblclick: () => {
                      this.isInput = true;
                      this.column = scope.column;
                    }
                  }
                }, scope.column.label),
                h('i', {
                  attrs: {
                    class: 'el-icon-tickets',
                    style: 'cursor: pointer; color: #67C23A;'
                  },
                  on: {
                    click: () => {
                      alert('click');
                    }
                  }
                })
              ]);
            }
          }
        }
      },
      renderHeader (h, scope) {
        return h(ColumnHeader, {
          props: {
            column: scope.column,
            interval: this.searchData.interval
          },
          on: {
            change: this.onLabelChange
          }
        });
      },
      onChangeInterval () {
        switch (this.searchData.interval) {
          case 'realTime':
            this.columns[0].label = '实时';
            break;
          case 'halfHour':
            this.columns[0].label = '每半个小时';
            break;
          case 'day':
            this.columns[0].label = '每日';
            break;
          case 'month':
            this.columns[0].label = '每月';
            break;
        }
      },
      onLabelChange (value, column) {
        console.log(value);
        console.log(column);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .table-container {
    margin-top: 10px;
  }

  .footer {
    margin-top: 20px;
    text-align: right;
  }

  .chart {
    width: 100%;
    height: 100%;
  }
</style>
