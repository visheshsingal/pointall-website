import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();

        // Get orders that contain seller's products
        const allOrders = await Order.find({}).populate('address items.product');
        
        // Filter to only include orders with seller's products
        const sellerOrders = allOrders.filter(order => 
            order.items.some(item => item.product && item.product.userId === userId)
        );

        return NextResponse.json({ 
            success: true, 
            orders: sellerOrders 
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// ADD PUT METHOD TO THE SAME FILE FOR UPDATES
export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { orderId, status, paymentStatus, cancellationReason } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
        }

        // Update the order
        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (cancellationReason) updateData.cancellationReason = cancellationReason;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        ).populate('address items.product');

        if (!updatedOrder) {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Order updated successfully',
            order: updatedOrder
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}