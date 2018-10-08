<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker v-model="startAndEndTime" type="datetimerange" :picker-options="pickerOptions"
        range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right">
      </el-date-picker>

      <el-cascader
        size="large"
        placeholder="省市"
        :clearable="true"
        :options="areaOptions"
        v-model="selectedArea"
        @change="areaChanged">
      </el-cascader>
      <el-select v-model="sourceChannel" :clearable="true" placeholder="渠道">
        <el-option
          v-for="item in ['pcWeb', 'mobileWeb']"
          :key="item"
          :label="item"
          :value="item">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="resetQuery">搜索</el-button>
      <el-button style="margin-left: 0" @click="queryMore = !queryMore" v-text="queryMore ? '收起更多' : '更多查询'"></el-button>
      <el-button type="success" style="float: right;" v-waves icon="el-icon-download" :loading="loading" @click="exportToExcel">导出</el-button>
    </div>
    <br>
    <el-row :gutter="10" v-show="queryMore">
      <el-col :sm="6" :xs="12">
        <el-select v-model="os" :clearable="true" style="width: 100%;" placeholder="操作系统">
          <el-option
            v-for="item in ['windows', 'macosx', 'ios', 'android']"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-col>
      <el-col :sm="6" :xs="12">
        <el-select v-model="browser" :clearable="true" style="width: 100%;" placeholder="浏览器">
          <el-option
            v-for="item in ['chrome', 'ie', 'edge', 'firefox', 'safari']"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-col>
      <el-col :sm="6" :xs="12"><el-input v-model="ip" placeholder="IP"></el-input></el-col>
    </el-row>
    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column :index="indexTableRow" type="index" width="80"></el-table-column>
      <el-table-column prop="createdAt" label="日期"></el-table-column>
      <el-table-column prop="browser" label="浏览器"></el-table-column>
      <el-table-column prop="os" label="操作系统"></el-table-column>
      <el-table-column prop="area" label="区域"></el-table-column>
      <el-table-column prop="sourceChannel" label="渠道"></el-table-column>
      <el-table-column prop="ip" label="IP"></el-table-column>
    </el-table>
    <br>
    <el-pagination
      @size-change="changePageSize"
      @current-change="changePageNo"
      :current-page="pageNo"
      :page-sizes="[20, 50, 100]"
      :page-size="20"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { countVisit, queryVisit } from '@/api/stats';
import XLSX from 'xlsx';
import * as moment from 'moment';
import { Message } from 'element-ui';
import { provinceAndCityDataPlus, CodeToText } from 'element-china-area-data';

const now = new Date();
const lastWeek = new Date(now.getTime() - 3600 * 1000 * 24 * 7);

export default {
  name: 'StatsVisit',
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
      areaOptions: provinceAndCityDataPlus,
      selectedArea: [],
      startAndEndTime: [lastWeek, now],
      sourceChannel: null,
      ip: null,
      os: null,
      browser: null,
      queryMore: false,
      pageSize: 20,
      pageNo: 1,
      total: 0,
      tableData: [],
      exportData: []
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
        this.loading = false;
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
        queryVisit(this.start, this.end, this.pageNo - 1, this.pageSize)
          .then(list => {
            this.loading = false;
            list.forEach(e => {
              e.area = e.province + ' ' + e.city;
              e.browser = e.browser + ' ' + e.browserVersion;
              e.os = e.os + ' ' + e.osVersion;
              e.createdAt = moment(e.createdAt).format('YYYY-MM-DD HH:mm:ss');
            });
            this.tableData = list;
          });
      }
    },
    count () {
      const start = this.startAndEndTime[0].getTime();
      const end = this.startAndEndTime[1].getTime();
      countVisit(start, end)
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
    areaChanged (data) {
      let province = CodeToText[data[0]];
      let city = CodeToText[data[1]];
      if (['北京市', '上海市', '天津市', '重庆市'].indexOf(province) >= 0) {
        city = province;
        province = province.substr(0, 2);
      } else if (province === '全部') {
        province = city = null;
      } else if (city === '全部') {
        city = null;
      }
      console.log({ province, city });
    },
    async queryNoPage () {
      this.loading = true;
      const list = await queryVisit(this.start, this.end, 0, this.total);
      this.loading = false;
      this.exportData = list || [];
      this.exportData.forEach((e) => {
        e.area = e.province + ' ' + e.city;
        e.browser = e.browser + ' ' + e.browserVersion;
        e.os = e.os + ' ' + e.osVersion;
        e.createdAt = moment(e.createdAt).format('YYYY-MM-DD HH:mm:ss');
      });
    },
    async exportToExcel () {
      const data = [];
      data[0] = [
        '#',
        '日期',
        '浏览器',
        '操作系统',
        '区域',
        '渠道',
        'IP'
      ];
      await this.queryNoPage();
      this.exportData.forEach((item, index) => {
        data.push([
          (index + 1) + '',
          item.createdAt,
          item.browser,
          item.os,
          item.area,
          this.$options.filters.source(item.sourceChannel),
          item.ip
        ]);
      });
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws['!cols'] = [
        {width: 10}, {width: 25}, {width: 25}, {width: 20},
        {width: 20}, {width: 20}, {width: 20}
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '访客记录明细');
      const wbout = XLSX.write(wb, {type: 'array', bookType: 'xlsx'});
      window.saveAs(new Blob([wbout], {type: 'application/octet-stream'}), '访客记录明细.xlsx');
    }
  }
};
</script>

<style lang="scss" scoped>

</style>

