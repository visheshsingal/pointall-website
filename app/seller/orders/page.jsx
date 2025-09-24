'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const Orders = () => {
    const { currency, getToken, user } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState("");

    // Order status options
    const statusOptions = [
        { value: "Order Placed", label: "Order Placed", color: "bg-yellow-100 text-yellow-800" },
        { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
        { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
        { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-800" },
        { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
        { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" }
    ];

    // Payment status options
    const paymentOptions = [
        { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
        { value: "paid", label: "Paid", color: "bg-green-100 text-green-800" },
        { value: "failed", label: "Failed", color: "bg-red-100 text-red-800" }
    ];

    const fetchSellerOrders = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            console.log("Fetching seller orders...");
            
            const { data } = await axios.get('/api/seller/orders', {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("Orders API response:", data);

            if (data.success) {
                setOrders(data.orders || []);
                toast.success("Orders loaded successfully");
            } else {
                toast.error(data.message || "Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error(error.response?.data?.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = await getToken();
            
            const { data } = await axios.put('/api/seller/orders', {
                orderId: orderId,
                status: newStatus
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (data.success) {
                setOrders(prev => prev.map(order => 
                    order._id === orderId ? { ...order, status: newStatus } : order
                ));
                toast.success(`Order status updated to ${newStatus}`);
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error(error.response?.data?.message || "Failed to update order status");
        }
    };

    // Update payment status
    const updatePaymentStatus = async (orderId, newPaymentStatus) => {
        try {
            const token = await getToken();
            
            const { data } = await axios.put('/api/seller/orders', {
                orderId: orderId,
                paymentStatus: newPaymentStatus
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (data.success) {
                setOrders(prev => prev.map(order => 
                    order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
                ));
                toast.success(`Payment status updated to ${newPaymentStatus}`);
            } else {
                toast.error(data.message || "Failed to update payment status");
            }
        } catch (error) {
            console.error("Error updating payment status:", error);
            toast.error(error.response?.data?.message || "Failed to update payment status");
        }
    };

    // Cancel order
    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error("Please select a cancellation reason");
            return;
        }

        try {
            const token = await getToken();
            
            const { data } = await axios.put('/api/seller/orders', {
                orderId: cancellingOrder,
                status: "cancelled",
                cancellationReason: cancelReason
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (data.success) {
                setOrders(prev => prev.map(order => 
                    order._id === cancellingOrder ? { 
                        ...order, 
                        status: "cancelled", 
                        cancellationReason: cancelReason 
                    } : order
                ));
                toast.success("Order cancelled successfully!");
                setCancellingOrder(null);
                setCancelReason("");
            } else {
                toast.error(data.message || "Failed to cancel order");
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error(error.response?.data?.message || "Failed to cancel order");
        }
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchTerm ? 
            order.items?.some(item => 
                item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            ) || 
            order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.address?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        if (user) {
            fetchSellerOrders();
        }
    }, [user]);

    // Safe order ID formatting
    const formatOrderId = (order) => {
        if (!order?._id) return "N/A";
        return `#${order._id.slice(-8).toUpperCase()}`;
    };

    // Safe date formatting
    const formatDate = (date) => {
        if (!date) return "N/A";
        try {
            return new Date(date).toLocaleDateString();
        } catch (error) {
            return "Invalid date";
        }
    };

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            {loading ? <Loading /> : (
                <div className="md:p-10 p-4 space-y-5">
                    <h2 className="text-2xl font-bold">Order Management</h2>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg"
                            />
                            <Image
                                src={assets.search_icon}
                                alt="Search"
                                className="absolute left-3 top-2.5 h-5 w-5"
                                width={20}
                                height={20}
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Status</option>
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No orders found</p>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div key={order._id} className="border border-gray-300 rounded-lg p-4">
                                    {/* Order Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                        <div>
                                            <p className="font-semibold">Order {formatOrderId(order)}</p>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(order.date)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 mt-2 md:mt-0">
                                            <span className={`px-3 py-1 rounded-full text-sm ${
                                                statusOptions.find(s => s.value === order.status)?.color || 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {statusOptions.find(s => s.value === order.status)?.label || order.status}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm ${
                                                paymentOptions.find(s => s.value === order.paymentStatus)?.color || 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {paymentOptions.find(s => s.value === order.paymentStatus)?.label || order.paymentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Update Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Order Status</label>
                                            <div className="flex flex-wrap gap-2">
                                                {statusOptions.map((status) => (
                                                    <button
                                                        key={status.value}
                                                        onClick={() => updateOrderStatus(order._id, status.value)}
                                                        disabled={order.status === status.value}
                                                        className={`px-3 py-2 rounded text-sm border ${
                                                            order.status === status.value 
                                                                ? `${status.color} border-current font-bold` 
                                                                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {status.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Payment Status</label>
                                            <div className="flex flex-wrap gap-2">
                                                {paymentOptions.map((payment) => (
                                                    <button
                                                        key={payment.value}
                                                        onClick={() => updatePaymentStatus(order._id, payment.value)}
                                                        disabled={order.paymentStatus === payment.value}
                                                        className={`px-3 py-2 rounded text-sm border ${
                                                            order.paymentStatus === payment.value 
                                                                ? `${payment.color} border-current font-bold` 
                                                                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {payment.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <h4 className="font-medium mb-2">Products</h4>
                                            {order.items?.map((item, index) => (
                                                <div key={index} className="flex gap-2 mb-2">
                                                    <Image
                                                        src={item.product?.image?.[0] || assets.box_icon}
                                                        alt={item.product?.name || "Product"}
                                                        width={40}
                                                        height={40}
                                                        className="rounded"
                                                        onError={(e) => {
                                                            e.target.src = assets.box_icon;
                                                        }}
                                                    />
                                                    <div>
                                                        <p>{item.product?.name || "Product"}</p>
                                                        <p className="text-gray-600">Qty: {item.quantity || 0} × {currency}{item.product?.offerPrice || 0}</p>
                                                    </div>
                                                </div>
                                            )) || <p className="text-gray-500">No items</p>}
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Customer</h4>
                                            <p>{order.address?.fullName || "N/A"}</p>
                                            <p className="text-gray-600">{order.address?.area || ""}</p>
                                            <p className="text-gray-600">{order.address?.city || ""}, {order.address?.state || ""}</p>
                                            <p className="text-gray-600">{order.address?.phoneNumber || ""}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Summary</h4>
                                            <p>Total: {currency}{order.amount || 0}</p>
                                            <p>Items: {order.items?.length || 0}</p>
                                            {order.status !== "cancelled" && order.status !== "delivered" && (
                                                <button
                                                    onClick={() => setCancellingOrder(order._id)}
                                                    className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {order.cancellationReason && (
                                        <div className="mt-3 p-2 bg-red-50 rounded text-sm">
                                            <strong>Cancellation Reason:</strong> {order.cancellationReason}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {cancellingOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
                        <div className="space-y-2 mb-4">
                            {["Product unavailable", "Customer request", "Address issue", "Other"].map((reason) => (
                                <label key={reason} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="cancelReason"
                                        value={reason}
                                        checked={cancelReason === reason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="text-orange-600"
                                    />
                                    <span>{reason}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelOrder}
                                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => {
                                    setCancellingOrder(null);
                                    setCancelReason("");
                                }}
                                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Orders;