var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

var UserSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  liked: [],
  images: [],
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
module.exports.addImage = (id, email, callback) => {
  User.update({email: email}, {$push: {image: id}}, callback);
}

// delete an image
module.exports.deleteImage = (id, email, callback) => {
  User.findOne({email: email}, (err, user) => {
    if (err) throw err;

    // if user exists
    if (user) {
      let index = user.images;
      let images = user.images;

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
module.exports.addLikedImage = (id, email, callback) => {
  User.update({email: email}, {$push: {images: id}}, callback);
}