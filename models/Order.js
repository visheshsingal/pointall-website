// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true, 
        ref: 'User' // Consistent naming
    },
    items: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId,
            required: true, 
            ref: 'Product' // Capitalize to match model name
        },
        quantity: { 
            type: Number, 
            required: true 
        }
    }],
    amount: { 
        type: Number, 
        required: true 
    },
    address: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address', // Capitalize to match model name
        required: true 
    },
    status: { 
        type: String, 
        required: true, 
        default: 'Order Placed',
        enum: ['Order Placed', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    },
    paymentStatus: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'paid', 'failed']
    },
    cancellationReason: {
        type: String
    },
    date: { 
        type: Date,
        default: Date.now 
    },
});

// Use consistent naming - capitalize model names
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;