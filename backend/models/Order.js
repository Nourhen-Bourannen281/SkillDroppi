import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    serviceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Service", 
      required: [true, "L'ID du service est requis"] 
    },
    buyerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "L'ID de l'acheteur est requis"] 
    },
    sellerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "L'ID du vendeur est requis"] 
    },
    price: { 
      type: Number, 
      required: [true, "Le prix est requis"],
      min: [0, "Le prix ne peut pas être négatif"]
    },
    status: { 
      type: String, 
      enum: ["pending", "in progress", "completed", "cancelled"], 
      default: "pending" 
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    }
  },
  { 
    timestamps: true 
  }
);

// Index pour améliorer les performances
OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ sellerId: 1, createdAt: -1 });
OrderSchema.index({ serviceId: 1 });
OrderSchema.index({ status: 1 });

export default mongoose.model("Order", OrderSchema);