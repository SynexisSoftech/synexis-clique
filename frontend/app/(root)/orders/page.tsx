"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Package, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "../components/navbar/navbar";
import Footer from "../components/footer/footer";
import { orderService } from "@/service/public/orderService";
import { useToast } from "@/hooks/use-toast";

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getMyOrders();
        setOrders(response.orders || []);
      } catch (err: any) {
        setError("Failed to load your orders.");
        toast({
          title: "Error",
          description: "Could not fetch your orders.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [toast]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            <span className="ml-3 text-slate-600">Loading your orders...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 min-h-[200px]">
            <AlertCircle className="h-8 w-8 text-rose-600" />
            <span className="text-rose-600">{error}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 min-h-[200px]">
            <Package className="h-10 w-10 text-muted-foreground" />
            <span className="text-slate-600">You have no orders yet.</span>
            <Link href="/" className="text-rose-600 hover:underline">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
              const firstItem = order.items?.[0];
              const productTitle = firstItem?.productId?.title || "Product";
              const itemCount = order.items?.length || 0;
              
              return (
                <Card key={order._id} className="border-rose-100 bg-white/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-rose-700">
                      <Package className="h-5 w-5" />
                      Order #{order._id.slice(-6).toUpperCase()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Date:</span>
                      <span className="text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Status:</span>
                      <Badge variant={order.status === "COMPLETED" ? "default" : order.status === "FAILED" ? "destructive" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Items:</span>
                      <span className="text-slate-900">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total:</span>
                      <span className="text-slate-900">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div className="text-sm text-slate-600 truncate">
                      {productTitle}{itemCount > 1 ? ` +${itemCount - 1} more` : ''}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Link href={`/orders/${order._id}`} className="text-rose-600 hover:underline flex items-center gap-1">
                        View Details <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
} 