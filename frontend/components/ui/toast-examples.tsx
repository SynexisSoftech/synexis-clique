"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function ToastExamples() {
  const { toast } = useToast()

  const showSuccessToast = () => {
    toast({
      title: "Success!",
      description: "Your action was completed successfully.",
      variant: "success",
    })
  }

  const showErrorToast = () => {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again.",
      variant: "error",
    })
  }

  const showWarningToast = () => {
    toast({
      title: "Warning",
      description: "Please review your information before proceeding.",
      variant: "warning",
    })
  }

  const showInfoToast = () => {
    toast({
      title: "Information",
      description: "Here's some helpful information for you.",
      variant: "info",
    })
  }

  const showDefaultToast = () => {
    toast({
      title: "Default Toast",
      description: "This is a default toast notification.",
    })
  }

  return (
    <div className="flex flex-wrap gap-2 p-4">
      <Button onClick={showSuccessToast} variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
        Success Toast
      </Button>
      <Button onClick={showErrorToast} variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
        Error Toast
      </Button>
      <Button onClick={showWarningToast} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
        Warning Toast
      </Button>
      <Button onClick={showInfoToast} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
        Info Toast
      </Button>
      <Button onClick={showDefaultToast} variant="outline">
        Default Toast
      </Button>
    </div>
  )
} 
