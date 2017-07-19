var mongoose = require("mongoose");

var ImageSchema = mongoose.Schema({
  url: String,
  description: String,
  likes: Number,
  owner: String         // email id of the owner
});

module.exports = Image = mongoose.model("image", ImageSchema);

// add an image
module.exports.addImage = (newImage, callback) => {
  newImage.save(callback);
}

// increase likes on your image by 1
module.exports.increaseLike = (id, callback) => {
  Image.update({_id: id}, {$inc: {likes: 1}}, callback);
}

// decrease likes on your image by 1
module.exports.decreaseLike = (id, callback) => {
  Image.update({_id: id}, {$inc: {likes: -1}}, callback);
}

// delete an image
module.exports.deleteImage = (id, email, callback) => {
  Image.findOne({_id: id}, (err, image) => {
    if (err) throw err;

    if (image) {
      if (image.owner == email) {
        Image.remove({_id: id}, callback);
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