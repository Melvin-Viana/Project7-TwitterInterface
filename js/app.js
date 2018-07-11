const express = require('express');
const Twit = require('twit');
const tweetDate = require('./date');

//This holds config object
const config = require('./config')

const app = express();

//Tweet Date
//console.log(tweetDate('Tue Jul 10 18:00:02 +0000 2018'));



app.set('view engine', 'pug');
app.use('/static', express.static('public'));

//===============================================
var T = new Twit(config); 

//Get 5 Most recent tweets
    /**
     * message content
        # of retweets
        # of likes
        date tweeted
     */
   

//Get 5 Most recent friends
/**
     * profile image
        real name
    screen name
     */
//Get 5 Most recent DMs
/**
     * message body
        date the message was sent
        time the message was sent
     */


  
  
   
//===============================================  
//Loads application on client server - localhost:3000
T.get('statuses/user_timeline',{count:2},(err,data,res)=>{
    const dataObj = data[0];
    var text =[dataObj.text];
    if(dataObj.hasOwnProperty('retweeted_status')){
        const retweet = dataObj.retweeted_status;
        user=retweet.user.name; 
        screenName = retweet.user.screen_name;
        image = retweet.user.profile_image_url;
        retweets =retweet.retweet_count;
        likes =  retweet.favorite_count;
    }
    app.get('/',(req,res)=>{   
        res.render('layout',{text});
    
    }) 
});

app.listen(3000, () => {
    console.log('The application is running on localhost:3000!')
});

