export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const user = await currentUser();
        
        if (!user) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const isSeller = await authSeller(user.id);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();

        // More efficient query - get orders that contain seller's products in one query
        const sellerOrders = await Order.find({})
            .populate({
                path: 'items.product',
                match: { userId: user.id } // Only populate products belonging to this seller
            })
            .then(orders => orders.filter(order => 
                order.items.some(item => item.product !== null) // Filter orders that have at least one product from this seller
            ));

        return NextResponse.json({ 
            success: true, 
            orders: sellerOrders 
        });

    } catch (error) {
        console.error("Error fetching seller orders:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const user = await currentUser();
        
        if (!user) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const isSeller = await authSeller(user.id);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { orderId, status, paymentStatus, cancellationReason } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
        }

        // First, verify the order contains seller's products
        const order = await Order.findById(orderId).populate('items.product');
        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        const hasSellerProducts = order.items.some(item => 
            item.product && item.product.userId === user.id
        );

        if (!hasSellerProducts) {
            return NextResponse.json({ success: false, message: 'Not authorized to update this order' }, { status: 403 });
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

        return NextResponse.json({ 
            success: true, 
            message: 'Order updated successfully',
            order: updatedOrder
        });

    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}