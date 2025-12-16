import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },

    items: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
        },
        quantity: Number,
      },
    ],

    amount: Number,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "preparing", "on the way", "delivered", "cancelled"],
      default: "pending",
    },

    deliveryAddress: String,

    paymentReference: String, // Flutterwave/Paystack reference
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
