const mongoose = require("mongoose");

// Create Mongoose schema
const commentSchema = new mongoose.Schema({
  body: String,
  time: String
})

const customerSchema = new mongoose.Schema({
  firstName: { type: String, require: true },
  lastName: { type: String, default: " " },
  reference: String,
  status: String,
  progress: { type: String, default: "Select Progress" },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});
// Create Mongoose model
const Customer = mongoose.model("Customer", customerSchema);
const Comment = mongoose.model("Comment", commentSchema);

module.exports = { Customer, Comment }