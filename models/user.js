var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

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
  User.update({email: email}, {$push: {image: [url, time]}}, callback);
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

// add an image to liked images
module.exports.addLikedImage = (url, time, email, callback) => {
  User.update({email: email}, {$push: {images: [url, time]}}, callback);
}