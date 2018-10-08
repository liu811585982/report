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
                          range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                          @change="getList">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-waves icon="el-icon-search" :loading="loading" @click="getList">查询</el-button>
          <el-button type="success" v-waves icon="el-icon-download" :loading="loading" @click="exportExcel">导出</el-button>
        </el-form-item>
      </el-form>
      <i class="el-icon-setting setting" @click="showTransferDialog"></i>
    </div>
    <div class="table-container">
      <el-table
        :data="pageData"
        stripe
        style="width: 100%"
        v-loading="loading">
        <el-table-column
          prop="interval"
          :label="getIntervalLabel(searchData.interval)"
          width="160">
        </el-table-column>
        <el-table-column
          v-for="(item,index) in columns"
          v-if="!item.parent"
          :key="index"
          :prop="item.field"
          :label="item.label"
          :width="item.width"
          :render-header="item.render">
          <el-table-column
            v-show="item.children"
            v-for="(child, iterator) in item.children"
            :key="iterator"
            :prop="child.field"
            :label="child.label"
            :width="child.width"
            :render-header="child.render">
          </el-table-column>
        </el-table-column>
      </el-table>
    </div>
    <div class="footer">
      <el-pagination @size-change="changePageSize" @current-change="changePageNo"
                     :current-page="pageNo" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total"
                     layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </div>
    <el-dialog
      :title="column.label"
      :visible.sync="dialogVisible"
      top="5%"
      width="70%"
      center>
      <div class="chart" ref="chart"></div>
    </el-dialog>
    <el-dialog
      title="编辑显示列"
      :visible.sync="transferDialogVisible"
      top="5%"
      width="80%"
      center>
      <div class="transfer" v-if="transferDialogVisible">
        <el-transfer v-model="transferColumns" :data="transferDefaultColumns" ref="transfer"
          :titles="['未展示', '已展示']"
          :props="{
            key: 'field',
            label: 'label'
          }"
          :render-content="renderTransfer"
          @change="onTransferChange">
        </el-transfer>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="transferDialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="transferColumns.length === 0" @click="handleSortConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { realTimeReport, intervalReport, chartSetting, submitSetting, defaultSetting } from '@/api/chart';
  import { getKeyValue } from '@/utils/util';
  import * as moment from 'moment';
  import echarts from 'echarts';
  import XLSX from 'xlsx';
  import { keyArray } from './data';
  import ColumnHeader from './columnHeader';
  import TransferItem from './transferItem';
  export default {
    name: 'BotChart',
    components: {
      ColumnHeader,
      TransferItem
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
        chart: null,
        column: {},
        timer: 0,
        columns: [],
        defaultColumns: [],
        transferDialogVisible: false,
        transferDefaultColumns: [],
        transferColumns: []
      };
    },
    created () {
      this.getDefaultSetting();
      this.getChartSetting();
      this.getRealTimeReport();
      this.timer = setInterval(this.getRealTimeReport, 60000);
    },
    methods: {
      getChartSetting () {
        const params = {
          vendorId: window.vendorId
        };
        chartSetting(params).then(data => {
          this.columns = data.reportFields.value;
          this.columns.forEach(item => {
            item.render = this.renderHeader;
            if (!item.hasChild) {
              item.width = 160;
            } else {
              item.children = [];
              for (let child of this.columns) {
                if (child.parent && child.parent === item.field) {
                  child.width = 100;
                  item.children.push(child);
                }
              }
            }
          });
        });
      },
      getDefaultSetting () {
        const params = {
          vendorId: window.vendorId
        };
        defaultSetting(params).then(data => {
          const columns = data.reportFields.value;
          this.defaultColumns = columns;
          console.log(this.defaultColumns);
        });
      },
      updateColumns (value, column) {
        this.columns.forEach(item => {
          if (item.field === column.property) {
            item.label = value;
          }
        });
        this.submitChartSetting(this.columns);
      },
      submitChartSetting (cols, reload) {
        const columns = JSON.parse(JSON.stringify(cols));
        columns.forEach(item => {
          delete item.width;
          delete item.render;
          delete item.children;
        });
        const params = {
          vendorId: window.vendorId,
          data: columns
        };
        submitSetting(params).then(data => {
          if (reload) {
            this.$router.go('/report/botChart');
          } else {
            this.getChartSetting();
          }
        });
      },
      showTransferDialog () {
        const defaultColumns = JSON.parse(JSON.stringify(this.defaultColumns));
        const columns = JSON.parse(JSON.stringify(this.columns));
        const rightColumns = columns.filter(item => {
          return !item.parent;
        });
        this.transferColumns = [];
        rightColumns.forEach(item => {
          this.transferColumns.push(item.field);
        });
        const transferDefaultColumns = defaultColumns.filter(item => {
          return !item.parent;
        });
        const leftColumns = transferDefaultColumns.filter(item => {
          return this.transferColumns.indexOf(item.field) === -1;
        });
        leftColumns.forEach(item => {
          item.order = 0;
        });
        this.transferDefaultColumns = [].concat(leftColumns).concat(rightColumns);
        this.transferDefaultColumns.sort(this.sortFunc);
        this.transferDialogVisible = true;
      },
      onChangeInterval () {
        if (this.searchData.interval === 'realTime') {
          if (!this.timer) {
            this.timer = setInterval(this.getRealTimeReport, 60000);
          }
        } else {
          clearInterval(this.timer);
          this.timer = 0;
        }
        if (this.searchData.dateRange.length === 0) {
          const now = new Date();
          this.searchData.dateRange = [
            new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            now
          ];
        }
        this.getList();
      },
      getRealTimeReport () {
        this.loading = true;
         realTimeReport().then(data => {
          this.loading = false;
          this.tableData = [];
          this.tableData.push(data);
          this.convertData(this.tableData);
          this.createIntervalLabel(this.tableData, 'realTime');
          this.initPageData(1, this.tableData);
        });
      },
      getIntervalReport () {
        this.loading = true;
        const params = {
          interval: this.searchData.interval
        };
        if (this.searchData.dateRange && this.searchData.dateRange.length > 0) {
          params.startTime = moment(this.searchData.dateRange[0]).format('YYYY-MM-DD HH:mm:ss');
          params.endTime = moment(this.searchData.dateRange[1]).format('YYYY-MM-DD HH:mm:ss');
        } else {
          this.$message({
            message: '请选择时间区间',
            type: 'warning'
          });
          this.loading = false;
          this.tableData = [];
          return;
        }
        intervalReport(params).then(data => {
          this.loading = false;
          this.tableData = data;
          this.convertData(this.tableData);
          this.createIntervalLabel(this.tableData, this.searchData.interval);
          this.initPageData(1, this.tableData);
        });
      },
      generatePercent (num1, num2) {
        if (Number(num2) === 0) {
          return 0;
        }
        let percent = Number(num1) / Number(num2) * 100;
        percent = (percent * 10).toFixed() / 10;
        return percent;
      },
      createIntervalLabel (array, type) {
        array.forEach((item) => {
          item.topicCount = item.botTopic + item.faqTopic;
          item.rate.value.notSatisfied = item.rate.value.notClear + item.rate.value.irrelevantAnswer +
            item.rate.value.tooComplicatedToUnderstand + item.rate.value.tooSimpleToSolveTheProblem +
            item.rate.value.notSatisfiedWithProductProcess + item.rate.value.otherReason;
          item.totalComment = item.rate.value.resolved + item.rate.value.notSatisfied;
          item.totalCommentPercent = this.generatePercent(item.totalComment, item.topicCount);
          item.notRated = item.topicCount - item.totalComment;
          item.notRatedPercent = ((100 - item.totalCommentPercent) * 10).toFixed() / 10;
          item.botVisit = item.visit;
          for (const key in item.rate.value) {
            const percent = key + 'Percent';
            if (key === 'verySatisfied' || key === 'satisfied' || key === 'dissatisfiedWithStaff' ||
              key === 'dissatisfiedWithBusinessRule') {
              item.rate.value[percent] = this.generatePercent(item.rate.value[key], item.chatTopic);
            } else {
              item.rate.value[percent] = this.generatePercent(item.rate.value[key], item.topicCount);
            }
          }
          switch (type) {
            case 'realTime':
              item.interval = moment(item.statsTime).format('YYYY-MM-DD HH:mm:ss');
              break;
            case 'halfHour':
              item.interval = moment(item.statsTime).format('MM-DD HH:mm') + '-' +
                moment(item.statsTime + 30 * 60 * 1000).format('HH:mm');
              break;
            case 'day':
              item.interval = moment(item.statsTime).format('YYYY-MM-DD');
              break;
            case 'month':
              item.interval = moment(item.startTime).format('YYYY-MM');
              break;
          }
        });
      },
      getIntervalLabel (value) {
        const arr = this.interval.filter((item) => {
          return item.value === value;
        });
        if (arr.length > 0) {
          return arr[0].label;
        }
        return '';
      },
      getList () {
        if (this.searchData.interval === 'realTime') {
          this.getRealTimeReport();
        } else {
          this.getIntervalReport();
        }
      },
      initPageData (pageNo, totalData) {
        this.loading = true;
        this.total = totalData.length;
        this.pageData = this.tableData.slice((this.pageNo - 1) * this.pageSize,
          this.pageNo * this.pageSize - 1);
        this.loading = false;
      },
      changePageSize (size) {
        this.pageSize = size;
        this.pageNo = 1;
        this.initPageData(this.pageNo, this.tableData);
      },
      changePageNo (pageNo) {
        this.pageNo = pageNo;
        this.initPageData(this.pageNo, this.tableData);
      },
      renderHeader (h, scope) {
        return h(ColumnHeader, {
          props: {
            column: scope.column,
            interval: this.searchData.interval
          },
          on: {
            chart: this.showChart,
            change: this.updateColumns
          }
        });
      },
      renderTransfer (h, option) {
        return h(TransferItem, {
          props: {
            option: option,
            length: this.transferColumns.length
          },
          on: {
            sort: this.sortOrder
          }
        });
      },
      sortOrder (option, direction) {
        let index = -1;
        for (let i = 0; i < this.transferDefaultColumns.length; i++) {
          if (this.transferDefaultColumns[i].field === option.field) {
            index = i;
            break;
          }
        }
        if (index !== -1) {
          if (direction === 'up') {
            const order = this.transferDefaultColumns[index - 1].order;
            this.transferDefaultColumns[index - 1].order = option.order;
            this.transferDefaultColumns[index].order = order;
          } else {
            const order = this.transferDefaultColumns[index + 1].order;
            this.transferDefaultColumns[index + 1].order = option.order;
            this.transferDefaultColumns[index].order = order;
          }
        }
        this.transferDefaultColumns.sort(this.sortFunc);
      },
      onTransferChange (value, direction, movedKeys) {
        this.sortTransferColumns(value, direction, movedKeys);
      },
      sortTransferColumns (value, direction, movedKeys) {
        // transferDefaultColumns 排序
        const leftColumns = this.transferDefaultColumns.filter(item => {
          return value.indexOf(item.field) === -1;
        });

        const rightColumns = this.transferDefaultColumns.filter(item => {
          return value.indexOf(item.field) !== -1;
        });

        leftColumns.forEach(item => {
          item.order = 0;
        });
        if (direction === 'left') {
          rightColumns.sort(this.sortFunc);
          rightColumns.forEach((item, index) => {
            item.order = index + 1;
          });
        } else {
          const maxOrder = value.length - movedKeys.length;
          rightColumns.forEach((item, index) => {
            if (movedKeys.indexOf(item.field) !== -1) {
              item.order = maxOrder + index + 1;
            }
          });
        }
        this.transferDefaultColumns = [].concat(leftColumns).concat(rightColumns);
        this.transferDefaultColumns.sort(this.sortFunc);
      },
      sortFunc (a, b) {
        return a.order - b.order;
      },
      handleSortConfirm () {
        console.log(this.defaultColumns);
        const columns = [];
        this.transferDefaultColumns.forEach(item => {
          if (item.order > 0) {
            columns.push(item);
            if (item.hasChild) {
              this.defaultColumns.forEach(child => {
                if (child.parent && child.parent === item.field) {
                  columns.push(child);
                }
              });
            }
          }
        });
        this.submitChartSetting(columns, true);
      },
      showChart (scope) {
        this.dialogVisible = true;
        this.$nextTick(() => {
          this.$refs.chart.style.height = (this.$refs.chart.clientWidth * 9) / 16 + 'px';
          this.initChart(scope);
        });
      },
      initChart (scope) {
        if (!this.chart) {
          this.chart = echarts.init(this.$refs.chart);
        }
        this.chart.clear();
        const option = this.generateOption(scope);
        this.chart.setOption(option);
      },
      generateOption (scope) {
        this.column = scope.column;
        const option = {
          color: ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          toolbox: {
            show: true,
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              dataView: {readOnly: false},
              magicType: {type: ['line', 'bar']},
              restore: {},
              saveAsImage: {}
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: [],
              axisTick: {
                alignWithLabel: true
              }
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: []
        };
        if (scope.column.children) {
          option.legend = {
            data: []
          };
          option.series = [];
          const length = scope.column.children.length;
          for (const child of scope.column.children) {
            option.legend.data.push(child.label);
            option.series.push({
              name: child.label,
              type: 'bar',
              barWidth: Math.floor(60 / length) + '%',
              data: []
            });
          }
        } else {
          option.legend = {
            data: [scope.column.label]
          };
          option.series = [
            {
              name: scope.column.label,
              type: 'bar',
              barWidth: '60%',
              data: []
            }
          ];
        }
        this.tableData.forEach((item, index) => {
          option.xAxis[0].data.push(item.interval);
          if (scope.column.children) {
            const length = scope.column.children.length;
            for (let i = 0; i < length; i++) {
              const keyArr = scope.column.children[i].property.split('.');
              option.series[i].data.push(getKeyValue(item, 0, keyArr));
            }
          } else {
            option.series[0].data.push(item[scope.column.property]);
          }
        });
        option.legend.left = 20;
        return option;
      },
      convertData (data) {
        data.forEach(item => {
          keyArray.firstLevel.forEach(key => {
            if (typeof item[key] === 'undefined') {
              item[key] = 0;
            }
          });
          if (!item.rate.value) {
            item.rate.value = {};
          }
          keyArray.thirdLevel.forEach(key => {
            if (typeof (item.rate.value[key]) === 'undefined') {
              item.rate.value[key] = 0;
            }
          });
        });
      },
      exportExcel () {
        const data = [];
        data[0] = [
          this.intervalLabel,
          '在线客服请求量',
          '各渠道在线客服请求量',
          '', '', '', '',
          '机器人渠道对话量',
          '', '', '', '',
          '有帮机器人接入量',
          '机器人转live800量',
          '机器人对话后转人工量',
          '有帮机器人转人工量',
          '机器人对话后评价总量',
          '机器人对话后未评价量',
          '机器人对话后评价数量分布',
          '', '', '', '', '', '',
          '人工客服对话后评价数量',
          '', '', '',
          '机器人对话量',
          '有帮机器人负责话题对话量',
          '访客对机器人提问条数'
        ];
        data[1] = [
          '', '',
          '移动',
          '微信',
          'PC',
          'app',
          '触屏',
          '移动',
          '微信',
          'PC',
          'app',
          '触屏',
          '', '', '', '',
          '已解决',
          '未解决',
          '答非所问',
          '太复杂看不懂',
          '太简单没解决问题',
          '对产品流程不满意',
          '其他原因',
          '非常满意',
          '满意',
          '对客服代表不满意',
          '对业务规定不满意',
          '', '', '', ''
        ];
        for (let item of this.tableData) {
          data.push([
            item.interval,
            item.visit,
            item.mobileVisit,
            item.wechatVisit,
            item.webVisit,
            item.appVisit,
            item.touchScreenVisit,
            item.mobileValidVisit,
            item.wechatValidVisit,
            item.webValidVisit,
            item.appValidVisit,
            item.touchScreenValidVisit,
            item.visit,
            item.faqTopicSession,
            item.chatTopic,
            item.chatTopicByBot,
            item.totalComment + '(' + item.totalCommentPercent + '%)',
            item.notRated + '(' + item.notRatedPercent + '%)',
            item.rate.value.resolved + '(' + item.rate.value.resolvedPercent + '%)',
            item.rate.value.notSatisfied + '(' + item.rate.value.notSatisfiedPercent + '%)',
            item.rate.value.irrelevantAnswer + '(' + item.rate.value.irrelevantAnswerPercent + '%)',
            item.rate.value.tooComplicatedToUnderstand + '(' + item.rate.value.tooComplicatedToUnderstandPercent + '%)',
            item.rate.value.tooSimpleToSolveTheProblem + '(' + item.rate.value.tooSimpleToSolveTheProblemPercent + '%)',
            item.rate.value.notSatisfiedWithProductProcess + '(' + item.rate.value.notSatisfiedWithProductProcessPercent + '%)',
            item.rate.value.otherReason + '(' + item.rate.value.otherReasonPercent + '%)',
            item.rate.value.verySatisfied + '(' + item.rate.value.verySatisfiedPercent + '%)',
            item.rate.value.satisfied + '(' + item.rate.value.satisfiedPercent + '%)',
            item.rate.value.dissatisfiedWithStaff + '(' + item.rate.value.dissatisfiedWithStaffPercent + '%)',
            item.rate.value.dissatisfiedWithBusinessRule + '(' + item.rate.value.dissatisfiedWithBusinessRulePercent + '%)',
            item.validVisit,
            item.botTopic,
            item.topicCount
          ]);
        }
        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!merges'] = [
          {
            s: {c: 0, r: 0}, e: {c: 0, r: 1}
          },
          {
            s: {c: 1, r: 0}, e: {c: 1, r: 1}
          },
          {
            s: {c: 2, r: 0}, e: {c: 6, r: 0}
          },
          {
            s: {c: 7, r: 0}, e: {c: 11, r: 0}
          },
          {
            s: {c: 12, r: 0}, e: {c: 12, r: 1}
          },
          {
            s: {c: 13, r: 0}, e: {c: 13, r: 1}
          },
          {
            s: {c: 14, r: 0}, e: {c: 14, r: 1}
          },
          {
            s: {c: 15, r: 0}, e: {c: 15, r: 1}
          },
          {
            s: {c: 16, r: 0}, e: {c: 16, r: 1}
          },
          {
            s: {c: 17, r: 0}, e: {c: 17, r: 1}
          },
          {
            s: {c: 18, r: 0}, e: {c: 24, r: 0}
          },
          {
            s: {c: 25, r: 0}, e: {c: 28, r: 1}
          },
          {
            s: {c: 29, r: 0}, e: {c: 29, r: 1}
          },
          {
            s: {c: 30, r: 0}, e: {c: 30, r: 1}
          },
          {
            s: {c: 31, r: 0}, e: {c: 31, r: 1}
          }
        ];
        ws['!cols'] = [
          {width: 20}, {width: 15}, {width: 10}, {width: 10},
          {width: 10}, {width: 10}, {width: 10}, {width: 10},
          {width: 10}, {width: 10}, {width: 10}, {width: 10},
          {width: 20}, {width: 20}, {width: 20}, {width: 20},
          {width: 20}, {width: 20}, {width: 10}, {width: 10},
          {width: 10}, {width: 15}, {width: 20}, {width: 20},
          {width: 15}, {width: 15}, {width: 10}, {width: 20},
          {width: 20}, {width: 15}, {width: 25}, {width: 20}
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '有帮机器人服务报表');
        const wbout = XLSX.write(wb, {type: 'array', bookType: 'xlsx'});
        window.saveAs(new Blob([wbout], {type: 'application/octet-stream'}), '有帮机器人服务报表.xlsx');
      }
    }
  };
</script>

<style lang="scss" scoped>
  .filter-container {
    position: relative;
    .setting {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 28px;
      cursor: pointer;
    }
  }

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

  .transfer {
    width: 700px;
    margin: 0 auto;
  }
</style>

<style>
  div.el-transfer div.el-transfer-panel {width: 300px;}
  div.el-transfer div.el-transfer-panel div.el-transfer-panel__body {height: 470px;}
  div.el-transfer div.el-transfer-panel div.el-transfer-panel__body div.el-transfer-panel__list {height: 100%;}
</style>
