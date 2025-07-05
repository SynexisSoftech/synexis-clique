"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Package, ArrowLeft, MapPin, CreditCard, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Navbar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-700';
    case 'FAILED':
      return 'bg-red-100 text-red-700';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getMyOrderById(orderId);
        setOrder(response);
      } catch (err: any) {
        setError("Failed to load order details.");
        toast({
          title: "Error",
          description: "Could not fetch order details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, toast]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-rose-600" />
              <p className="text-slate-600">Loading order details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Order not found"}
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center text-sm font-medium mb-4 text-slate-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Order Details</h1>
              <p className="text-slate-600">Order #{order._id.slice(-6).toUpperCase()}</p>
            </div>
            <Badge className={`${getStatusColor(order.status)} px-3 py-1`}>
              {order.status}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                        <Image
                          src={item.productId?.images?.[0] || "/placeholder.svg"}
                          alt={item.productId?.title || "Product"}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{item.productId?.title}</h4>
                        <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-slate-600">Price: {formatPrice(item.price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-medium">
                      {order.shippingInfo?.firstName} {order.shippingInfo?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium">{order.shippingInfo?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Phone</p>
                    <p className="font-medium">{order.shippingInfo?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Location</p>
                    <p className="font-medium">
                      {order.shippingInfo?.city}, {order.shippingInfo?.province}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-600">Address</p>
                    <p className="font-medium">{order.shippingInfo?.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Info */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Order ID:</span>
                    <span className="font-mono text-sm">{order._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Date:</span>
                    <span className="text-slate-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Time:</span>
                    <span className="text-slate-900">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Transaction ID:</span>
                    <span className="font-mono text-xs">{order.transaction_uuid}</span>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="text-slate-900">{formatPrice(order.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping:</span>
                    <span className="text-slate-900">{formatPrice(order.shippingCharge || 0)}</span>
                  </div>
                  <div className="text-xs text-slate-500 italic">
                    * All prices include 13% VAT
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-slate-900">Total:</span>
                    <span className="text-rose-600">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-slate-600" />
                    <span className="text-slate-600">Payment Method:</span>
                    <span className="font-medium">eSewa</span>
                  </div>
                </div>

                {/* Order Status */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <span className="text-slate-600">Status:</span>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 