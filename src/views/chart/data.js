export const keyArray = {
  firstLevel: ['visit', 'mobileVisit', 'mobileValidVisit', 'webVisit', 'webValidVisit', 'appVisit', 'appValidVisit',
    'touchScreenVisit', 'touchScreenValidVisit', 'wechatVisit', 'wechatValidVisit', 'botTopicSession',
    'faqTopicSession', 'chatTopicSession', 'botTopic', 'faqTopic', 'chatTopic', 'chatTopicByBot', 'validVisit'],
  thirdLevel: ['dissatisfiedWithBusinessRule', 'dissatisfiedWithStaff',
    'irrelevantAnswer', 'notClear', 'notSatisfiedWithProductProcess', 'otherReason',
    'resolved', 'satisfied', 'tooComplicatedToUnderstand',
    'tooSimpleToSolveTheProblem', 'verySatisfied']
};

export const columns = [
  {
    label: '在线客服请求量',
    key: 'visit',
    width: 140,
    index: 1
  },
  {
    label: '各渠道在线客服请求量',
    key: 'channels',
    index: 2,
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
    key: 'botChannels',
    index: 3,
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
    width: 160,
    index: 4
  },
  {
    label: '机器人转live800量',
    key: 'faqTopicSession',
    width: 140,
    index: 5
  },
  {
    label: '机器人对话后转人工量',
    key: 'chatTopic',
    width: 200,
    index: 6
  },
  {
    label: '有帮机器人转人工量',
    key: 'chatTopicByBot',
    width: 180,
    index: 7
  },
  {
    label: '机器人对话后评价总量',
    key: 'totalComment',
    width: 200,
    index: 8
  },
  {
    label: '机器人对话后未评价量',
    key: 'notRated',
    width: 200,
    index: 9
  },
  {
    label: '机器人对话后评价数量分布',
    key: 'botComment',
    index: 10,
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
    key: 'serviceComment',
    index: 11,
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
    width: 120,
    index: 12
  },
  {
    label: '有帮机器人负责话题对话量',
    key: 'botTopic',
    width: 240,
    index: 13
  },
  {
    label: '访客对机器人提问条数',
    key: 'botTotalTopic',
    width: 200,
    index: 14
  }
];

export const displayColumns = [
  'interval', 'visit', 'channels',
  'botChannels', 'botVisit', 'faqTopicSession',
  'chatTopic', 'chatTopicByBot', 'totalComment',
  'notRated', 'botComment', 'serviceComment',
  'validVisit', 'botTopic', 'botTotalTopic'
];
