import request from './request';

export function realTimeReport () {
  return request({
    url: '/report/realtime',
    method: 'get'
  }).then(resp => resp.data);
}

export function intervalReport (params) {
  return request({
    url: '/report',
    method: 'get',
    params: params
  }).then(resp => resp.data);
}

export function defaultSetting (params) {
  return request({
    url: '/report/settings/default/' + params.vendorId,
    method: 'get'
  }).then(resp => resp.data);
}

export function chartSetting (params) {
  return request({
    url: '/report/settings/' + params.vendorId,
    method: 'get'
  }).then(resp => resp.data);
}

export function submitSetting (params) {
  return request({
    url: '/report/settings/' + params.vendorId,
    method: 'post',
    data: params.data
  }).then(resp => resp.data);
}
