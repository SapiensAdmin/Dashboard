export function formatMonthYear(dateStr) {
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const mon = date.toLocaleString('en-US', { month: 'short' });
  const yy = year.slice(2);
  return `${mon} ${yy}`;
}

export function formatNumber(value, decimals = 2) {
  return Number(value).toFixed(decimals);
}
