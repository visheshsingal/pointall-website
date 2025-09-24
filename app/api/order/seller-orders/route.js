export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Order from "@/models/Order";
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

        // Fetch orders with populated products and address
        const sellerOrders = await Order.find({})
            .populate({
                path: 'items.product',
                match: { userId: user.id }, // Only populate products belonging to this seller
            })
            .populate('address') // Populate address reference
            .lean();

        // Filter orders that have at least one product from this seller
        const filteredOrders = sellerOrders.filter(order => 
            order.items.some(item => item.product !== null)
        );

        // Structure response with customer data from address
        const ordersWithCustomer = filteredOrders.map(order => {
            console.log(`Order ${order._id} address:`, JSON.stringify(order.address, null, 2)); // Debug log
            return {
                ...order,
                customer: {
                    fullName: order.address?.fullName || "N/A",
                    phoneNumber: order.address?.phoneNumber || "N/A",
                    shippingAddress: order.address ? {
                        addressLine1: order.address.area || "",
                        city: order.address.city || "",
                        state: order.address.state || "",
                        pincode: order.address.pincode || "",
                        country: "" // Address model lacks country
                    } : null
                },
            };
        });

        return NextResponse.json({ 
            success: true, 
            orders: ordersWithCustomer 
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

        // Verify the order contains seller's products
        const order = await Order.findById(orderId).populate('items.product').populate('address');
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
        ).populate('items.product').populate('address').lean();

        console.log(`Updated order ${updatedOrder._id} address:`, JSON.stringify(updatedOrder.address, null, 2)); // Debug log
        const responseOrder = {
            ...updatedOrder,
            customer: {
                fullName: updatedOrder.address?.fullName || "N/A",
                phoneNumber: updatedOrder.address?.phoneNumber || "N/A",
                shippingAddress: updatedOrder.address ? {
                    addressLine1: updatedOrder.address.area || "",
                    city: updatedOrder.address.city || "",
                    state: updatedOrder.address.state || "",
                    pincode: updatedOrder.address.pincode || "",
                    country: "" // Address model lacks country
                } : null
            },
        };

        return NextResponse.json({ 
            success: true, 
            message: 'Order updated successfully',
            order: responseOrder
        });

    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}