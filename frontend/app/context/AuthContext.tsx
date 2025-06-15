// // context/AuthContext.tsx
// "use client";

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { useRouter } from 'next/navigation';
// import apiClient from '@/utils/axiosInstance';

// // Define the shape of the user object
// interface User {
//   id: string;
//   username: string;
//   email: string;
//   role: 'user' | 'admin';
//   photoURL: string;
// }

// // Define credentials for the login function
// interface LoginCredentials {
//   email: string;
//   password: string;
// }

// // Define the shape of the context
// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   login: (credentials: LoginCredentials) => Promise<void>; // Updated signature
//   logout: () => void;
//   isLoading: boolean;
//   error: string | null; // Add error state for the form to use
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true); // Manages app load, not form submission
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   // Effect for hydrating user state on initial app load
//   useEffect(() => {
//     // This effect runs only once on mount to check for an existing session
//     const hydrate = () => {
//         try {
//             const storedToken = localStorage.getItem('token');
//             const storedUser = localStorage.getItem('user');
            
//             if (storedToken && storedUser) {
//                 setToken(storedToken);
//                 setUser(JSON.parse(storedUser));
//             }
//         } catch (e) {
//             console.error("Failed to hydrate auth state from localStorage", e);
//             // Clear potentially corrupted storage
//             localStorage.removeItem('user');
//             localStorage.removeItem('token');
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     hydrate();
//   }, []);

//   // Login function now handles the API call
//   const login = async (credentials: LoginCredentials) => {
//     setError(null); // Reset previous errors

//     try {
//       // Use our apiClient to make the login request
//       const response = await apiClient.post('/api/auth/login', credentials);
//       const data = response.data; // { message, accessToken, user }

//       if (data.user && data.accessToken) {
//         // Update state
//         setUser(data.user);
//         setToken(data.accessToken);

//         // Persist to localStorage
//         localStorage.setItem('user', JSON.stringify(data.user));
//         localStorage.setItem('token', data.accessToken);

//         // Redirect based on role
//         if (data.user.role === 'admin') {
//           router.push('/admin'); // A more specific admin page is better
//         } else {
//           router.push('/');
//         }
//       } else {
//           // This case handles unexpected successful responses without user/token
//           throw new Error("Login response was successful but did not contain user data or token.");
//       }
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
//       setError(errorMessage);
//       console.error("Login failed in AuthContext:", err);
//       // Re-throw the error so the calling component knows the login failed
//       throw new Error(errorMessage);
//     }
//   };

//   const logout = () => {
//     // Clear state
//     setUser(null);
//     setToken(null);
//     // Clear from localStorage
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     // Redirect to login page
//     router.push('/auth/login');
//   };

//   const value = { user, token, login, logout, isLoading, error };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };




// context/AuthContext.tsx


// "use client";

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import apiClient, { updateApiToken, clearApiToken } from '../../utils/axiosInstance';
// import axios from 'axios';

// // Define User and LoginCredentials interfaces here or import them if they are in a shared type file
// interface User {
//   id: string;
//   email: string;
//   role: 'user' | 'admin';
//   // Add other user properties as needed
// }

// interface LoginCredentials {
//   email: string;
//   password: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (credentials: LoginCredentials) => Promise<void>; // This is what needs to be defined
//   logout: () => void;
//   isLoading: boolean;
//   error: string | null;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const PUBLIC_PATHS = ['/auth/login', '/auth/register'];
// let inMemoryToken: string | null = null;

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const router = useRouter();
//  const pathname = usePathname();
//   // Helper function to consolidate clearing auth state
//   const clearAuthAndLogout = () => {
//     inMemoryToken = null;
//     clearApiToken(); // Clears Axios default header
//     setIsAuthenticated(false);
//     setUser(null); // Explicitly clear user state
//     localStorage.removeItem('user'); // Clear user from localStorage
//     // No need to set error here, as it's part of the error-handling flow if needed.
//   };

//   useEffect(() => {
//     const attemptSilentLogin = async () => {
//         if (PUBLIC_PATHS.includes(pathname)) {
//         setIsLoading(false);
//         return;
//       }
//       setIsLoading(true); // Start loading

//       try {
//         const { data } = await apiClient.post(
//           '/api/auth/refresh-token',
//           {},
//           { withCredentials: true }
//         );

//         if (data.accessToken) {
//           inMemoryToken = data.accessToken;
//           updateApiToken(inMemoryToken);

//           try {
//             const refreshedUserResponse = await apiClient.get('/api/auth/me');
//             const fetchedUser = refreshedUserResponse.data.user;

