export default function getPublishedDate(date: string, now = new Date()) {
  if (date) {
    // Force recognition of dates as UTC time. (Chrome interprets as local time otherwise.)
    date = date.split('Z')[0].concat('+00:00');

    let dateParam = new Date(date);
    let dateNow = new Date(now);
    let difference = Number(dateNow) - Number(dateParam);
    let oneDay = 24 * 60 * 60 * 1000;
    let oneHour = 60 * 60 * 1000;
    let oneMinute = 60 * 1000;

    if (difference < 0) {
      // handle minus diff
      return `${dateParam.getUTCMonth() + 1}/${dateParam.getUTCDate()}`;
    } else {
      if (difference > oneDay) {
        return `${dateParam.getUTCMonth() + 1}/${dateParam.getUTCDate()}`;
      } else {
        let hour = Math.floor(difference / 3600000);
        if (difference > oneHour) {
          return `${hour} hours ago`;
        } else if (difference > oneMinute) {
          return `${Math.floor(difference / 60000)} minutes ago`;
        } else {
          return `${Math.floor(difference / 1000)} seconds ago`;
        }
      }
    }
  }
  return date;
}
