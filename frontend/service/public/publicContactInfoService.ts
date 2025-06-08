// services/publicContactInfoService.ts
import apiClient from '../../utils/axiosInstance';

export interface IPhoneNumber {
  label: string;
  number: string;
}

export interface IEmail {
  label: string;
  email: string;
}

export interface ILocation {
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  googleMapsUrl?: string;
}

export interface PublicContactInfo {
  phoneNumbers: IPhoneNumber[];
  emails: IEmail[];
  locations: ILocation[];
}

export const getPublicContactInfo = async (): Promise<PublicContactInfo> => {
  try {
    const response = await apiClient.get<PublicContactInfo>('/api/contact-info');
    return response.data;
  } catch (error) {
    console.error('Error fetching public contact info:', error);
    
    // Return empty structure if not found (matches controller behavior)
    if ((error as any).response?.status === 404) {
      return {
        phoneNumbers: [],
        emails: [],
        locations: []
      };
    }
    
    throw error;
  }
};

export const getPublicContactInfoById = async (id: string): Promise<PublicContactInfo> => {
  try {
    const response = await apiClient.get<PublicContactInfo>(`/api/contact-info/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public contact info with ID ${id}:`, error);
    
    // Return empty structure if not found (matches controller behavior)
    if ((error as any).response?.status === 404) {
      return {
        phoneNumbers: [],
        emails: [],
        locations: []
      };
    }
    
    throw error;
  }
};