//             if (fetchedUser && fetchedUser.id) {
//               setUser(fetchedUser);
//               localStorage.setItem('user', JSON.stringify(fetchedUser));
//               setIsAuthenticated(true);
//               setError(null);
//             } else {
//               console.warn("[AuthContext] '/api/auth/me' returned no valid user data.");
//               setIsAuthenticated(false);
//               clearAuthAndLogout();
//             }
//           } catch (userFetchError: any) {
//             console.error("[AuthContext] Failed to fetch user details after refreshing token:", userFetchError);
//             clearAuthAndLogout();
//             setError(axios.isAxiosError(userFetchError) ? userFetchError.response?.data?.message : 'Failed to get user info.');
//           }

//         } else {
//           console.warn("[AuthContext] Refresh token endpoint did not provide an access token.");
//           clearAuthAndLogout();
//         }
//       } catch (e: any) {
//         console.info("[AuthContext] Silent refresh failed (e.g., no refresh token or server error).", e);
//         clearAuthAndLogout();
//         if (axios.isAxiosError(e) && e.response?.data?.message) {
//             setError(e.response.data.message);
//         } else if (e instanceof Error) {
//             setError(e.message);
//         } else {
//             setError('An unknown error occurred during silent refresh.');
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     attemptSilentLogin();
//   }, [pathname]);

//   // --- RE-INSERTED LOGIN FUNCTION HERE ---
//   const login = async (credentials: LoginCredentials) => {
//     setError(null); // Clear previous errors on new login attempt
//     try {
//       const response = await apiClient.post('/api/auth/login', credentials);
//       const data = response.data;

//       if (data.user && data.accessToken) {
//         setUser(data.user);
//         inMemoryToken = data.accessToken;
//         updateApiToken(inMemoryToken); // Configure Axios instance

//         localStorage.setItem('user', JSON.stringify(data.user)); // Persist non-sensitive user data
//         // DO NOT store data.accessToken in localStorage

//         setIsAuthenticated(true);

//         if (data.user.role === 'admin') {
//           router.push('/admin');
//         } else {
//           router.push('/');
//         }
//       } else {
//         throw new Error("Login response did not contain user data or token.");
//       }
//     } catch (err: any) {
//         // Use the consolidated clearAuthAndLogout for login failures too
//         clearAuthAndLogout(); // Clear all auth state on login failure

//         if (axios.isAxiosError(err) && err.response?.data?.message) {
//             setError(err.response.data.message);
//         } else if (err instanceof Error) {
//             setError(err.message);
//         } else {
//             setError('An unknown error occurred during login.');
//         }
//         throw err; // Re-throw to allow component to catch if needed
//     }
//   };
//   // --- END OF RE-INSERTED LOGIN FUNCTION ---


//   const logout = async () => {
//     try {
//         await apiClient.post('/api/auth/logout', {}, { withCredentials: true });
//     } catch (e) {
//         console.error("Logout API call failed", e);
//     }
//     clearAuthAndLogout(); // Clear all auth state on logout
//     router.push('/auth/login');
//   };
//   useEffect(() => {
//     const handleAuthFailure = () => {
//         console.warn('[AuthContext] Auth failure detected globally. Logging out.');
//         logout(); // Or call a more direct state-clearing function
//     };

//     window.addEventListener('auth-failure', handleAuthFailure);

//     return () => {
//         window.removeEventListener('auth-failure', handleAuthFailure);
//     };
// }, [logout])

//   const value = { user, login, logout, isLoading, error, isAuthenticated };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { updateApiToken, clearApiToken } from "../../utils/axiosInstance"

interface User {
  id: string
  email: string
  role: "user" | "admin"
  username?: string
  photoURL?: string
  token?: string
  accessToken?: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)

          // Set token in API client
          const token = userData.token || userData.accessToken
          if (token) {
            updateApiToken(token)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth failure events
    const handleAuthFailure = () => {
      logout()
    }

    window.addEventListener("auth-failure", handleAuthFailure)
    return () => window.removeEventListener("auth-failure", handleAuthFailure)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      if (data.user && data.accessToken) {
        const userData = {
          ...data.user,
          token: data.accessToken,
          accessToken: data.accessToken,
        }

        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem("user", JSON.stringify(userData))

        // Set token in API client
        updateApiToken(data.accessToken)
      } else {
        throw new Error("Login response did not contain user data or token")
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
      setIsAuthenticated(false)
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("accessToken")
    clearApiToken()

    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login"
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
