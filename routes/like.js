var express = require("express")
var router = express.Router();
var User = require("../models/user");
var Image = require("../models/image");

// handle requests for like and unlike pictures
router.get("/", (req, res) => {
  // user not logged in, return failure
  if (!req.user) {
    res.end("failure");
  }
  else {
    let email = req.user.email;
    
    // extract image information from url
    let timeStart = req.url.indexOf("&");
    let like = req.url.substring(req.url.indexOf("do") + 3, timeStart);
    
    let urlStart = req.url.indexOf("&url");
    let time = req.url.substring(timeStart+6, urlStart);
    let url = encodeURIComponent(req.url.substring(urlStart + 5, req.url.length));

    // if all 3 parameters are given
    if ((like == 0 || like == 1) && time && url) {
      // image has been liked
      if (like == 1) {
        User.addLikedImage(url, time, email, (err, msg) => {
          if (err) throw err;
          console.log(msg);
        });
      }
      // image has been unliked
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

// return number of likes on a particular image, identified by its time
router.get("/image", (req, res) => {
  // extract time
  let time = req.url.substring(req.url.indexOf("time=") + 5, req.url.length);

  // if image exist, return number of likes  
  Image.getLikes(time, (err, image) => {
    if (err) throw err;

    if (image) {
      res.json({likes: image.likes});
    }
    else {
      res.json({"failure": true});
    }
  });
});

module.exports = router;