import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["current", "savings"],
      default: "current",
    },
    balance: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    budget: {
      type: Number,
      default: null, // null means no budget set
    },
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);