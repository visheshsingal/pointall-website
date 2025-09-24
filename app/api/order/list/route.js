import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not authenticated" });
        }

        await connectDB();

        // Find orders with string userId
        const orders = await Order.find({ userId }).sort({ date: -1 });

        // Manually populate the related data
        const populatedOrders = await Promise.all(
            orders.map(async (order) => {
                // Populate address
                const address = await Address.findOne({ _id: order.address });
                
                // Populate product details for each item
                const populatedItems = await Promise.all(
                    order.items.map(async (item) => {
                        const product = await Product.findOne({ _id: item.product });
                        return {
                            ...item.toObject(),
                            product: product ? {
                                _id: product._id,
                                name: product.name,
                                image: product.image,
                                offerPrice: product.offerPrice
                            } : null
                        };
                    })
                );

                return {
                    ...order.toObject(),
                    address: address ? {
                        _id: address._id,
                        fullName: address.fullName,
                        phoneNumber: address.phoneNumber,
                        pincode: address.pincode,
                        area: address.area,
                        city: address.city,
                        state: address.state
                    } : null,
                    items: populatedItems
                };
            })
        );

        return NextResponse.json({ success: true, orders: populatedOrders });

    } catch (error) {
        console.error("Order fetch error:", error);
        return NextResponse.json({ success: false, message: error.message });
    }
}