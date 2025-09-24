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

        // ⭐ ADD THIS LINE - Force fresh data
        await Order.findOne().limit(1);

        // Fetch orders with populated products and address
        const sellerOrders = await Order.find({})
            .populate({
                path: 'items.product',
                match: { userId: user.id },
            })
            .populate('address')
            .lean();

        // Filter orders that have at least one product from this seller
        const filteredOrders = sellerOrders.filter(order => 
            order.items.some(item => item.product !== null)
        );

        // Structure response with customer data from address
        const ordersWithCustomer = filteredOrders.map(order => {
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
                        country: ""
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

// PUT function remains same, no changes needed
export async function PUT(request) {
    // Your existing PUT code...
}