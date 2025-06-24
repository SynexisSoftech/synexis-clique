import { Console } from "console";
import axiosInstance from "../utils/axiosInstance";


export const signupUser = async(userData:any) => {
    try{
        const response = await axiosInstance.post('/api/auth/signup', userData);
        return response.data;
    }catch(error:any){
        // Preserve the full error response for better error handling
        throw error;
    }
}


export const verifySignupOtp = async (verificationData: any) => {
  try {
    const response = await axiosInstance.post('/api/auth/verify-signup-otp', verificationData);
    return response.data;
  } catch (error: any) {
    // Preserve the full error response for better error handling
    throw error;
  }
};


export const resendSignupOtp = async (data: { email: string }) => {
  try {
    const response = await axiosInstance.post('/api/auth/resend-signup-otp', data);
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    // Preserve the full error response for better error handling
    throw error;
  }
};



export const loginUser = async (credentials: any) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    // Preserve the full error response for better error handling
    throw error;
  }
};

export const forgotPasswordRequest = async (email: string) => {
  try {
    const response = await axiosInstance.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    // Preserve the full error response for better error handling
    throw error;
  }
};

export const resetPasswordConfirm = async (resetData: any) => {
  try {
    const response = await axiosInstance.post('/api/auth/reset-password', resetData);
    return response.data;
  } catch (error: any) {
    // Preserve the full error response for better error handling
    throw error;
  }
};

export const resendForgotPasswordOtpRequest = async (email: string) => {
  try {
    const response = await axiosInstance.post('/api/auth/resend-forgot-password-otp', { email });
    return response.data;
  } catch (error: any) {
    // Preserve the full error response for better error handling
    throw error;
  }
};

export const getAuthenticatedUser = async () => {
 try {
 // The GET request to the protected /me route.
// axiosInstance should automatically include the auth token if configured correctly.
 const response = await axiosInstance.get('/api/auth/me');
return response.data; // This will return { message: '...', user: { ... } }
 } catch (error: any) {
 // Preserve the full error response for better error handling
throw error;
}
};

// Profile update function
export const updateProfile = async (profileData: {
  firstName?: string;
  lastName?: string;
  photoBase64?: string;
}) => {
  try {
    const response = await axiosInstance.put('/api/auth/profile', profileData);
    return response.data;
  } catch (error: any) {
    // Preserve the full error response for better error handling
    throw error;
  }
};

// Change password function
export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    console.log('Sending password change request:', { currentPassword: '***', newPassword: '***' });
    const response = await axiosInstance.put('/api/auth/change-password', passwordData);
    console.log('Password change response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Password change API error:', error);
    // Preserve the full error response for better error handling
    throw error;
  }
};