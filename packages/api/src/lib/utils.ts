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

export const getRemainingSeconds = (timeStamp: number) => {
  const currentTime = Date.now();
  const remainingSeconds = Math.floor((timeStamp - currentTime) / 1000);
  return remainingSeconds;
};
