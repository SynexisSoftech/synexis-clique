"use client";

import Link from 'next/link';
import { useAuth } from './context/AuthContext'; // Adjust path to your AuthContext
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { showSecurityToast } from '../components/ui/security-toast';

// Define a type for the component's props for clarity.
interface AdminRouteGuardProps {
  children: ReactNode;
}

/**
 * A client-side component that acts as a gatekeeper for admin-only routes.
 * It leverages the AuthContext to ensure that only authenticated users with an
 * 'admin' role can view the child components.
 *
 * How it works:
 * 1. It monitors the authentication state from `useAuth()`: `isLoading`, `isAuthenticated`, and `user`.
 * 2. An effect runs whenever these states change.
 * 3. If authentication is still loading, it does nothing and waits.
 * 4. Once loading is complete, it checks for valid conditions:
 * - Is the user authenticated?
 * - Does the user object exist?
 * - Is the user's role 'admin'?
 * 5. If any of these checks fail, it redirects the user to the login page.
 * 6. While checks are pending or if access is denied (before the redirect completes),
 * it displays a loading message to prevent flashing the protected content.
 * 7. If all checks pass, it renders the protected child components.
 */
const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  // Destructure the necessary state and functions from our AuthContext.
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. Don't perform any checks or redirects while the AuthContext is still
    //    initializing and fetching the user state (e.g., on initial page load).
    if (isLoading) {
      return;
    }

    // 2. Once loading is complete, perform the authorization checks.
    //    We redirect if the user is not authenticated OR if their role is not 'admin'.
    //    This covers all unauthorized cases: not logged in, logged in as a regular user,
    //    or any other invalid state.
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/auth/login');
      // Use replace to avoid adding the blocked page to browser history.
    }

  }, [user, isLoading, isAuthenticated, router]); // The effect re-runs if any of these dependencies change.
  

  // 3. Render logic:
  //    - If auth state is loading, or if the user is not a verified admin, we show a
  //      loading state. This prevents the protected `children` from ever flashing on the screen
  //      for an unauthorized user while the `useEffect` is preparing to redirect.
  //    - The component only renders the `children` if all conditions are explicitly met.
  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-700">Verifying access, please wait...</h2>
        <p className="text-sm text-gray-500 mt-2">Redirecting to the login page if not authorized.</p>
      </div>
    </div>
  );
}

  // 4. If all checks pass, the user is a verified admin. Render the protected content.
  return <>{children}</>;
};

export default AdminRouteGuard;