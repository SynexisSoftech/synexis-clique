// "use client"

// import { useEffect, useState } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import Link from "next/link"
// import { CheckCircle, Package, Loader2, AlertCircle, Download, Eye, ArrowRight } from "lucide-react"
// import { motion } from "framer-motion"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import Navbar from "../components/navbar/navbar"
// import Footer from "../components/footer/footer"
// import { esewaService } from "../../../service/payment/esewaService"
// import { useToast } from "@/hooks/use-toast"
// import { formatPrice } from "@/types/cart"

// interface OrderInfo {
//   orderId: string
//   transactionUuid: string
//   totalAmount: number
//   shippingInfo: any
//   billingInfo: any
// }

// export default function CheckoutSuccessPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { toast } = useToast()

//   const [isVerifying, setIsVerifying] = useState(true)
//   const [verificationStatus, setVerificationStatus] = useState<"success" | "failed" | "pending">("pending")
//   const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
//   const [paymentDetails, setPaymentDetails] = useState<any>(null)

//   useEffect(() => {
//     const verifyPayment = async () => {
//       try {
//         // Get encoded response from URL
//         const encodedData = searchParams.get("data")
//         if (!encodedData) {
//           throw new Error("No payment data received")
//         }

//         // Decode eSewa response
//         const decodedResponse = esewaService.decodeResponse(encodedData)

//         // Verify signature
//         const isValidSignature = esewaService.verifyResponse(decodedResponse)
//         if (!isValidSignature) {
//           throw new Error("Invalid payment signature")
//         }

//         // Get stored order info
//         const storedOrderInfo = localStorage.getItem("pendingOrder")
//         if (!storedOrderInfo) {
//           throw new Error("Order information not found")
//         }

//         const orderData = JSON.parse(storedOrderInfo)
//         setOrderInfo(orderData)
//         setPaymentDetails(decodedResponse)

//         // Verify payment status with eSewa
//         const statusResponse = await esewaService.checkPaymentStatus(
//           decodedResponse.transaction_uuid,
//           decodedResponse.total_amount,
//         )

//         if (statusResponse.status === "COMPLETE") {
//           setVerificationStatus("success")

//           // Clear cart and order info
//           localStorage.removeItem("pendingOrder")

//           toast({
//             title: "Payment Successful!",
//             description: "Your order has been placed successfully.",
//           })
//         } else {
//           setVerificationStatus("failed")
//           toast({
//             title: "Payment Verification Failed",
//             description: "Payment status could not be verified.",
//             variant: "error",
//           })
//         }
//       } catch (error: any) {
//         console.error("Payment verification failed:", error)
//         setVerificationStatus("failed")
//         toast({
//           title: "Payment Verification Failed",
//           description: error.message || "Failed to verify payment",
//           variant: "error",
//         })
//       } finally {
//         setIsVerifying(false)
//       }
//     }

//     verifyPayment()
//   }, [searchParams, toast])

//   if (isVerifying) {
//     return (
//       <>
//         <Navbar />
//         <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
//           <div className="container mx-auto px-4 py-16">
//             <div className="flex items-center justify-center min-h-[400px]">
//               <div className="flex flex-col items-center gap-4">
//                 <Loader2 className="h-12 w-12 animate-spin text-[#6F4E37]" />
//                 <p className="text-[#6F4E37] font-cormorant text-lg">Verifying your payment...</p>
//                 <p className="text-[#6F4E37]/60 text-sm text-center max-w-md">
//                   Please wait while we confirm your payment with eSewa. This may take a few moments.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </>
//     )
//   }

