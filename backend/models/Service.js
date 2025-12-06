import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Nouveaux champs
    location: { type: String, required: true }, // Ville/région
    sellerName: { type: String, required: true }, // Nom du vendeur
    sellerRating: { type: Number, default: 0 }, // Note du vendeur
    images: [{ type: String }], // URLs des images
    tags: [{ type: String }], // Mots-clés pour la recherche
    isActive: { type: Boolean, default: true } // Service actif/inactif
  },
  { timestamps: true }
);

export default mongoose.model("Service", ServiceSchema);