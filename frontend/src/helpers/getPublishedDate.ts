export default function getPublishedDate(date: string) {
  let dateNow = new Date(Date.now());
  let dateParam = new Date(date);
  let difference = Number(dateNow) - Number(dateParam);

  let oneDay = 24 * 60 * 60 * 1000;
  let oneHour = 60 * 60 * 1000;
  let oneMinute = 60 * 1000;

  if (difference > oneDay) {
    return `${dateParam.getMonth() + 1}/${dateParam.getDate()}`;
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
  return date;
}
