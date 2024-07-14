export const getLastDaysDate = (lastDaysCount: number) => {
  const lastDaysDate = new Date();
  lastDaysDate.setDate(lastDaysDate.getDate() - lastDaysCount);
  return lastDaysDate;
};

/**
 * The function `getCurrentMonthDaysArray` returns an array of the days of the current month in
 * descending order.
 * @returns The function `getCurrentMonthDaysArray` returns an array of the days of the current month
 * in descending order.
 */
export const getCurrentMonthDaysArray = () => {
  const currentMonthTotalDays = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();

  // get array of day of lastDaysLength days,
  // E.g if today is 24 then [24, 23, 22, 21, 20, 19, 18]
  return Array.from(
    { length: currentMonthTotalDays },
    (_, i) => currentMonthTotalDays - i,
  );
};

export function timeAhead(date: string | number | Date) {
  const seconds = Math.floor(
    (new Date(date).getTime() - new Date().getTime()) / 1000,
  );
  let interval = seconds / 31536000;
  if (interval > 1) {
    return `${Math.floor(interval)} years`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `${Math.floor(interval)} months`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `${Math.floor(interval)} days`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `${Math.floor(interval)} hours`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `${Math.floor(interval)} minutes`;
  }
  return `${Math.floor(seconds)} seconds`;
}
