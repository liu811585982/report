<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker v-model="startAndEndTime" type="datetimerange" :picker-options="pickerOptions"
        range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right">
      </el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="resetQuery">搜索</el-button>
      <el-button type="success" v-waves icon="el-icon-download" :loading="loading" @click="exportToExcel">导出</el-button>
    </div>
    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column :index="indexTableRow" type="index" width="80"></el-table-column>
      <el-table-column prop="createdAt" label="日期"></el-table-column>
      <el-table-column prop="question" label="问题"></el-table-column>
      <el-table-column prop="rate" label="评价"></el-table-column>
      <el-table-column prop="area" label="区域"></el-table-column>
      <el-table-column prop="ip" label="IP"></el-table-column>
      <el-table-column label="渠道">
        <template slot-scope="scope">
          <span>{{ scope.row.sourceChannel | source }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="startEnd" label="对话开始时间—对话结束时间" width="320"></el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope"><el-button @click="showTopicMessages(scope.row.topicId)" type="button" size="small">详情</el-button></template>
      </el-table-column>
    </el-table>
    <br>
    <el-pagination @size-change="changePageSize" @current-change="changePageNo"
      :current-page="pageNo" :page-sizes="[20, 50, 100]" :page-size="20" :total="total"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <el-dialog title="对话内容详情" width="75%" :visible.sync="dialogVisible">
      <bubble-list :messages="messages"></bubble-list>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">关  闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import XLSX from 'xlsx';
import { countFaqRecord, queryFaqRecord, getTopicTranscript } from '@/api/stats';
import BubbleList from '@/components/BubbleList';
import * as moment from 'moment';
import { Message } from 'element-ui';

const now = new Date();
const lastWeek = new Date(now.getTime() - 3600 * 1000 * 24 * 7);

export default {
  name: 'StatsFaqRecord',
  components: {
    BubbleList
  },
  data () {
    return {
      loading: true,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick (picker) {
            const end = now;
            const start = lastWeek;
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick (picker) {
            const end = now;
            const start = moment(end).subtract(1, 'months').toDate();
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近两个月',
          onClick (picker) {
            const end = now;
            const start = moment(end).subtract(2, 'months').toDate();
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      startAndEndTime: [lastWeek, now],
      pageSize: 20,
      pageNo: 1,
      total: 0,
      tableData: [],
      dialogVisible: false,
      messages: []
    };
  },
  mounted () {
    this.resetQuery();
  },
  methods: {
    async resetQuery () {
      this.pageNo = 1;
      this.start = this.startAndEndTime[0];
      this.end = this.startAndEndTime[1];
      await this.count();
      await this.query();
    },
    query () {
      this.startAndEndTime = [this.start, this.end]; // 用户更改了查询日期但没有提交时，恢复原来的时间区间
      if (moment(this.start).add(2, 'months').isBefore(this.end)) {
        Message.warning('起止时间间隔不能超过2个月');
        return;
      }

      const json = JSON.stringify({
        start: this.start,
        end: this.end,
        pageNo: this.pageNo - 1,
        pageSize: this.pageSize
      });

      /**
       * 更改分页条目数量时， 同时会更改页码为1， 就会产生重复请求
       * 这里是避免重复请求相同的查询
       */
      if (this.lastQueryParams !== json) {
        this.lastQueryParams = json;
        queryFaqRecord(this.start, this.end, this.pageNo - 1, this.pageSize)
          .then(list => {
            this.loading = false;
            list.forEach(e => {
              const start = moment(e.startedAt);
              e.area = e.province + ' ' + e.city;
              e.createdAt = moment(e.createdAt).format('YYYY-MM-DD HH:mm:ss');
              if (e.endedAt) {
                const end = moment(e.endedAt);
                e.duration = end.diff(start, 'seconds');
                e.duration = `${Math.floor(e.duration / 60)}分${e.duration % 60}秒`;
                e.startEnd = start.format('YYYY-MM-DD HH:mm:ss') + end.format('YYYY-MM-DD HH:mm:ss');
              } else {
                e.duration = '';
                e.startEnd = start.format('YYYY-MM-DD HH:mm:ss');
              }
              e.rate = {
                resolved: '已解决',
                notClear: '未解决',
                irrelevantAnswer: '答非所问',
                tooComplicatedToUnderstand: '太复杂看不懂',
                tooSimpleToSolveTheProblem: '太简单没解决问题',
                notSatisfiedWithProductProcess: '对产品流程不满意',
                otherReason: '其他原因'
              }[e.rate];
            });
            this.tableData = list;
          });
      }
    },
    count () {
      const start = this.startAndEndTime[0].getTime();
      const end = this.startAndEndTime[1].getTime();
      countFaqRecord(start, end)
        .then(count => {
          this.total = count;
        });
    },
    changePageSize (size) {
      this.pageSize = size;
      this.pageNo = 1;
      this.query();
    },
    changePageNo (pageNo) {
      this.pageNo = pageNo;
      this.query();
    },
    indexTableRow (index) {
      return (this.pageNo - 1) * this.pageSize + index + 1;
    },
    showTopicMessages (topicId) {
      getTopicTranscript(topicId).then(list => {
        this.messages = list;
        this.dialogVisible = true;
      });
    },
    async queryNoPage () {
      this.loading = true;
      const list = await queryFaqRecord(this.start, this.end, 0, this.total);
      this.loading = false;
      this.exportData = list || [];
      this.exportData.forEach((e) => {
        const start = moment(e.startedAt);
        e.area = e.province + ' ' + e.city;
        e.createdAt = moment(e.createdAt).format('YYYY-MM-DD HH:mm:ss');
        if (e.endedAt) {
          const end = moment(e.endedAt);
          e.duration = end.diff(start, 'seconds');
          e.duration = `${Math.floor(e.duration / 60)}分${e.duration % 60}秒`;
          e.startEnd = start.format('YYYY-MM-DD HH:mm:ss') + end.format('YYYY-MM-DD HH:mm:ss');
        } else {
          e.duration = '';
          e.startEnd = start.format('YYYY-MM-DD HH:mm:ss');
        }
        e.rate = {
          resolved: '已解决',
          notClear: '未解决',
          irrelevantAnswer: '答非所问',
          tooComplicatedToUnderstand: '太复杂看不懂',
          tooSimpleToSolveTheProblem: '太简单没解决问题',
          notSatisfiedWithProductProcess: '对产品流程不满意',
          otherReason: '其他原因'
        }[e.rate];
      });
    },
    async exportToExcel () {
      const data = [];
      data[0] = [
        '#',
        '日期',
        '问题',
        '评价',
        '区域',
        'IP',
        '渠道',
        '对话开始时间-对话结束时间'
      ];
      await this.queryNoPage();
      this.exportData.forEach((item, index) => {
        data.push([
          (index + 1) + '',
          item.createdAt,
          item.question,
          item.rate,
          item.area,
          item.ip,
          this.$options.filters.source(item.sourceChannel),
          item.startEnd
        ]);
      });
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws['!cols'] = [
        {width: 10}, {width: 20}, {width: 25}, {width: 15},
        {width: 20}, {width: 15}, {width: 15}, {width: 25}
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'FAQ话题访问明细');
      const wbout = XLSX.write(wb, {type: 'array', bookType: 'xlsx'});
      window.saveAs(new Blob([wbout], {type: 'application/octet-stream'}), 'FAQ话题访问明细.xlsx');
    }
  }
};
</script>
