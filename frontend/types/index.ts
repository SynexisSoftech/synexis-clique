// User Types
export enum UserRole {
  BUYER = "buyer",
  ADMIN = "admin",
}

export interface IUser {
  id: string
  username: string
  email: string
  password: string
  photoURL: string
  isVerified: boolean
  role: UserRole
  passwordResetOTP?: string
  passwordResetExpires?: Date
  phone?: string
  address?: string
  avatar?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

// Category Types
export interface ICategory {
  id: string
  title: string
  description: string
  seoKeywords?: string
  tags?: string
  image?: string
  status: "active" | "inactive"
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface ICategoryFormData {
  title: string
  description: string
  seoKeywords: string
  tags: string
  image: File | null
}

// Subcategory Types
export interface ISubcategory {
  id: string
  title: string
  description: string
  categoryId: string
  seoKeywords?: string
  tags?: string
  image?: string
  status: "active" | "inactive"
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface ISubcategoryFormData {
  title: string
  description: string
  categoryId: string
  seoKeywords: string
  tags: string
  image: File | null
}

// Product Types
export interface ICustomDetail {
  id: string
  label: string
  value: string
}

export interface IProduct {
  id: string
  title: string
  description: string
  shortDescription?: string
  categoryId: string
  subcategoryId: string
  originalPrice: string
  discountPrice?: string
  stockQuantity: string
  features?: string
  colors: string[]
  sizes: string[]
  brand?: string
  seoKeywords?: string
  tags?: string
  returnPolicy?: string
  warranty?: string
  weight?: string
  dimensions?: string
  material?: string
  images: File[]
  customDetails?: ICustomDetail[]
  status: "active" | "inactive" | "out-of-stock"
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface IProductFormData {
  title: string
  description: string
  shortDescription: string
  categoryId: string
  subcategoryId: string
  originalPrice: string
  discountPrice: string
  stockQuantity: string
  features: string
  colors: string[]
  sizes: string[]
  brand: string
  seoKeywords: string
  tags: string
  returnPolicy: string
  warranty: string
  weight: string
  dimensions: string
  material: string
  images: File[]
}

// Contact Types
export interface IContact {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: "new" | "responded" | "closed"
  createdAt: string
  respondedAt?: string
}

// Review Types
export interface IReview {
  id: string
  productId: string
  userId: string
  rating: number
  comment?: string
  isVerified: boolean
  status: "active" | "hidden" | "flagged"
  createdAt: string
  updatedAt: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form State Types
export interface FormState {
  isLoading: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}

// Color and Size Types
export interface ColorOption {
  name: string
  value: string
}

export interface SizeOption {
  label: string
  value: string
}

// Dashboard Stats Types
export interface DashboardStats {
  totalCategories: number
  totalSubcategories: number
  totalProducts: number
  totalUsers: number
  growth: number
}

// Activity Types
export interface ActivityItem {
  id: string
  type: "category" | "subcategory" | "product" | "user"
  action: "created" | "updated" | "deleted"
  title: string
  timestamp: string
  userId?: string
}
