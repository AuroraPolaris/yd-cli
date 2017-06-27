const formatDate = (function () {
  const withZero = (n)=> n < 10 ? '0' + n : n;
  const dateGetter = {
    Y: (date) => date.getFullYear(),
    m: (date) => withZero(date.getMonth() + 1),
    d: (date) => withZero(date.getDate()),
    H: (date) => withZero(date.getHours()),
    i: (date) => withZero(date.getMinutes()),
    s: (date) => withZero(date.getSeconds()),
  }
  return function (date, format = '%Y-%m-%d %H:%i:%s') {
    return format.replace(/%([A-Za-z]?)/g,  (match, $1) => dateGetter[$1] ? dateGetter[$1](date) : $1);
  }
})();

module.exports = {
  formatDate
}