//   if (verificationStatus === "failed") {
//     return (
//       <>
//         <Navbar />
//         <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
//           <div className="container mx-auto px-4 py-16">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
//               <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription className="font-cormorant">
//                   Payment verification failed. Please contact support if you believe this is an error.
//                 </AlertDescription>
//               </Alert>
//               <div className="flex gap-4">
//                 <Button asChild className="bg-[#6F4E37] hover:bg-[#5d4230] font-cormorant">
//                   <Link href="/checkout">Try Again</Link>
//                 </Button>
//                 <Button
//                   asChild
//                   variant="outline"
//                   className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant"
//                 >
//                   <Link href="/contact">Contact Support</Link>
//                 </Button>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//         <Footer />
//       </>
//     )
//   }

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
//         <div className="container mx-auto px-4 py-16">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-4xl mx-auto space-y-8"
//           >
//             {/* Success Header */}
//             <div className="text-center">
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                 className="mb-6"
//               >
//                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <CheckCircle className="h-12 w-12 text-green-600" />
//                 </div>
//               </motion.div>
//               <h1 className="text-4xl font-bold text-[#6F4E37] mb-4 font-cormorant">Payment Successful!</h1>
//               <p className="text-[#6F4E37]/70 text-lg font-cormorant max-w-2xl mx-auto">
//                 Thank you for your order! We've received your payment and will begin processing your order shortly.
//                 You'll receive a confirmation email with all the details.
//               </p>
//             </div>

//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Order Details */}
//               <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
//                 <CardHeader className="bg-gradient-to-r from-[#6F4E37]/5 to-amber-500/5">
//                   <CardTitle className="flex items-center gap-2 text-[#6F4E37] font-cormorant">
//                     <Package className="h-5 w-5" />
//                     Order Details
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4 pt-6">
//                   {orderInfo && (
//                     <>
//                       <div className="flex justify-between items-center">
//                         <span className="text-[#6F4E37]/70 font-cormorant">Order ID:</span>
//                         <Badge variant="outline" className="font-mono text-[#6F4E37] border-[#6F4E37]/30">
//                           {orderInfo.orderId}
//                         </Badge>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-[#6F4E37]/70 font-cormorant">Transaction ID:</span>
//                         <span className="font-mono text-sm text-[#6F4E37]">{orderInfo.transactionUuid}</span>
//                       </div>
//                       <Separator className="bg-[#6F4E37]/20" />
//                       <div className="flex justify-between items-center">
//                         <span className="text-[#6F4E37]/70 font-cormorant">Total Amount:</span>
//                         <span className="font-bold text-lg text-[#6F4E37] font-cormorant">
//                           {formatPrice(orderInfo.totalAmount)}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-[#6F4E37]/70 font-cormorant">Payment Method:</span>
//                         <Badge className="bg-green-100 text-green-800 border-green-200">eSewa</Badge>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-[#6F4E37]/70 font-cormorant">Status:</span>
//                         <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
//                       </div>
//                     </>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Payment Details */}
//               <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
//                 <CardHeader className="bg-gradient-to-r from-[#6F4E37]/5 to-amber-500/5">
//                   <CardTitle className="text-[#6F4E37] font-cormorant">Payment Information</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4 pt-6">
//                   {paymentDetails && (
//                     <>
//                       <div className="flex justify-between items-center">
//                         <span className="text-[#6F4E37]/70 font-cormorant">Transaction Code:</span>
//                         <span className="font-mono text-sm text-[#6F4E37]">{paymentDetails.transaction_code}</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-[#6F4E37]/70 font-cormorant">Payment Status:</span>
//                         <Badge className="bg-green-100 text-green-800 border-green-200">{paymentDetails.status}</Badge>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-[#6F4E37]/70 font-cormorant">Amount Paid:</span>
//                         <span className="font-bold text-[#6F4E37] font-cormorant">
//                           {formatPrice(paymentDetails.total_amount)}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-[#6F4E37]/70 font-cormorant">Payment Gateway:</span>
//                         <span className="font-medium text-[#6F4E37] font-cormorant">eSewa Digital Wallet</span>
//                       </div>
//                     </>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Shipping Information */}
//               {orderInfo?.shippingInfo && (
//                 <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
//                   <CardHeader className="bg-gradient-to-r from-[#6F4E37]/5 to-amber-500/5">
//                     <CardTitle className="text-[#6F4E37] font-cormorant">Shipping Address</CardTitle>
//                   </CardHeader>
//                   <CardContent className="pt-6">
//                     <div className="text-sm space-y-2 text-[#6F4E37]">
//                       <p className="font-medium font-cormorant text-base">{orderInfo.shippingInfo.fullName}</p>
//                       <p className="font-cormorant">{orderInfo.shippingInfo.address}</p>
//                       <p className="font-cormorant">
//                         {orderInfo.shippingInfo.city}
//                         {orderInfo.shippingInfo.postalCode && `, ${orderInfo.shippingInfo.postalCode}`}
//                       </p>
//                       <p className="font-cormorant">{orderInfo.shippingInfo.country}</p>
//                       <Separator className="bg-[#6F4E37]/20 my-3" />
//                       <p className="font-cormorant">
//                         <span className="text-[#6F4E37]/70">Phone: </span>
//                         {orderInfo.shippingInfo.phone}
//                       </p>
//                       <p className="font-cormorant">
//                         <span className="text-[#6F4E37]/70">Email: </span>
//                         {orderInfo.shippingInfo.email}
//                       </p>
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}

