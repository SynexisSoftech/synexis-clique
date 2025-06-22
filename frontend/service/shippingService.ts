import apiClient from "../utils/axiosInstance"

export interface ICity {
  _id?: string
  name: string
  shippingCharge: number
  isActive: boolean
}

export interface IProvince {
  _id: string
  name: string
  cities: ICity[]
  isActive: boolean
}

export interface ShippingData {
  success: boolean
  count: number
  data: IProvince[]
}

export interface CityShippingData {
  success: boolean
  data: {
    province: string
    city: string
    shippingCharge: number
  }
}

export const shippingService = {
  // Get all provinces with cities for checkout
  getProvincesForCheckout: async (): Promise<ShippingData> => {
    const response = await apiClient.get("/api/shipping/provinces")
    return response.data
  },

  // Get shipping charge for a specific city
  getShippingChargeByCity: async (cityName: string): Promise<CityShippingData> => {
    const response = await apiClient.get(`/api/shipping/city/${encodeURIComponent(cityName)}`)
    return response.data
  },

  // Get cities by province
  getCitiesByProvince: async (provinceName: string): Promise<any> => {
    const response = await apiClient.get(`/api/shipping/provinces/${encodeURIComponent(provinceName)}/cities`)
    return response.data
  },

  // Admin functions
  getAllProvinces: async (): Promise<ShippingData> => {
    const response = await apiClient.get("/api/admin/shipping/provinces")
    return response.data
  },

  createProvince: async (data: { name: string }): Promise<any> => {
    const response = await apiClient.post("/api/admin/shipping/provinces", data)
    return response.data
  },

  addCityToProvince: async (provinceId: string, cityData: { name: string; shippingCharge: number }): Promise<any> => {
    const response = await apiClient.post(`/api/admin/shipping/provinces/${provinceId}/cities`, cityData)
    return response.data
  },

  updateCityShippingCharge: async (
    provinceId: string, 
    cityId: string, 
    data: { name?: string; shippingCharge?: number; isActive?: boolean }
  ): Promise<any> => {
    const response = await apiClient.put(`/api/admin/shipping/provinces/${provinceId}/cities/${cityId}`, data)
    return response.data
  },

  updateProvince: async (provinceId: string, data: { name: string }): Promise<any> => {
    const response = await apiClient.put(`/api/admin/shipping/provinces/${provinceId}`, data)
    return response.data
  },

  deleteProvince: async (provinceId: string): Promise<any> => {
    const response = await apiClient.delete(`/api/admin/shipping/provinces/${provinceId}`)
    return response.data
  },

  deleteCityFromProvince: async (provinceId: string, cityId: string): Promise<any> => {
    const response = await apiClient.delete(`/api/admin/shipping/provinces/${provinceId}/cities/${cityId}`)
    return response.data
  }
} 