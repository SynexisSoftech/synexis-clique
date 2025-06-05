// // components/auth/AdminRouteGuard.tsx
// "use client";

// import { useAuth } from './context/AuthContext'; // Adjust path accordingly
// import { useRouter } from 'next/navigation';
// import { useEffect, ReactNode } from 'react';

// const AdminRouteGuard = ({ children }: { children: ReactNode }) => {
//   const { user, isLoading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     // 1. If auth state is still loading, don't do anything yet.
//     //    Let the loading indicator handle the UI.
//     if (isLoading) {
//       console.log('[AdminRouteGuard] Auth state is loading...');
//       return;
//     }

//     // 2. If loading is finished, then check user and role.
//     //    This block will only execute once isLoading is false.
//     console.log('[AdminRouteGuard] Auth loading finished. User:', user);
//     if (!user) {
//       console.warn("[AdminRouteGuard] No user found after loading. Redirecting to /login.");
//       router.replace('/auth/login');
//     } else if (user.role !== 'admin') {
//       console.warn(`[AdminRouteGuard] User is not an admin (role: ${user.role}). Redirecting to /login.`);
//       router.replace('/auth/login'); // Or a general access denied page like '/' or '/unauthorized'
//     } else {
//       console.log('[AdminRouteGuard] User is admin. Access granted.');
//     }

//   }, [user, isLoading, router]); // Dependencies: re-run if user, isLoading, or router changes.

//   // Render Logic:
//   // a. If still loading authentication state, show a loading message.
//   if (isLoading) {
//     console.log('[AdminRouteGuard] Rendering: Loading indicator (isLoading is true).');
//     return <div>Verifying access, please wait...</div>; // Or a proper loading spinner component
//   }

//   // b. If loading is complete, AND user is present AND user is an admin, render the children.
//   //    The useEffect above handles redirection if these conditions aren't met.
//   if (user && user.role === 'admin') {
//     console.log('[AdminRouteGuard] Rendering: Children (user is admin).');
//     return <>{children}</>;
//   }

//   // c. If loading is complete, but user is not an admin (or no user),
//   //    the useEffect will handle the redirect. In the meantime, show a loading
//   //    message to prevent flashing the protected content.
//   //    This state should be very brief.
//   console.log('[AdminRouteGuard] Rendering: Loading indicator (isLoading is false, but user not admin or null - awaiting redirect).');
//   return <div>Verifying access, please wait...</div>;
// };

// export default AdminRouteGuard;



// components/auth/AdminRouteGuard.tsx
"use client";

import { useAuth } from './context/AuthContext'; // Adjust path accordingly to go up two levels
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

const AdminRouteGuard = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, isAuthenticated } = useAuth(); // Destructure isAuthenticated
  const router = useRouter();

  useEffect(() => {
    // 1. If auth state is still loading, don't do anything yet.
    //    Let the loading indicator handle the UI.
    if (isLoading) {
      console.log('[AdminRouteGuard] Auth state is loading...');
      return;
    }

    // 2. If loading is finished, then check user and role.
    //    This block will only execute once isLoading is false.
    console.log('[AdminRouteGuard] Auth loading finished. User:', user, 'IsAuthenticated:', isAuthenticated);

    // If not authenticated (implies no user or token invalid), redirect to login
    if (!isAuthenticated) {
      console.warn("[AdminRouteGuard] Not authenticated. Redirecting to /auth/login.");
      router.replace('/auth/login');
    } else if (user && user.role !== 'admin') { // If authenticated but not admin
      console.warn(`[AdminRouteGuard] User is not an admin (role: ${user.role}). Redirecting to /auth/login.`);
      router.replace('/auth/login'); // Or a general access denied page like '/' or '/unauthorized'
    } else {
      console.log('[AdminRouteGuard] User is admin and authenticated. Access granted.');
    }

  }, [user, isLoading, isAuthenticated, router]); // Dependencies: re-run if user, isLoading, isAuthenticated, or router changes.

  // Render Logic:
  // a. If still loading authentication state, show a loading message.
  if (isLoading) {
    console.log('[AdminRouteGuard] Rendering: Loading indicator (isLoading is true).');
    return <div>Verifying access, please wait...</div>; // Or a proper loading spinner component
  }

  // b. If loading is complete, AND user is present AND user is an admin, render the children.
  //    The useEffect above handles redirection if these conditions aren't met.
  if (user && user.role === 'admin' && isAuthenticated) { // Ensure isAuthenticated is also true
    console.log('[AdminRouteGuard] Rendering: Children (user is admin and authenticated).');
    return <>{children}</>;
  }

  // c. If loading is complete, but user is not an admin (or no user),
  //    the useEffect will handle the redirect. In the meantime, show a loading
  //    message to prevent flashing the protected content.
  //    This state should be very brief.
  console.log('[AdminRouteGuard] Rendering: Loading indicator (isLoading is false, but user not admin or null - awaiting redirect).');
  return <div>Verifying access, please wait...</div>;
};

export default AdminRouteGuard;