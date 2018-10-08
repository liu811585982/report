export function getKeyValue (obj, level, keyArr) {
  if (level > (keyArr.length - 1)) {
    return;
  }
  const key = keyArr[level];
  if (!obj.hasOwnProperty(key)) {
    return;
  }
  if (typeof obj[key] === 'object') {
    level++;
    return getKeyValue(obj[key], level, keyArr);
  } else {
    return obj[key];
  }
}
