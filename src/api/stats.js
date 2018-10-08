import request from './request';
import * as moment from 'moment';

export function formatDate (date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 访客数量统计
 * @param {string} startTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {string} endTime 格式：yyyy-MM-dd HH:mm:ss
 */
export function countVisit (startTime, endTime) {
  return request({
    url: '/stats/visit/count',
    method: 'get',
    params: {
      startTime: formatDate(startTime),
      endTime: formatDate(endTime)
    }
  }).then(resp => resp.data);
}

/**
 * 访客记录查询
 * @param {string} startTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {string} endTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {number} pageNo 页码，从0开始
 * @param {number} pageSize 每页条目
 */
export function queryVisit (startTime, endTime, pageNo, pageSize) {
  return request({
    url: '/stats/visit',
    method: 'get',
    params: {
      startTime: formatDate(startTime),
      endTime: formatDate(endTime),
      pageNo,
      pageSize
    }
  }).then(resp => resp.data);
}

/**
 * 机器人话题访问数量统计
 * @param {string} startTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {string} endTime 格式：yyyy-MM-dd HH:mm:ss
 */
export function countBotRecord (startTime, endTime) {
  return request({
    url: '/stats/botRecord/count',
    method: 'get',
    params: {
      startTime: formatDate(startTime),
      endTime: formatDate(endTime)
    }
  }).then(resp => resp.data);
}

/**
 * 机器人客服访问记录查询
 * @param {string} startTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {string} endTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {number} pageNo 页码，从0开始
 * @param {number} pageSize 每页条目
 */
export function queryBotRecord (startTime, endTime, pageNo, pageSize) {
  return request({
    url: '/stats/botRecord',
    method: 'get',
    params: {
      startTime: formatDate(startTime),
      endTime: formatDate(endTime),
      pageNo,
      pageSize
    }
  }).then(resp => resp.data);
}

/**
 * 人工客服访问数量统计
 * @param {string} startTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {string} endTime 格式：yyyy-MM-dd HH:mm:ss
 */
export function countLiveAgentRecord (startTime, endTime) {
  return request({
    url: '/stats/liveAgentRecord/count',
    method: 'get',
    params: {
      startTime: formatDate(startTime),
      endTime: formatDate(endTime)
    }
  }).then(resp => resp.data);
}

/**
 * 人工客服访问记录查询
 * @param {string} startTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {string} endTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {number} pageNo 页码，从0开始
 * @param {number} pageSize 每页条目
 */
export function queryLiveAgentRecord (startTime, endTime, pageNo, pageSize) {
  return request({
    url: '/stats/liveAgentRecord',
    method: 'get',
    params: {
      startTime: formatDate(startTime),
      endTime: formatDate(endTime),
      pageNo,
      pageSize
    }
  }).then(resp => resp.data);
}

/**
 * 获取话题消息清单
 * @param {number} topicId 话题ID
 */
export function getTopicTranscript (topicId) {
  return request({
    url: `/topic/${topicId}/transcript`,
    method: 'get'
  }).then(resp => {
    const list = (resp.data.transcripts || []).sort((a, b) => a.creationTime - b.creationTime);
    let messages = [];
    list.forEach(v => {
      messages = messages.concat(v.messages.sort((a, b) => a.creationTime - b.creationTime));
    });
    return messages;
  }).catch(() => {
    return [];
  });
}

/**
 * FAQ访问数量统计
 * @param {string} startTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {string} endTime 格式：yyyy-MM-dd HH:mm:ss
 */
export function countFaqRecord (startTime, endTime) {
  return request({
    url: '/stats/faqRecord/count',
    method: 'get',
    params: {
      startTime: formatDate(startTime),
      endTime: formatDate(endTime)
    }
  }).then(resp => resp.data);
}

/**
 * FAQ访问记录查询
 * @param {string} startTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {string} endTime 格式：yyyy-MM-dd HH:mm:ss
 * @param {number} pageNo 页码，从0开始
 * @param {number} pageSize 每页条目
 */
export function queryFaqRecord (startTime, endTime, pageNo, pageSize) {
  return request({
    url: '/stats/faqRecord',
    method: 'get',
    params: {
      startTime: formatDate(startTime),
      endTime: formatDate(endTime),
      pageNo,
      pageSize
    }
  }).then(resp => resp.data);
}
