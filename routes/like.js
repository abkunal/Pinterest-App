var express = require("express")
var router = express.Router();
var User = require("../models/user");

router.get("/", (req, res) => {
  if (!req.user) {
    // redirect to login
    res.end("failure");
  }
  else {
    let email = req.user.email;
    
    // extract image information from url
    let timeStart = req.url.indexOf("&");
    let like = req.url.substring(req.url.indexOf("do") + 3, timeStart);
    
    let urlStart = req.url.indexOf("&url");
    let time = req.url.substring(timeStart+6, urlStart);
    let url = req.url.substring(urlStart + 5, req.url.length);

    console.log(like, time, url);

    // if all 3 parameters are given
    if (like == 0 || like == 1 && time && url) {
      // image liked
      if (like == 1) {
        User.addLikedImage(url, time, email, (err, msg) => {
          if (err) throw err;
          console.log(msg);
        });
      }
      // image unliked
      else {
        User.removeLikedImage(url, time, email, (err, msg) => {
          if (err) throw err;
          console.log(msg);
        });
      }

      res.end("success");
    }
    else {
      res.end("failure");
    }
  }
});

module.exports = router;