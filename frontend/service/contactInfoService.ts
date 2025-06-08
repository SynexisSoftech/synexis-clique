// services/contactInfoService.ts
import apiClient from '../utils/axiosInstance';

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

export interface ContactInfo {
  _id?: string;
  phoneNumbers: IPhoneNumber[];
  emails: IEmail[];
  locations: ILocation[];
  updatedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const createOrUpdateContactInfo = async (
  data: Partial<ContactInfo>
): Promise<ContactInfo> => {
  try {
    const response = await apiClient.post<ContactInfo>('/api/admin/contact-info', data);
    return response.data;
  } catch (error) {
    console.error('Error creating or updating contact info:', error);
    throw error;
  }
};

export const updateContactInfo = async (
  id: string,
  data: Partial<ContactInfo>
): Promise<ContactInfo> => {
  try {
    const response = await apiClient.put<ContactInfo>(`/api/admin/contact-info/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating contact info with ID ${id}:`, error);
    throw error;
  }
};

export const getContactInfo = async (): Promise<ContactInfo> => {
  try {
    const response = await apiClient.get<ContactInfo>('/api/admin/contact-info');
    return response.data;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    throw error;
  }
};

export const getContactInfoById = async (id: string): Promise<ContactInfo> => {
  try {
    const response = await apiClient.get<ContactInfo>(`/api/admin/contact-info/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contact info with ID ${id}:`, error);
    throw error;
  }
};

export const deleteContactInfo = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/contact-info/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting contact info with ID ${id}:`, error);
    throw error;
  }
};