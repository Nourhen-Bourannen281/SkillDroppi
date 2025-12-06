import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    serviceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Service", 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    sellerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    comment: { 
      type: String, 
      default: "" 
    },
    likes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    dislikes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }]
  },
  { timestamps: true }
);

// Index pour éviter les doublons
ReviewSchema.index({ serviceId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", ReviewSchema);