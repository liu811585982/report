import Vue from 'vue';
import Router from 'vue-router';
/* Layout */
import Layout from '../views/layout/Layout';
const _import = require('./_import_' + process.env.NODE_ENV);
// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router);

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: _import('login/index'), hidden: true },
  { path: '/404', component: _import('404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/report',
    name: 'Dashboard',
    hidden: true,
    children: [{
      path: 'dashboard',
      component: _import('dashboard/index')
    }]
  },
   {
    path: '/stats',
    component: Layout,
    name: 'stats',
    meta: {
      title: '访问记录',
      icon: 'example'
    },
    children: [
      {
        path: 'visit',
        name: 'StatsVisit',
        component: _import('stats/visit'),
        meta: { title: '访客记录明细', icon: 'form' }
      },
      {
        path: 'botRecord',
        name: 'StatsBotRecord',
        component: _import('stats/bot'),
        meta: { title: '机器人话题记录明细', icon: 'form' }
      }, {
        path: 'liveAgent',
        name: 'StatsLiveAgent',
        component: _import('stats/liveAgent'),
        meta: { title: '人工客服请求记录明细', icon: 'form' }
      },
      {
        path: 'faq',
        name: 'StatsFaqRecord',
        component: _import('stats/faq'),
        meta: { title: 'FAQ话题访问明细', icon: 'form' }
      }
    ]
  },
  /* {
    path: '/reports',
    component: Layout,
    name: 'reports',
    meta: {
      title: '访问报表',
      icon: 'example'
    },
    children: [
      {
        path: 'visit',
        name: 'VisitReport',
        component: _import('stats/visitReport'),
        meta: { title: '访客报表', icon: 'form' }
      }, {
        path: 'topic',
        name: 'TopicReport',
        component: _import('stats/topicReport'),
        meta: { title: '话题报表', icon: 'form' }
      }
    ]
  }, */
  {
    path: '/report',
    component: Layout,
    name: 'Report',
    redirect: '/report/botChart',
    meta: { title: '服务报表', icon: 'example' },
    children: [
      {
        path: 'botChart',
        name: 'BotChart',
        component: _import('chart/botChart'),
        meta: {title: '机器人服务报表', icon: 'form'}
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
];

export default new Router({
  mode: 'history', // 后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
});
