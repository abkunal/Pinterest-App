var express = require("express");
var router = express.Router();
var Image = require("../models/image");
var User = require("../models/user");

router.get("/", (req, res) => {
  Image.getAllImages((err, images) => {
    if (err) throw err;

    console.log(images);
    res.render("index", {
      user: req.user,
      images: images
    });
  });
});


router.post("/add", (req, res) => {
  if (!req.user) {
    res.render("/", {
      error_msg: "You must log in to access this page"
    });
  }
  else {
    // extract image url and description
    let imageUrl = req.body.imageUrl;
    let imageDescription = req.body.imageDescription;
    let time = new Date().getTime();

    // if image url is empty, show error
    if (!imageUrl) {
      res.render("index", {
        error_msg: "Image URL must not be empty"
      });
    }
    else {
      // create a new image record
      var newImage = new Image({
        url: imageUrl,
        description: imageDescription,
        owner: req.user.email,
        time: time,
        likes: 0
      });

      // add image to database
      Image.addImage(newImage, (err, msg) => {
        if (err) throw err;
        console.log(msg);
      });
      
      // add image to user's images
      User.addImage(imageUrl, time, req.user.email, (err, msg) => {
        if (err) throw err;
        console.log(msg);
      });

      res.redirect("/");
    }
  }
});

module.exports = router;