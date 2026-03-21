import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'Post must have an image'],
  },
  caption: {
    type: String,
    maxlength: [500, 'Caption cannot exceed 500 characters'],
    default: '',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  // Deep Shield face detection results
  detectedFaces: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    approved: { type: Boolean, default: false },
  }],
  // Post status: pending (awaiting OTP), approved (all faces approved), published
  status: {
    type: String,
    enum: ['pending', 'approved', 'published'],
    default: 'published',
  },
}, {
  timestamps: true,
});

// Index for feed queries
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
