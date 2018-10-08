export function source (val) {
  switch (val) {
    case 'wechat':
      val = '微信';
      break;
    case 'pcWeb':
      val = 'PC';
      break;
    case 'mobileWeb':
      val = '移动';
      break;
    case 'app':
      val = 'App';
      break;
    case 'touchScreen':
      val = '触屏';
      break;
  }
  return val;
}
