import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Le titre est requis"] 
    },
    completed: { 
      type: Boolean, 
      default: false 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
  },
  { 
    timestamps: true 
  }
);

// Index pour améliorer les performances
todoSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Todo", todoSchema);