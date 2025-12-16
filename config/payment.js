import axios from "axios";
//import Flutterwave from "flutterwave-node-v3";
export const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
});

const payment = await paystack.post("/transaction/initialize", {
    email: user.email,
    amount: total * 100, // convert Naira to Kobo
  });



