var express = require("express");
var router = express.Router();
var Image = require("../models/image");
var User = require("../models/user");

// homapage
router.get("/", (req, res) => {
  // send all the images
  Image.getAllImages((err, images) => {
    if (err) throw err;

    // user logged in
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
  // if user not logged in, redirect to login and show error
  if (!req.user) {
    res.render("login", {
      error_msg: "You must log in to access this page"
    });
  }
  else {
    // extract image url and description
    let email = req.user.email;
    let imageUrl = req.body.imageUrl;
    let imageDescription = req.body.imageDescription;
    let time = new Date().getTime();

    if (imageDescription == '') {
      imageDescription = "An image by " + email.substring(0, email.indexOf("@"));
    }

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
      User.addImage(newImage, req.user.email, (err, msg) => {
        if (err) throw err;
        console.log(msg);
      });

      res.redirect("/");
    }
  }
});

// show a particular user's images
router.get("/myclicks", (req, res) => {
  // if user not logged in, redirect to login
  if (!req.user) {
    res.render("login", {
      error_msg: "You must log in to see this page"
    })
  }
  else {
    User.getUserByEmail(req.user.email, (err, user) => {
      if (err) throw err;

      if (user) {
        let images = user.images;

        res.render("myclicks", {
          images: JSON.stringify(images),
          user: user.email,
          userLiked: user.liked
        });
      }
      else {
        res.redirect("/");
      }
    });
  }
});

// TO REMOVE
router.get("/image", (req, res) => {
  if (!req.user) {
    res.end("failure");
  }
  else {
    let urlStart = req.url.indexOf("&url=");
    let time = req.url.substring(req.url.indexOf("time=") + 5, urlStart);
    let url = req.url.substring(urlStart + 5, req.url.length);

    if (time && url) {
      Image.getImage(decodeURIComponent(url), time, req.user.email, (err, image) => {
        if (err) throw err;

        if (image) {
          res.end(JSON.stringify(image)); 
        }
        else {
          res.end("failure");
        }
      });
    }
    // incorrect request send
    else {
      res.end("failure");
    }
  }
});

// delete a particular user's image
router.get("/delete", (req, res) => {
  // if user not logged in, return failure
  if (!req.user) {
    res.end("failure");
  }
  else {
    // extract time
    let time = req.url.substring(req.url.indexOf("time=") + 5, req.url.length);

    // if time is given
    if (time) {
      // delete image from database of images
      Image.deleteImage(time, req.user.email, (err, msg) => {
        if (err) throw err;
        console.log(msg);
      });

      // delete image from owner's records
      User.deleteImage(time, req.user.email, (err, msg) => {
        if (err) throw err;
        console.log(msg);
      });

      res.end("success");
    }
    else {
      res.end("failure");
    }
  }
});

module.exports = router;