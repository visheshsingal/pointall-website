import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { address, items } = await request.json();

        console.log("🔄 Creating order for user:", userId);
        console.log("📦 Order items:", items);

        if (!address || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid data' });
        }

        // ✅ DEBUG STOCK VALIDATION
        for (const item of items) {
            const product = await Product.findById(item.product);
            console.log("🔍 Checking product:", {
                productId: item.product,
                productName: product?.name,
                stockQuantity: product?.stockQuantity,
                requestedQuantity: item.quantity
            });

            if (!product) {
                console.log("❌ Product not found");
                return NextResponse.json({ 
                    success: false, 
                    message: `Product not found` 
                });
            }
            
            // Check if stock is available
            if (product.stockQuantity < item.quantity) {
                console.log("❌ Not enough stock");
                return NextResponse.json({ 
                    success: false, 
                    message: `Only ${product.stockQuantity} left for ${product.name}` 
                });
            }
        }

        console.log("✅ Stock validation passed");

        // Calculate amount
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                totalAmount += product.offerPrice * item.quantity;
            }
        }

        const finalAmount = totalAmount + Math.floor(totalAmount * 0.02);

        // ✅ CREATE ORDER IN DATABASE
        const order = await Order.create({
            userId: userId,
            items: items,
            amount: finalAmount,
            address: address,
            status: 'Order Placed',
            date: new Date()
        });

        console.log("✅ Order saved to DB with ID:", order._id);

        // ✅ UPDATE STOCK QUANTITIES
        for (const item of items) {
            const updatedProduct = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stockQuantity: -item.quantity } },
                { new: true } // Return updated document
            );
            console.log("📦 Stock updated for:", {
                product: item.product,
                newStock: updatedProduct.stockQuantity
            });
        }

        // Send to Inngest
        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                address,
                items,
                amount: finalAmount,
                date: Date.now()
            }
        });

        // Clear user cart
        const user = await User.findOne({ _id: userId });
        if (user) {
            user.cartItems = {};
            await user.save();
            console.log("🛒 Cart cleared");
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Order Placed', 
            orderId: order._id 
        });

    } catch (error) {
        console.log("❌ Order creation error:", error);
        return NextResponse.json({ success: false, message: error.message });
    }
}