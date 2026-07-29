const Razorpay = require("razorpay");

const client = new Razorpay({
  key_id: "rzp_test_TJFl0AIerRNNTo",
  key_secret: "DjarlnlBYNdgA7WB59ZKkYP4",
});

client.orders.create({
  amount: 100,
  currency: "INR",
  receipt: "test_123",
}).then(console.log).catch(err => {
  console.error("RAZORPAY ERROR:", err);
});
