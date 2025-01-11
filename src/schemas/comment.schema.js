const mongoose = require('../../mongodb_init');
const { String, ObjectId } = mongoose.Schema.Types;

const commentSchema = new mongoose.Schema(
  {
    creator: {
      type: ObjectId,
      required: true,
      ref: 'users',
    },
    post: {
      type: ObjectId,
      required: true,
      ref: 'Posts',
    },
    content: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

const Comment = mongoose.model('Comments', commentSchema);
module.exports = Comment;
