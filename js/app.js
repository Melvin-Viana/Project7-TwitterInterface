const express = require("express");
const Twit = require("twit");
const tweetDate = require("./date");
//This holds config object
const config = require("./config");

const app = express();

app.set("view engine", "pug");
app.use("/static", express.static("public"));

//===============================================
const T = new Twit(config);

//Get 5 Most recent tweets
/**
     * message content
        # of retweets
        # of likes
        date tweeted
     */

T.get("statuses/user_timeline", { count: 5 }, (err, data, res) => {
  let textArr = [];
  let userNames = [];
  let screenNames = [];
  let imageArr = [];
  let retweetCounts = [];
  let likeArr = [];
  let timeArr = [];
  function getRetweetData(dataObj, index) {
    const retweetObj = dataObj.retweeted_status;
    retweetCounts.push(retweetObj.retweet_count);
    likeArr.push(retweetObj.favorite_count);
    timeArr.push(tweetDate(retweetObj.created_at));
    const retweetUserObj = retweetObj.user;
    userNames.push(retweetUserObj.name);
    screenNames.push(retweetUserObj.screen_name);
    imageArr.push(retweetUserObj.profile_image_url);
    textArr.push(retweetObj.text);

    if (retweetCounts[index] === 0) {
      retweetCounts[index] = "";
    }
    if (likeArr[index] === 0) {
      likeArr[index] = "";
    }
  }
  function getTweetData(dataObj, index) {
    const userObj = dataObj.user;
    userNames.push(userObj.name);
    screenNames.push(userObj.screen_name);
    imageArr.push(userObj.profile_image_url);
    retweetCounts.push(userObj.retweet_count);
    likeArr.push(userObj.favorite_count);
    textArr.push(dataObj.text);
    timeArr.push(tweetDate(dataObj.created_at));

    if (retweetCounts[index] === 0) {
      retweetCounts[index] = "";
    }
    if (likeArr[index] === 0) {
      likeArr[index] = "";
    }
  }

  for (let i = 0; i < 5; i++) {
    const dataObj = data[i];

    dataObj.hasOwnProperty("retweeted_status")
      ? getRetweetData(dataObj, i)
      : getTweetData(dataObj, i);
  }

  //====================================================================================
  //Get 5 Most recent friends

  /**
* profile image
real name
screen name
     */
  
  
   //Displays how many users are followed.
   T.get("friends/ids", (err, data, res) => {
    following=data.ids.length;
  });

  //Displays userName at the top right corner.
  T.get("account/verify_credentials", (err, data, res) => {
    userScreenName = data.screen_name;
  });
  const userData = {
    textArr,
    userNames,
    screenNames,
    imageArr,
    retweetCounts,
    likeArr,
    timeArr
  };
  T.get('friends/list',
  {count:5},
  (err,data,res)=>{let followers =[]
      data.users.forEach((element)=>{
        followers.push(element.screen_name);
      })
      userData['followers']=followers;
  });
 
  //====================================================================================
  app.get("/", (req, res) => {
    res.render("layout", userData);
  }); //End of app.get('/')
}); // End of T.get timeline activity

//Get 5 Most recent DMs
/**
     * message body
        date the message was sent
        time the message was sent
     */

//===============================================
//Loads application on client server - localhost:3000

app.listen(3000, () => {
  console.log("The application is running on localhost:3000!");
});
