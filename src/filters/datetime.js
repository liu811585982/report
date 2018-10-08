import * as moment from 'moment';

export function datetime (val, format) {
  const m = moment(val);
  if (m.isValid()) {
    return m.format(format || 'YYYY-MM-DD HH:mm:ss');
  }
}
