const express = require("express");
const Twit = require("twit");
const toDate = require("normalize-date");
const tweetDate = require("./date");
const bodyParser = require("body-parser");
//This holds config object
const config = require("./config"); //I placed config.js in js folder with app.js and date.js

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "pug");
app.use("/static", express.static("public"));
const T = new Twit(config);

app.get("/", (req, response) => {
  //========================================================================
  //Timeline Data
  /*
      message content
        # of retweets
        # of likes
        date tweeted
     */

  const statuses = T.get("statuses/user_timeline", { count: 5 }).then(value => {
    let textArr = [],
      userNames = [],
      screenNames = [],
      imageArr = [],
      retweetCounts = [], //# Of retweets
      likeArr = [], //# Of Likes
      timeArr = []; // #Date Tweeted
    function getRetweetData(dataObj, index) {
      const retweetObj = dataObj.retweeted_status;
      retweetCounts.push(retweetObj.retweet_count);
      likeArr.push(retweetObj.favorite_count);
      timeArr.push(tweetDate(retweetObj.created_at, "mmm dd, yyyy"));
      textArr.push(retweetObj.text);

      const retweetUserObj = retweetObj.user;
      userNames.push(retweetUserObj.name);
      screenNames.push(retweetUserObj.screen_name);
      imageArr.push(retweetUserObj.profile_image_url);

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
      timeArr.push(tweetDate(dataObj.created_at, "mmm dd, yyyy"));

      if (retweetCounts[index] === 0) {
        retweetCounts[index] = "";
      }
      if (likeArr[index] === 0) {
        likeArr[index] = "";
      }
    }

    for (let i = 0; i < 5; i++) {
      const dataObj = value.data[i];
      dataObj.hasOwnProperty("retweeted_status")
        ? getRetweetData(dataObj, i)
        : getTweetData(dataObj, i);
    }

    const userData = {
      textArr,
      userNames,
      screenNames,
      imageArr,
      retweetCounts,
      likeArr,
      timeArr
    };
    return userData;
  }).catch((err)=>{
    console.error(err);
    console.log("Timeline data extraction failed");
  }); // End of T.get timeline activity

  //==============================================
  //Displays how many users are followed.
  const following=
  T.get("friends/ids").then((value)=>{return value.data.ids.length;}).catch((err)=>{
    console.error(err);
    console.log("Following data extraction failed");
  });

  //==================================================
  //Gets the data of the authorized user.
  const accountData = T.get("users/show", {
    screen_name: "Mviana23008541"
  }).then(value => {
    //Return screen name of the user and the profile banner image url
    return [
      value.data.screen_name,
      value.data.profile_banner_url,
      value.data.profile_image_url
    ];
  }).catch((err)=>{
    console.error(err);
    console.log("Account data extraction failed");
  });
  //=====================================================================
  //Get 5 Most recent DMs
  /**
     * message body
        date the message was sent
        time the message was sent
     */

  const directMessages = T.get("direct_messages/events/list").then(
    value => {
      let dmArr = [];
      const arr = value.data.events;
      for (let i = 0; i < 5; i++) {
        dmArr.push({
          //Message Text
          text: arr[i].message_create.message_data.text,
          //Date Message was sent
          time: tweetDate(
            //Converts the date
            toDate(
              //Convert time stamp
              arr[i].created_timestamp
            ),
            "h:mm TT"
          ),
          date: tweetDate(arr[i.created_timestamp], "mmm dd, yyyy", false),
          // userPicture: T.get('users/show',{id:})
          id: arr[i].message_create.sender_id
        });
      }
      return dmArr;
    },
    () => {
      //If an error occurs with extracting messages the returned array will be empty.
      console.log("Direct Messages error;");
      return [];
    }
  ).catch((err)=>{
    console.error(err);
    console.log("Direct Messages data extraction failed");
  });;

  //===========================================================
  //Get 5 Most recent friends
  /**
  profile image
  real name
  screen name
     */

  const friends = T.get("friends/list", { count: 5 }).then(value => {
    let followers = [];
    value.data.users.forEach(element => {
      var str = element.profile_image_url.toString();
      var res = str.replace("normal.jpg", "bigger.jpg");
      followers.push({
        //Screen name
        screenName: element.screen_name,
        //User name
        name: element.name,
        //Profile avatar
        profileImg: res
      });
    });
    return followers;
  });
  const imgArr = directMessages.then(val => {
    let imgArr = [];
    for (let i = 0; i < val.length; i++) {
      imgArr.push(
        T.get("users/show", { id: val[i].id }).then(value => {
          return value.data.profile_image_url;
        })
      );
    }
    var promises = Promise.all(imgArr);
    return promises;
  });
  //======================================================

  Promise.all([accountData, statuses, directMessages, friends, imgArr,following]).then(
    function(values) {
      const userData = values[1]; //Timeline.pug
      //Values[1] = following
      userData["userScreenName"] = values[0]; //head.pug
      userData["messageData"] = values[2]; //dm.pug
      userData["follows"] = values[3]; //following.pug
      userData["imgArr"] = values[4];
      userData['following'] = values[5];
      //===============================================
      //========================================

      response.render("layout", userData); //Render data onto the page
   
    }).catch((err)=>{
      console.error(err);
      console.log("Promise array of all promises failed");
    });

     //=========================================
      //If the user tries to enter any route a 404 error will occur.
      app.use((req, res, next) => {
        const err = new Error("Not Found");
        err.status = 404;
        next(err);
      });

      app.use((err, req, res, next) => {
        res.locals.error = err;
        res.status(err.status);
        res.render("error");
      });
      //=================================
});
//=============================================
//When user posts a tweet it redirects the user to index page and updates the timeline
app.post("/", (req, res) => {
  T.post(
    "statuses/update",
    { status: `${req.body.tweet}` },
    () => {
      console.log("Tweet has been posted");
      res.redirect("/");
    },
    function() {
      console.log("Error in tweet");
    }
  );
});
//===============================================
//Loads application on client server - localhost:3000

app.listen(3000, () => {
  console.log("The application is running on localhost:3000!");
});
