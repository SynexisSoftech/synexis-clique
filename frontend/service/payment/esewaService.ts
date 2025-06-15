class ESewaService {
  /**
   * Submit payment form programmatically
   */
  submitPaymentForm(formData: { formAction: string; fields: Record<string, string> }): void {
    const form = document.createElement("form")
    form.method = "POST"
    form.action = formData.formAction
    form.style.display = "none"

    Object.entries(formData.fields).forEach(([key, value]) => {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = value.toString()
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  /**
   * Decode Base64 response from eSewa
   */
  decodeResponse(base64Data: string): any {
    try {
      const decoded = Buffer.from(base64Data, "base64").toString("utf-8")
      return JSON.parse(decoded)
    } catch (error) {
      throw new Error("Invalid response format")
    }
  }

  /**
   * Check payment status using your backend API
   */
  async checkPaymentStatus(transactionUuid: string): Promise<any> {
    // This would call your backend API to check status with eSewa
    const response = await fetch(`/api/orders/payment-status/${transactionUuid}`)
    if (!response.ok) {
      throw new Error("Failed to check payment status")
    }
    return response.json()
  }
}

export const esewaService = new ESewaService()
