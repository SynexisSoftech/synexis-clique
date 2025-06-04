import axiosInstance from "../utils/axiosInstance";


export const signupUser = async(userData:any) => {
    try{
        const response = await axiosInstance.post('/api/auth/signup', userData);
        return response.data;
    }catch(error:any){
        throw error.response?.data || error.message;
    }
}


export const verifySignupOtp = async (verificationData: any) => {
  try {
    const response = await axiosInstance.post('/api/auth/verify-signup-otp', verificationData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const loginUser = async (credentials: any) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const forgotPasswordRequest = async (email: string) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const resetPasswordConfirm = async (resetData: any) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', resetData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};


