const timeAgo = require("timeago.js");
var dateFormat = require("dateformat");

function dateConversion(date, format) {
  return dateFormat(date, format);
}

module.exports = dateConversion;
