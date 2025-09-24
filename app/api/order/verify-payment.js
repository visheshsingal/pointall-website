import connectDB from "@/config/db";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: 'rzp_test_RKq2iERosq09RL',
  key_secret: 'hbRF6FDC9DYoePj1Eyhnx6ep'
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = body;

    // Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', 'hbRF6FDC9DYoePj1Eyhnx6ep')
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      await connectDB();
      
      // Update order payment status
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Payment verified successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Payment verification failed' 
      }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}