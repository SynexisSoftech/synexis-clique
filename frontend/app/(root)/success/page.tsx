"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Loader2, AlertCircle, Download, Eye, ArrowRight, Home, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"
import { useToast } from "@/hooks/use-toast"
import { orderService } from "@/service/public/orderService"
import { validateESewaResponse, logPaymentSecurityEvent } from "@/utils/paymentSecurity"

interface PaymentData {
  transaction_code: string
  status: string
  total_amount: string
  transaction_uuid: string
  product_code: string
  signed_field_names: string
  signature: string
}

interface OrderInfo {
  orderId: string
  transactionUuid: string
  totalAmount: number
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    province: string
    city: string
    postalCode: string
    country: string
  }
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function SuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending')

  useEffect(() => {
    const processPaymentData = async () => {
      try {
        // Get encoded response from URL
        const encodedData = searchParams.get("data")
        if (!encodedData) {
          throw new Error("No payment data received")
        }

        // Decode base64 data
        const decodedData = atob(encodedData)
        const paymentResponse: PaymentData = JSON.parse(decodedData)
        setPaymentData(paymentResponse)

        // Enhanced payment response validation
        const validation = validateESewaResponse(paymentResponse);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Log payment response received
        logPaymentSecurityEvent('payment_response_received', {
          status: paymentResponse.status,
          transaction_uuid: paymentResponse.transaction_uuid,
          hasSignature: !!paymentResponse.signature,
        });

        // Check if payment was successful
        if (paymentResponse.status === "COMPLETE") {
          setIsSuccess(true)

          // Get stored order info
          const storedOrderInfo = localStorage.getItem("pendingOrder")
          if (storedOrderInfo) {
            const orderData = JSON.parse(storedOrderInfo)
            setOrderInfo(orderData)
            
            // Clear the pending order from localStorage
            localStorage.removeItem("pendingOrder")
          }

          // Call backend to verify payment and reduce stock
          try {
            const verificationResult = await orderService.verifyPayment({
              transaction_uuid: paymentResponse.transaction_uuid,
              transaction_code: paymentResponse.transaction_code,
              status: paymentResponse.status,
              total_amount: paymentResponse.total_amount,
              signature: paymentResponse.signature,
            });
            setVerificationStatus('success');
            
            toast({
              title: "Payment Successful!",
              description: "Your order has been placed successfully and stock has been updated.",
            });
          } catch (verificationError: any) {
            setVerificationStatus('failed');
            
            toast({
              title: "Payment Successful!",
              description: "Your payment was successful, but there was an issue updating stock. Please contact support.",
              variant: "error",
            });
          }
        } else {
          setIsSuccess(false)
          toast({
            title: "Payment Failed",
            description: "Your payment was not completed successfully.",
            variant: "error",
          })
        }
      } catch (error: any) {
        setIsSuccess(false)
        toast({
          title: "Error",
          description: "Failed to process payment data.",
          variant: "error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    processPaymentData()
  }, [searchParams, toast])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                <p className="text-green-700 text-lg font-medium">Processing your payment...</p>
                <p className="text-green-600 text-sm text-center max-w-md">
                  Please wait while we confirm your payment. This may take a few moments.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!isSuccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
          <div className="container mx-auto px-4 py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-red-700 mb-4">Payment Failed</h1>
                <p className="text-red-600 mb-6">
                  Your payment was not completed successfully. Please try again or contact support if you need assistance.
                </p>
              </div>
              
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Payment status: {paymentData?.status || "Unknown"}
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-4 justify-center">
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link href="/checkout">Try Again</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Success Header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </motion.div>
              <h1 className="text-4xl font-bold text-green-700 mb-4">Payment Successful!</h1>
              <p className="text-green-600 text-lg max-w-2xl mx-auto">
                Thank you for your order! We've received your payment and will begin processing your order shortly.
                You'll receive a confirmation email with all the details.
              </p>
              
              {/* Verification Status Indicator */}
              {verificationStatus === 'pending' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Updating inventory...</span>
                  </div>
                </div>
              )}
              
              {verificationStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Inventory updated successfully</span>
                  </div>
                </div>
              )}
              
              {verificationStatus === 'failed' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Payment successful, but inventory update failed. Please contact support.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Order Details */}
              <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Package className="h-5 w-5" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {orderInfo && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Order ID:</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {orderInfo.orderId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <span className="font-semibold text-green-700">
                          {formatPrice(orderInfo.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Transaction ID:</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {paymentData?.transaction_uuid}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Package className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {orderInfo?.shippingInfo && (
                    <>
                      <div>
                        <span className="text-sm text-gray-600">Name:</span>
                        <p className="font-medium">
                          {orderInfo.shippingInfo.firstName} {orderInfo.shippingInfo.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <p className="font-medium">{orderInfo.shippingInfo.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <p className="font-medium">{orderInfo.shippingInfo.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Address:</span>
                        <p className="font-medium">{orderInfo.shippingInfo.address}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Location:</span>
                        <p className="font-medium">
                          {orderInfo.shippingInfo.city}, {orderInfo.shippingInfo.province}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Details */}
            <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Transaction Code:</span>
                    <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                      {paymentData?.transaction_code}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Amount:</span>
                    <p className="font-semibold text-green-700 mt-1">
                      NPR {paymentData?.total_amount}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-700 mt-1">
                      {paymentData?.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <p className="font-medium mt-1">eSewa</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                <Link href="/orders" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  View Orders
                </Link>
              </Button>
            </div>

            {/* Additional Information */}
            <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="font-semibold text-green-700">What's Next?</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">1</span>
                      </div>
                      <p className="text-gray-600">Order Confirmation</p>
                      <p className="text-xs text-gray-500">You'll receive an email confirmation</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      <p className="text-gray-600">Order Processing</p>
                      <p className="text-xs text-gray-500">We'll prepare your order for shipping</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">3</span>
                      </div>
                      <p className="text-gray-600">Shipping</p>
                      <p className="text-xs text-gray-500">Your order will be shipped to you</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                <p className="text-green-700 text-lg font-medium">Loading...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    }>
      <SuccessPageContent />
    </Suspense>
  )
} 
