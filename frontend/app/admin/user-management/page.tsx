"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  Eye,
  WifiOff,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { userService, type IUser, type UsersResponse, type UserRole } from "@/service/userService"

// Enhanced error interface for better validation handling
interface ValidationError {
  field?: string
  message: string
  code?: string
  value?: any
}

interface ApiError {
  message: string
  errors?: ValidationError[]
  status?: number
  timestamp?: string
}

// Get user initials safely
const getUserInitials = (username: string | undefined | null, firstName?: string, lastName?: string) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }
  if (!username || typeof username !== "string") {
    return "U"
  }
  return username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const getDisplayName = (firstName?: string, lastName?: string, username?: string) => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  return username || "Unknown User"
}

// Enhanced Mobile User Card Component with better error handling
const MobileUserCard = ({
  user,
  index,
  onViewDetails,
  onToggleBlock,
  onChangeRole,
  isUpdatingUser,
  isChangingRole,
}: {
  user: IUser
  index: number
  onViewDetails: (user: IUser) => void
  onToggleBlock: (userId: string, currentStatus: boolean) => void
  onChangeRole: (userId: string, newRole: UserRole) => void
  isUpdatingUser: string | null
  isChangingRole: string | null
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ delay: index * 0.05 }}
    className="w-full max-w-full"
  >
    <Card className="w-full hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-3 w-full">
        <div className="flex items-start gap-3 w-full min-w-0">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.username || "User"} />
            <AvatarFallback className="bg-rose-100 text-rose-700 text-sm">
              {getUserInitials(user.username, user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2 max-w-[calc(100%-100px)]">
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base truncate">{getDisplayName(user.firstName, user.lastName, user.username)}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 w-full">
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
                className={`text-xs ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : "bg-blue-100 text-blue-800 border-blue-200"
                }`}
              >
                {user.role === "admin" ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </>
                ) : (
                  <>
                    <Users className="h-3 w-3 mr-1" />
                    Buyer
                  </>
                )}
              </Badge>
              <Badge
                variant={user.isBlocked ? "destructive" : "default"}
                className={`text-xs ${
                  user.isBlocked
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-green-100 text-green-800 border-green-200"
                }`}
              >
                {user.isBlocked ? (
                  <>
                    <UserX className="h-3 w-3 mr-1" />
                    Blocked
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3 w-3 mr-1" />
                    Active
                  </>
                )}
              </Badge>
              {user.isVerified && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Verified
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 w-full">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(user)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {user.role !== "admin" && (
                <DropdownMenuItem
                  onClick={() => onChangeRole(user._id, "admin")}
                  disabled={isChangingRole === user._id}
                  className="text-purple-600"
                >
                  {isChangingRole === user._id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4" />
                  )}
                  Make Admin
                </DropdownMenuItem>
              )}

              {user.role !== "buyer" && (
                <DropdownMenuItem
                  onClick={() => onChangeRole(user._id, "buyer")}
                  disabled={isChangingRole === user._id}
                  className="text-blue-600"
                >
                  {isChangingRole === user._id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  Make Buyer
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onToggleBlock(user._id, user.isBlocked)}
                disabled={isUpdatingUser === user._id}
                className={user.isBlocked ? "text-green-600" : "text-red-600"}
              >
                {isUpdatingUser === user._id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : user.isBlocked ? (
                  <ShieldOff className="mr-2 h-4 w-4" />
                ) : (
                  <UserX className="mr-2 h-4 w-4" />
                )}
                {user.isBlocked ? "Unblock" : "Block"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-3 w-full">
    {[...Array(5)].map((_, i) => (
      <Card key={i} className="w-full">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function AdminUsersManagementPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<IUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [isUpdatingUser, setIsUpdatingUser] = useState<string | null>(null)
  const [isChangingRole, setIsChangingRole] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Enhanced error parsing function
  const parseApiError = (err: any): ApiError => {
    const apiError: ApiError = {
      message: err.message || "An unexpected error occurred",
      errors: [],
      status: err.status || err.response?.status || 500,
      timestamp: new Date().toISOString(),
    }

    // Parse validation errors from different response formats
    if (err.response?.data?.errors) {
      apiError.errors = err.response.data.errors
    } else if (err.errors) {
      apiError.errors = err.errors
    } else if (err.response?.data?.message) {
      apiError.message = err.response.data.message
    }

    return apiError
  }

  // Enhanced error display function
  const displayValidationErrors = (apiError: ApiError, title = "Error") => {
    // Show main error message
    toast({
      title,
      description: apiError.message,
      variant: "error",
    })

    // Show individual validation errors
    if (apiError.errors && apiError.errors.length > 0) {
      apiError.errors.forEach((error: ValidationError, index) => {
        setTimeout(() => {
          toast({
            title: `Validation Error${error.field ? ` (${error.field})` : ""}`,
            description: error.message,
            variant: "error",
          })
        }, index * 500) // Stagger error messages
      })
    }

    // Show network-specific errors
    if (apiError.status === 0 || !isOnline) {
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again",
        variant: "error",
      })
    }
  }

  // Fetch users from API with enhanced error handling
  const fetchUsers = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const response: UsersResponse = await userService.getAllUsers()
      setUsers(response.users)
      setFilteredUsers(response.users)
    } catch (err: any) {
      console.error("Error fetching users:", err)
      const apiError = parseApiError(err)
      setError(apiError)
      displayValidationErrors(apiError, "Failed to Load Users")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on search term, role, and status
  useEffect(() => {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          (user.firstName && user.firstName.toLowerCase().includes(query)) ||
          (user.lastName && user.lastName.toLowerCase().includes(query)) ||
          (user.username && user.username.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          user._id.toLowerCase().includes(query),
      )
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "blocked") {
        filtered = filtered.filter((user) => user.isBlocked)
      } else if (statusFilter === "active") {
        filtered = filtered.filter((user) => !user.isBlocked)
      }
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  // Enhanced toggle user block status with better error handling
  const handleToggleBlockStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unblock" : "block"
    const confirmMessage = `Are you sure you want to ${action} this user?`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setIsUpdatingUser(userId)

      const updatedUser = await userService.toggleUserBlockStatus(userId, {
        isBlocked: !currentStatus,
      })

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userId ? { ...user, isBlocked: updatedUser.isBlocked } : user)),
      )

      toast({
        title: "Success",
        description: `User has been ${updatedUser.isBlocked ? "blocked" : "unblocked"} successfully`,
      })
    } catch (err: any) {
      console.error(`Error ${action}ing user:`, err)
      const apiError = parseApiError(err)
      displayValidationErrors(apiError, `Failed to ${action} user`)
    } finally {
      setIsUpdatingUser(null)
    }
  }

  // Enhanced change user role with better error handling
  const handleChangeUserRole = async (userId: string, newRole: UserRole) => {
    const confirmMessage = `Are you sure you want to change this user's role to ${newRole}?`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setIsChangingRole(userId)

      const updatedUser = await userService.changeUserRole(userId, {
        role: newRole,
      })

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userId ? { ...user, role: updatedUser.role } : user)),
      )

      toast({
        title: "Success",
        description: `User role has been changed to ${updatedUser.role} successfully`,
      })
    } catch (err: any) {
      console.error(`Error changing user role:`, err)
      const apiError = parseApiError(err)
      displayValidationErrors(apiError, "Failed to change user role")
    } finally {
      setIsChangingRole(null)
    }
  }

  const handleExportUsers = () => {
    try {
      const csvContent = [
        ["ID", "First Name", "Last Name", "Username", "Email", "Role", "Status", "Verified", "Created At"].join(","),
        ...filteredUsers.map((user) =>
          [
            user._id,
            user.firstName || "",
            user.lastName || "",
            user.username || "Unknown",
            user.email || "No email",
            user.role,
            user.isBlocked ? "Blocked" : "Active",
            user.isVerified ? "Verified" : "Not Verified",
            new Date(user.createdAt).toLocaleDateString(),
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Users data has been exported successfully",
      })
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to export users data",
        variant: "error",
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => !u.isBlocked).length,
    blocked: users.filter((u) => u.isBlocked).length,
    admins: users.filter((u) => u.role === "admin").length,
    buyers: users.filter((u) => u.role === "buyer").length,
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <div className="w-full max-w-full">
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 w-full max-w-full">
          {/* Network Status Indicator */}
          {!isOnline && (
            <Alert variant="destructive" className="w-full">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>You're currently offline. Some features may not work properly.</AlertDescription>
            </Alert>
          )}

          {/* Mobile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-full">
            {/* Title and Actions */}
            <div className="flex items-start justify-between gap-2 mb-4 w-full">
              <div className="min-w-0 flex-1 max-w-[calc(100%-120px)]">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2 w-full">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-rose-500 flex-shrink-0" />
                  <span className="truncate min-w-0">User Management</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                  Manage and monitor users
                  {!isOnline && (
                    <span className="inline-flex items-center gap-1 ml-2">
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0 w-auto">
                <Button
                  onClick={() => fetchUsers(true)}
                  disabled={isRefreshing || !isOnline}
                  variant="outline"
                  size="sm"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 px-2 min-w-0"
                >
                  {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="hidden md:inline ml-1">Refresh</span>
                </Button>
                <Button
                  onClick={handleExportUsers}
                  disabled={filteredUsers.length === 0}
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 px-2 min-w-0"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden md:inline ml-1">Export</span>
                </Button>
              </div>
            </div>

            {/* Mobile Search and Filters */}
            <div className="flex gap-2 w-full max-w-full">
              <div className="flex-1 min-w-0 max-w-[calc(100%-60px)]">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:border-rose-300 focus:ring-rose-200 w-full min-w-0"
                  />
                </div>
              </div>
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2 flex-shrink-0 min-w-0">
                    <Filter className="h-4 w-4" />
                    <span className="hidden lg:inline ml-1">Filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px] max-w-[90vw]">
                  <SheetHeader>
                    <SheetTitle>Filter Users</SheetTitle>
                    <SheetDescription>Filter users by role and status</SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Role</label>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="focus:ring-rose-200 w-full">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="buyer">Buyers</SelectItem>
                          <SelectItem value="admin">Admins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="focus:ring-rose-200 w-full">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => setShowFilters(false)} className="w-full bg-rose-600 hover:bg-rose-700">
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>

          {/* Stats Cards - Mobile Responsive Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-full overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 w-full">
              <Card className="p-2 sm:p-3 min-w-0">
                <div className="flex items-center justify-between min-w-0">
                  <div className="min-w-0 flex-1 pr-1">
                    <p className="text-xs font-medium text-muted-foreground truncate">Total</p>
                    <p className="text-sm sm:text-lg font-bold text-slate-900 truncate">{stats.total}</p>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>

              <Card className="p-2 sm:p-3 min-w-0">
                <div className="flex items-center justify-between min-w-0">
                  <div className="min-w-0 flex-1 pr-1">
                    <p className="text-xs font-medium text-muted-foreground truncate">Active</p>
                    <p className="text-sm sm:text-lg font-bold text-green-600 truncate">{stats.active}</p>
                  </div>
                  <UserCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                </div>
              </Card>

              <Card className="p-2 sm:p-3 min-w-0">
                <div className="flex items-center justify-between min-w-0">
                  <div className="min-w-0 flex-1 pr-1">
                    <p className="text-xs font-medium text-muted-foreground truncate">Blocked</p>
                    <p className="text-sm sm:text-lg font-bold text-red-600 truncate">{stats.blocked}</p>
                  </div>
                  <UserX className="h-4 w-4 text-red-600 flex-shrink-0" />
                </div>
              </Card>

              <Card className="p-2 sm:p-3 min-w-0">
                <div className="flex items-center justify-between min-w-0">
                  <div className="min-w-0 flex-1 pr-1">
                    <p className="text-xs font-medium text-muted-foreground truncate">Admins</p>
                    <p className="text-sm sm:text-lg font-bold text-purple-600 truncate">{stats.admins}</p>
                  </div>
                  <Shield className="h-4 w-4 text-purple-600 flex-shrink-0" />
                </div>
              </Card>

              <Card className="p-2 sm:p-3 min-w-0 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between min-w-0">
                  <div className="min-w-0 flex-1 pr-1">
                    <p className="text-xs font-medium text-muted-foreground truncate">Buyers</p>
                    <p className="text-sm sm:text-lg font-bold text-blue-600 truncate">{stats.buyers}</p>
                  </div>
                  <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Enhanced Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{error.message}</p>
                      {error.status && <p className="text-xs mt-1 opacity-80">Status: {error.status}</p>}
                      {error.errors && error.errors.length > 0 && (
                        <p className="text-xs mt-1 opacity-80">{error.errors.length} validation error(s) detected</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers(true)}
                      className="w-full sm:w-auto flex-shrink-0"
                      disabled={!isOnline}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Users List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <Card className="w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">Users List</CardTitle>
                    <CardDescription className="truncate">
                      {isLoading ? "Loading..." : `Showing ${filteredUsers.length} of ${users.length} users`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 w-full">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {users.length === 0 ? "No users found" : "No users match your filters"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {users.length === 0
                        ? "Users will appear here once they register"
                        : "Try adjusting your search or filter criteria"}
                    </p>
                    {users.length === 0 && (
                      <Button onClick={() => fetchUsers(true)} disabled={!isOnline}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 w-full">
                    <AnimatePresence>
                      {filteredUsers.map((user, index) => (
                        <MobileUserCard
                          key={user._id}
                          user={user}
                          index={index}
                          onViewDetails={setSelectedUser}
                          onToggleBlock={handleToggleBlockStatus}
                          onChangeRole={handleChangeUserRole}
                          isUpdatingUser={isUpdatingUser}
                          isChangingRole={isChangingRole}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced User Details Dialog - Mobile Responsive */}
          <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
            <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto mx-auto overflow-x-hidden">
              <DialogHeader>
                <DialogTitle className="truncate">User Details</DialogTitle>
                <DialogDescription className="truncate">Detailed information about the selected user</DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4 w-full max-w-full overflow-hidden">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                      <AvatarImage
                        src={selectedUser.photoURL || "/placeholder.svg"}
                        alt={selectedUser.username || "User"}
                      />
                      <AvatarFallback className="bg-rose-100 text-rose-700 text-lg">
                        {getUserInitials(selectedUser.username, selectedUser.firstName, selectedUser.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold truncate">
                        {getDisplayName(selectedUser.firstName, selectedUser.lastName, selectedUser.username)}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant={selectedUser.isVerified ? "default" : "secondary"} className="text-xs">
                          {selectedUser.isVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 w-full">
                    <div className="min-w-0">
                      <label className="text-xs font-medium text-muted-foreground">User ID</label>
                      <p className="text-xs font-mono bg-slate-100 p-2 rounded break-all">{selectedUser._id}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Role</label>
                        <div className="mt-1">
                          <Badge
                            variant={selectedUser.role === "admin" ? "default" : "secondary"}
                            className={`text-xs ${
                              selectedUser.role === "admin"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}
                          >
                            {selectedUser.role === "admin" ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <Users className="h-3 w-3 mr-1" />
                                Buyer
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">
                          <Badge
                            variant={selectedUser.isBlocked ? "destructive" : "default"}
                            className={`text-xs ${
                              selectedUser.isBlocked
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-green-100 text-green-800 border-green-200"
                            }`}
                          >
                            {selectedUser.isBlocked ? (
                              <>
                                <UserX className="h-3 w-3 mr-1" />
                                Blocked
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Active
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Created At</label>
                        <p className="text-xs truncate">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Updated At</label>
                        <p className="text-xs truncate">{formatDate(selectedUser.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-3 w-full">
                    <div className="flex gap-2 w-full">
                      {selectedUser.role !== "admin" && (
                        <Button
                          onClick={() => handleChangeUserRole(selectedUser._id, "admin")}
                          disabled={isChangingRole === selectedUser._id || !isOnline}
                          variant="outline"
                          size="sm"
                          className="border-purple-200 text-purple-600 hover:bg-purple-50 flex-1 min-w-0"
                        >
                          {isChangingRole === selectedUser._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-1" />
                              <span className="truncate">Make Admin</span>
                            </>
                          )}
                        </Button>
                      )}

                      {selectedUser.role !== "buyer" && (
                        <Button
                          onClick={() => handleChangeUserRole(selectedUser._id, "buyer")}
                          disabled={isChangingRole === selectedUser._id || !isOnline}
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 flex-1 min-w-0"
                        >
                          {isChangingRole === selectedUser._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Users className="h-4 w-4 mr-1" />
                              <span className="truncate">Make Buyer</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={() => handleToggleBlockStatus(selectedUser._id, selectedUser.isBlocked)}
                        disabled={isUpdatingUser === selectedUser._id || !isOnline}
                        variant={selectedUser.isBlocked ? "default" : "destructive"}
                        size="sm"
                        className="flex-1 min-w-0"
                      >
                        {isUpdatingUser === selectedUser._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : selectedUser.isBlocked ? (
                          <>
                            <ShieldOff className="h-4 w-4 mr-1" />
                            <span className="truncate">Unblock User</span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            <span className="truncate">Block User</span>
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(null)}
                        className="flex-1 min-w-0"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
