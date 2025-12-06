import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  location: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  avatar: {
    type: String,
    default: ""
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  skills: [{

    type: String,

    trim: true

  }],
  securityQuestion: {
    type: String,
    default: "Quel est le nom de votre animal de compagnie ?"
  },
  securityAnswer: {
    type: String,
    required: true
  },
  // ⬇️ NOUVEAU CHAMP POUR LE QR CODE
  qrCode: {
    data: String,
    lastGenerated: Date
  }
}, {
  timestamps: true
});

export default mongoose.model("User", userSchema);