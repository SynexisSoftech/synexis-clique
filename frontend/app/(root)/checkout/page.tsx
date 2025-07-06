"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CreditCard, Truck, Shield, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "../../context/AuthContext"
import { orderService } from "../../../service/public/orderService"
import { shippingService, type IProvince } from "../../../service/shippingService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  submitSecureESewaPayment, 
  validatePaymentAmount, 
  paymentRateLimiter, 
  logPaymentSecurityEvent,
  generateCSRFToken 
} from "../../../utils/paymentSecurity"

interface ShippingInfo {
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

interface BillingInfo extends ShippingInfo {
  sameAsShipping: boolean
}

interface ICity {
  _id?: string
  name: string
  shippingCharge: number
  isActive: boolean
}

// Helper function to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
  }).format(price)
}

// Enhanced eSewa payment submission with security
const submitESewaPayment = (formAction: string, fields: Record<string, any>) => {
  // Generate CSRF token for additional security
  const csrfToken = generateCSRFToken();
  
  // Use secure payment submission
  submitSecureESewaPayment(formAction, fields, csrfToken);
}

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,15}$/
  return phoneRegex.test(phone)
}

const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim())
}

const validateAddress = (address: string): boolean => {
  return address.trim().length >= 3
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { cart, isLoading: cartLoading, error: cartError } = useCart()

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("esewa")
  const [mounted, setMounted] = useState(false)
  const [provinces, setProvinces] = useState<IProvince[]>([])
  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [availableCities, setAvailableCities] = useState<ICity[]>([])
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [shippingCharge, setShippingCharge] = useState<number>(0)
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    city: "",
    postalCode: "",
    country: "Nepal",
  })
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    city: "",
    postalCode: "",
    country: "Nepal",
    sameAsShipping: true,
  })
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update form with user data when user loads
  useEffect(() => {
    if (user) {
      setShippingInfo((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
      }))
      setBillingInfo((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  // Handle authentication and cart validation after mounting
  useEffect(() => {
    if (!mounted) return

    // Check authentication
    if (!authLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login")
      router.push("/auth/login")
      return
    }

    // Check cart
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      console.log("Cart is empty, redirecting to cart page")
      router.push("/cart")
      return
    }
  }, [mounted, isAuthenticated, cart, authLoading, cartLoading, router])

  // Fetch shipping data on component mount
  useEffect(() => {
    const fetchShippingData = async () => {
      try {
        setIsLoadingShipping(true)
        const response = await shippingService.getProvincesForCheckout()
        if (response.success) {
          setProvinces(response.data)
        }
      } catch (error) {
        console.error("Error fetching shipping data:", error)
        toast({
          title: "Error",
          description: "Failed to load shipping information",
          variant: "error",
        })
      } finally {
        setIsLoadingShipping(false)
      }
    }

    fetchShippingData()
  }, [toast])

  // Update available cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(p => p.name === selectedProvince)
      if (province) {
        setAvailableCities(province.cities)
        setSelectedCity("")
        setShippingCharge(0)
        setShippingInfo(prev => ({ ...prev, province: selectedProvince, city: "" }))
      }
    } else {
      setAvailableCities([])
      setSelectedCity("")
      setShippingCharge(0)
    }
  }, [selectedProvince, provinces])

  // Update shipping charge when city changes
  useEffect(() => {
    if (selectedCity && availableCities.length > 0) {
      const city = availableCities.find(c => c.name === selectedCity)
      if (city) {
        setShippingCharge(city.shippingCharge)
        setShippingInfo(prev => ({ ...prev, city: city.name, province: selectedProvince }))
      }
    }
  }, [selectedCity, availableCities, selectedProvince])

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return null
  }

  // Show loading state while checking auth and cart
  if (authLoading || cartLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
              <p className="text-slate-600">Loading checkout...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Show error state
  if (cartError) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{cartError}</AlertDescription>
          </Alert>
          <Button asChild className="bg-rose-600 hover:bg-rose-700">
            <Link href="/cart">Back to Cart</Link>
          </Button>
        </div>
        <Footer />
      </>
    )
  }

  // Don't render if not authenticated or cart is empty
  if (!isAuthenticated || !cart || !cart.items || cart.items.length === 0) {
    return null // Let the useEffect handle the redirect
  }

  // Calculate totals
  const subtotal =
    cart.items.reduce((total, item) => {
      const price = item.productId.discountPrice || item.productId.originalPrice
      return total + price * item.quantity
    }, 0) || 0

  // Calculate tax from tax-inclusive prices
  const calculateTaxFromInclusive = () => {
    return cart.items.reduce((total, item) => {
      const price = item.productId.discountPrice || item.productId.originalPrice
      const taxRate = 0.13 // Default Nepal VAT rate
      const basePrice = price / (1 + taxRate)
      const itemTax = price - basePrice
      return total + itemTax * item.quantity
    }, 0) || 0
  }

  const shipping = shippingCharge
  const tax = Math.round(calculateTaxFromInclusive())
  const total = subtotal + shipping // Total already includes tax

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))

    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [field]: "" }))

    // Auto-update billing if same as shipping
    if (billingInfo.sameAsShipping && field !== "country") {
      setBillingInfo((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleBillingChange = (field: keyof Omit<BillingInfo, "sameAsShipping">, value: string) => {
    setBillingInfo((prev) => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [`billing_${field}`]: "" }))
  }

  const handleSameAsShippingChange = (checked: boolean) => {
    setBillingInfo((prev) => ({
      ...prev,
      sameAsShipping: checked,
      ...(checked ? { ...shippingInfo } : {}),
    }))
    
    // Clear billing validation errors when same as shipping
    if (checked) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith('billing_')) {
            delete newErrors[key]
          }
        })
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate shipping information
    if (!validateName(shippingInfo.firstName)) {
      errors.firstName = "First name must be at least 2 characters and contain only letters"
    }
    if (!validateName(shippingInfo.lastName)) {
      errors.lastName = "Last name must be at least 2 characters and contain only letters"
    }
    if (!validateEmail(shippingInfo.email)) {
      errors.email = "Please enter a valid email address"
    }
    if (!validatePhone(shippingInfo.phone)) {
      errors.phone = "Please enter a valid phone number"
    }
    if (!validateAddress(shippingInfo.address)) {
      errors.address = "Address must be at least 3 characters long"
    }
    if (!shippingInfo.province) {
      errors.province = "Please select a province"
    }
    if (!shippingInfo.city) {
      errors.city = "Please select a city"
    }

    // Validate billing information if different from shipping
    if (!billingInfo.sameAsShipping) {
      if (!validateName(billingInfo.firstName)) {
        errors.billing_firstName = "First name must be at least 2 characters and contain only letters"
      }
      if (!validateName(billingInfo.lastName)) {
        errors.billing_lastName = "Last name must be at least 2 characters and contain only letters"
      }
      if (!validateEmail(billingInfo.email)) {
        errors.billing_email = "Please enter a valid email address"
      }
      if (!validatePhone(billingInfo.phone)) {
        errors.billing_phone = "Please enter a valid phone number"
      }
      if (!validateAddress(billingInfo.address)) {
        errors.billing_address = "Address must be at least 3 characters long"
      }
      if (!billingInfo.city) {
        errors.billing_city = "Please enter a city"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before proceeding",
        variant: "error",
      })
      return
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "error",
      })
      return
    }

    // Payment rate limiting check
    if (user?.id) {
      const rateLimitCheck = paymentRateLimiter.canAttemptPayment(user.id);
      if (!rateLimitCheck.allowed) {
        const resetTime = new Date(rateLimitCheck.resetTime!).toLocaleTimeString();
        toast({
          title: "Too Many Payment Attempts",
          description: `Please wait until ${resetTime} before trying again.`,
          variant: "error",
        });
        return;
      }
    }

    // Log payment attempt
    logPaymentSecurityEvent('payment_attempt_started', {
      userId: user?.id,
      cartItemCount: cart.items.length,
      totalAmount: cart.items.reduce((sum, item) => sum + (item.productId.discountPrice || item.productId.originalPrice) * item.quantity, 0)
    });

    setIsProcessing(true)

    try {
      // Prepare the data for the backend
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        shippingInfo: {
          firstName: shippingInfo.firstName.trim(),
          lastName: shippingInfo.lastName.trim(),
          email: shippingInfo.email.trim().toLowerCase(),
          phone: shippingInfo.phone.trim(),
          address: shippingInfo.address.trim(),
          province: shippingInfo.province,
          city: shippingInfo.city,
          postalCode: shippingInfo.postalCode.trim(),
          country: shippingInfo.country.trim(),
        },
      }

      console.log("Sending order data to backend:", orderData)

      const orderResponse = await orderService.createOrder(orderData)

      console.log("Order created successfully:", orderResponse)

      // Store necessary info for the success page
      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          orderId: orderResponse.orderId,
          transactionUuid: orderResponse.fields.transaction_uuid,
          totalAmount: orderResponse.fields.total_amount,
          shippingInfo,
        }),
      )

      // Redirect to eSewa for payment
      submitESewaPayment(orderResponse.formAction, orderResponse.fields)

    } catch (error: any) {
      console.error("Order creation failed:", error)
      const errorMessage = error.message || "Failed to create order. Please try again."
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm font-medium mb-4 text-slate-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="text-slate-600">Complete your order</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleShippingChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                      className={validationErrors.firstName ? "border-red-500" : ""}
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleShippingChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                      className={validationErrors.lastName ? "border-red-500" : ""}
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleShippingChange("email", e.target.value)}
                      placeholder="Enter your email"
                      className={validationErrors.email ? "border-red-500" : ""}
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => handleShippingChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                      className={validationErrors.phone ? "border-red-500" : ""}
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleShippingChange("address", e.target.value)}
                    placeholder="Enter your full address"
                    className={validationErrors.address ? "border-red-500" : ""}
                  />
                  {validationErrors.address && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="province">Province *</Label>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                      <SelectTrigger className={`w-full ${validationErrors.province ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province._id} value={province.name}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.province && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.province}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={selectedCity}
                      onValueChange={(value) => {
                        setSelectedCity(value)
                        handleShippingChange("city", value)
                      }}
                      disabled={!selectedProvince || availableCities.length === 0}
                    >
                      <SelectTrigger className={`w-full ${validationErrors.city ? "border-red-500" : ""}`}>
                        <SelectValue placeholder={selectedProvince ? "Select city" : "Select province first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city._id || city.name} value={city.name}>
                            {city.name} - {formatPrice(city.shippingCharge)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.city && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={(e) => handleShippingChange("postalCode", e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) => handleShippingChange("country", e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsShipping"
                    checked={billingInfo.sameAsShipping}
                    onCheckedChange={handleSameAsShippingChange}
                  />
                  <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                </div>

                {!billingInfo.sameAsShipping && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingFirstName">First Name *</Label>
                        <Input
                          id="billingFirstName"
                          value={billingInfo.firstName}
                          onChange={(e) => handleBillingChange("firstName", e.target.value)}
                          placeholder="Enter first name"
                          className={validationErrors.billing_firstName ? "border-red-500" : ""}
                        />
                        {validationErrors.billing_firstName && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.billing_firstName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="billingLastName">Last Name *</Label>
                        <Input
                          id="billingLastName"
                          value={billingInfo.lastName}
                          onChange={(e) => handleBillingChange("lastName", e.target.value)}
                          placeholder="Enter last name"
                          className={validationErrors.billing_lastName ? "border-red-500" : ""}
                        />
                        {validationErrors.billing_lastName && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.billing_lastName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="billingEmail">Email *</Label>
                        <Input
                          id="billingEmail"
                          type="email"
                          value={billingInfo.email}
                          onChange={(e) => handleBillingChange("email", e.target.value)}
                          placeholder="Enter email"
                          className={validationErrors.billing_email ? "border-red-500" : ""}
                        />
                        {validationErrors.billing_email && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.billing_email}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="billingPhone">Phone Number *</Label>
                        <Input
                          id="billingPhone"
                          value={billingInfo.phone}
                          onChange={(e) => handleBillingChange("phone", e.target.value)}
                          placeholder="Enter phone number"
                          className={validationErrors.billing_phone ? "border-red-500" : ""}
                        />
                        {validationErrors.billing_phone && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.billing_phone}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="billingCountry">Country</Label>
                        <Input
                          id="billingCountry"
                          value={billingInfo.country}
                          onChange={(e) => handleBillingChange("country", e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="billingAddress">Address *</Label>
                      <Input
                        id="billingAddress"
                        value={billingInfo.address}
                        onChange={(e) => handleBillingChange("address", e.target.value)}
                        placeholder="Enter full address"
                        className={validationErrors.billing_address ? "border-red-500" : ""}
                      />
                      {validationErrors.billing_address && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.billing_address}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingCity">City *</Label>
                        <Input
                          id="billingCity"
                          value={billingInfo.city}
                          onChange={(e) => handleBillingChange("city", e.target.value)}
                          placeholder="Enter city"
                          className={validationErrors.billing_city ? "border-red-500" : ""}
                        />
                        {validationErrors.billing_city && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.billing_city}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="billingPostalCode">Postal Code</Label>
                        <Input
                          id="billingPostalCode"
                          value={billingInfo.postalCode}
                          onChange={(e) => handleBillingChange("postalCode", e.target.value)}
                          placeholder="Enter postal code"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="esewa" id="esewa" />
                    <Label htmlFor="esewa" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        eS
                      </div>
                      eSewa Digital Wallet
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                    <RadioGroupItem value="cod" id="cod" disabled />
                    <Label htmlFor="cod" className="cursor-not-allowed">
                      Cash on Delivery (Coming Soon)
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "esewa" && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Secure Payment with eSewa</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      You will be redirected to eSewa to complete your payment securely.
                    </p>
                  </div>
                )}
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
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.items.map((item, index) => (
                    <div key={`${item.productId._id}-${index}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                        <Image
                          src={item.productId.images?.[0] || "/placeholder.svg"}
                          alt={item.productId.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{item.productId.title}</h4>
                        <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        {formatPrice((item.productId.discountPrice || item.productId.originalPrice) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="text-slate-900">
                      {selectedCity ? `${selectedCity} - ${formatPrice(shipping)}` : "Select city"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 italic">
                    * All prices include 13% VAT
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-slate-900">Total</span>
                    <span className="text-rose-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !selectedCity}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Place Order - {formatPrice(total)}
                    </>
                  )}
                </Button>

                {!selectedCity && (
                  <p className="text-xs text-amber-600 text-center">
                    Please select a city to calculate shipping and place your order.
                  </p>
                )}

                <p className="text-xs text-slate-500 text-center">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
