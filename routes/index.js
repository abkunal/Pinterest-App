var express = require("express");
var router = express.Router();
var Image = require("../models/image");
var User = require("../models/user");

router.get("/", (req, res) => {
  Image.getAllImages((err, images) => {
    if (err) throw err;

    console.log(images);
    if (req.user) {

      res.render("index", {
        userLiked: req.user.liked,
        images: images,
        user: true
      }); 
    }
    else {
      res.render("index", {
        userLiked: [],
        images: images,
        user: false
      });
    }
  });
});

// add a new image
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

// show my images
router.get("/myclicks", (req, res) => {
  if (!req.user) {
    res.redirect("/");
  }
  else {
    User.getUserByEmail(req.user.email, (err, user) => {
      if (err) throw err;

      if (user) {
        let images = user.images;

        res.render("myclicks", {
          images: images
        });
      }
      else {
        res.redirect("/");
      }
    });
  }
});

module.exports = router;