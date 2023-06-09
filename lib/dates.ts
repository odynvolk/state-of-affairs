export const getBeginningOfDay = (date: Date) => {
  const beginningOfDay = new Date(date.getTime());
  beginningOfDay.setUTCHours(0, 0, 0, 0);

  return beginningOfDay;
};

export const getEndOfDay = (date: Date) => {
  const endOfDay = new Date(date.getTime());
  endOfDay.setUTCHours(23, 59, 59, 999);

  return endOfDay;
};

const ONE_DAY_IN_MILLISECONDS = 86400000;

export const getDateTimeline = (timeline: number) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);

  const dates: Date[] = [];
  for (let i = timeline; i > 0; i--) {
    const date = new Date(
      startDate.getTime() - (i * ONE_DAY_IN_MILLISECONDS),
    );
    dates.push(date);
  }

  return dates;
};

export const yearToDate = () => {
  const firstDay = getBeginningOfDay(new Date());
  firstDay.setMonth(0);
  firstDay.setDate(1);
  const today = getEndOfDay(new Date());

  return Math.round(Math.abs((firstDay.getTime() - today.getTime()) / ONE_DAY_IN_MILLISECONDS));
};
