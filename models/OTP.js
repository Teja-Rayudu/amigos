import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  // The user whose face was detected (needs to approve)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The post containing the face
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  // Who uploaded the post
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // 6-digit OTP
  otp: {
    type: String,
    required: true,
  },
  // Expiry time (5 minutes from creation)
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000),
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);

export default OTP;