//               {/* Next Steps */}
//               <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
//                 <CardHeader className="bg-gradient-to-r from-[#6F4E37]/5 to-amber-500/5">
//                   <CardTitle className="text-[#6F4E37] font-cormorant">What's Next?</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4 pt-6">
//                   <div className="space-y-4">
//                     <div className="flex items-start gap-3">
//                       <div className="w-8 h-8 rounded-full bg-[#6F4E37] text-white flex items-center justify-center text-sm font-bold font-cormorant">
//                         1
//                       </div>
//                       <div>
//                         <p className="font-medium text-[#6F4E37] font-cormorant">Order Confirmation</p>
//                         <p className="text-sm text-[#6F4E37]/70 font-cormorant">
//                           You'll receive an email confirmation within 5 minutes
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-8 h-8 rounded-full bg-[#6F4E37] text-white flex items-center justify-center text-sm font-bold font-cormorant">
//                         2
//                       </div>
//                       <div>
//                         <p className="font-medium text-[#6F4E37] font-cormorant">Order Processing</p>
//                         <p className="text-sm text-[#6F4E37]/70 font-cormorant">
//                           We'll prepare your order within 1-2 business days
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="w-8 h-8 rounded-full bg-[#6F4E37] text-white flex items-center justify-center text-sm font-bold font-cormorant">
//                         3
//                       </div>
//                       <div>
//                         <p className="font-medium text-[#6F4E37] font-cormorant">Shipping & Delivery</p>
//                         <p className="text-sm text-[#6F4E37]/70 font-cormorant">
//                           Your order will be delivered within 3-5 business days
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
//               <Button asChild className="bg-[#6F4E37] hover:bg-[#5d4230] font-cormorant text-white px-8">
//                 <Link href="/orders" className="flex items-center gap-2">
//                   <Eye className="h-4 w-4" />
//                   View My Orders
//                 </Link>
//               </Button>
//               <Button
//                 asChild
//                 variant="outline"
//                 className="border-[#6F4E37]/30 text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant px-8"
//               >
//                 <Link href="/products" className="flex items-center gap-2">
//                   Continue Shopping
//                   <ArrowRight className="h-4 w-4" />
//                 </Link>
//               </Button>
//               <Button asChild variant="ghost" className="text-[#6F4E37] hover:bg-[#6F4E37]/10 font-cormorant">
//                 <Link href="/support" className="flex items-center gap-2">
//                   <Download className="h-4 w-4" />
//                   Download Receipt
//                 </Link>
//               </Button>
//             </div>

//             {/* Support Information */}
//             <Card className="border-[#6F4E37]/20 bg-white/80 backdrop-blur-sm">
//               <CardContent className="pt-6">
//                 <div className="text-center">
//                   <h3 className="font-semibold text-[#6F4E37] mb-2 font-cormorant">Need Help?</h3>
//                   <p className="text-sm text-[#6F4E37]/70 mb-4 font-cormorant">
//                     If you have any questions about your order, feel free to contact our support team.
//                   </p>
//                   <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
//                     <span className="text-[#6F4E37] font-cormorant">
//                       <strong>Email:</strong> support@yourstore.com
//                     </span>
//                     <span className="text-[#6F4E37] font-cormorant">
//                       <strong>Phone:</strong> +977-1-XXXXXXX
//                     </span>
//                     <span className="text-[#6F4E37] font-cormorant">
//                       <strong>Hours:</strong> 9:00 AM - 6:00 PM
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
//       </div>
//       <Footer />
//     </>
//   )
// }
