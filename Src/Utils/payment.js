import Stripe from "stripe";

const paymentFunction = async ({
  payment_method_types = ["card"],
  mode = "payment",
  customer_email = "",
  metadata = {},
  success_url,
  cancel_url,
  discounts = [],
  line_items = [],
}) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email,
    metadata,
    success_url,
    cancel_url,
    discounts,
    line_items,
  });
  return paymentData;
};

export default paymentFunction;

// [{
//     price_data:{
//         currency,
//         product_data:{
//             name
//         },
//         unit_amount
//     },
//     quantity
// }]
