var mongoose = require("mongoose");

var ImageSchema = mongoose.Schema({
  url: String,
  description: String,
  time: Number,         // Time in seconds to distinguish between same images
  likes: Number,
  owner: String         // email id of the owner
});

module.exports = Image = mongoose.model("image", ImageSchema);

// add an image
module.exports.addImage = (newImage, callback) => {
  newImage.save(callback);
}

// get an image information based on the time and owner email
module.exports.getImage = (time, email, callback) => {
  Image.findOne({time: time, owner: email}, {_id: 0}, callback);
}

// get image's likes
module.exports.getLikes = (time, callback) => {
  Image.findOne({time: time}, callback);
}

// get all images' information
module.exports.getAllImages = (callback) => {
  Image.find().select({_id: 0, url: 1, description: 1, time: 1, owner: 1, likes: 1}).exec(callback);
}

// increase likes on an image by 1
module.exports.increaseLike = (url, time, callback) => {
  Image.update({url: decodeURIComponent(url), time: time}, {$inc: {likes: 1}}, callback);
}

// decrease likes on an image by 1
module.exports.decreaseLike = (url, time, callback) => {
  Image.update({url: decodeURIComponent(url), time: time}, {$inc: {likes: -1}}, callback);
}

// delete an image
module.exports.deleteImage = (time, email, callback) => {
  // delete image from database if it exists.
  Image.findOne({time: time}, (err, image) => {
    if (err) throw err;

    if (image) {
      if (image.owner == email) {
        Image.remove({time: time}, callback);
      }
      else {
        console.log("deleteImage: You are not allowed to perform this action.");
      }
    }
    else {
      console.log("deleteImage: Image doesn't exist");
    }
  });
}