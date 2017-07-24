var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Image = require("./image");

var UserSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  liked: [],
  images: []            // [url, time]
});

module.exports = User = mongoose.model("imageuser", UserSchema);

// add/register a new user to the database
module.exports.createUser = (newUser, callback) => {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

// compare password for login and password change
module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
}

// get user by his/her email
module.exports.getUserByEmail = (email, callback) => {
  User.findOne({email: email}, callback);
}

// add an image
module.exports.addImage = (url, time, email, callback) => {
  User.update({email: email}, {$push: {images: [url, time]}}, callback);
}

// delete an image
module.exports.deleteImage = (url, time, email, callback) => {
  User.findOne({email: email}, (err, user) => {
    if (err) throw err;

    // if user exists
    if (user) {
      let index = -1;
      let images = user.images;

      for (let i in images) {
        if (images[i] == [url, time]) {
          index = i;
          break
        }
      }

      // image exists
      if (index > -1) {
        images.splice(index, 1);

        User.update({email: email}, {images: images}, callback);
      }
      else {
        console.log("Image not found");
      }
    }
    else {
      console.log("User not found");
    }
  });
}

// add an image to liked images if not already present
module.exports.addLikedImage = (url, time, email, callback) => {
  User.findOne({email: email}, (err, user) => {
    if (err) throw err;

    // if user exists
    if (user) {
      let index = user.liked.indexOf([url, time]);

      // if user haven't liked the image already
      if (index == -1) {
        User.update({email: email}, {$push: {liked: [url, time]}}, callback);
        Image.increaseLike(url, time, (err, msg) => {
          if (err) throw err;
          console.log(msg);
        });
      }
    }
  });
}

// remove an image from liked images
module.exports.removeLikedImage = (url, time, email, callback) => {
  User.findOne({email: email}, (err, user) => {
    if (err) throw err;

    // user exists
    if (user) {
      let liked = user.liked;
      let index = -1;

      for (let i in liked) {
        if (liked[i][1].toString() == time.toString()) {
          index = i;
          break;
        }
      }

      // given image present in liked images
      if (index > -1) {
        liked.splice(index, 1)

        User.update({email: email}, {liked: liked}, callback);
        Image.decreaseLike(url, time, (err, msg) => {
          if (err) throw err;
          console.log(msg);
        });
      }
      else {
        console.log("Image not present in liked images");
      }
    }
    else {
      console.log("User does not exists");
    }
  });
}