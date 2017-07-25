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

// get an image based on th
module.exports.getImage = (url, time, email, callback) => {
  Image.findOne({url: url, time: time, owner: email}, {_id: 0}, callback);
}

// get all images
module.exports.getAllImages = (callback) => {
  Image.find().select({_id: 0, url: 1, description: 1, time: 1, owner: 1, likes: 1}).exec(callback);
}

// increase likes on your image by 1
module.exports.increaseLike = (url, time, callback) => {
  Image.update({url: url, time: time}, {$inc: {likes: 1}}, callback);
}

// decrease likes on your image by 1
module.exports.decreaseLike = (url, time, callback) => {
  Image.update({url: url, time: time}, {$inc: {likes: -1}}, callback);
}

// delete an image
module.exports.deleteImage = (url, time, email, callback) => {
  Image.findOne({url: url, time: time}, (err, image) => {
    if (err) throw err;

    if (image) {
      if (image.owner == email) {
        Image.remove({url: url, time: time}, callback);
      }
      else {
        console.log("You are not allowed to perform this action.");
      }
    }
    else {
      console.log("Image doesn't exist");
    }
  });
}