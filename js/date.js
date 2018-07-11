const timeAgo = require('timeago.js');
var dateFormat = require('dateformat');
var timeagoInstance = timeAgo();

function dateConversion(date){
    var tweetLongDate =dateFormat(date,'mmm dS yyyy');
    var nowLongDate = dateFormat(Date.now(),'mmm dS yyyy');
    if(nowLongDate === tweetLongDate){
         date = timeagoInstance.format(date, 'test_local');
        return date;
    }
    else{
        return dateFormat(date,'mmm dd');
    }
}

module.exports = dateConversion;