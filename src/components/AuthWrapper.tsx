import React from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
  currentUser?: any;
  isAuthLoading?: boolean;
  onSignIn?: () => void;
  onCustomSignIn?: (user: any) => void;
}

/**
 * LOGIN COMPLETELY REMOVED
 * Always render the main app as guest. No login / register screen.
 */
export default function AuthWrapper({
  children,
}: AuthWrapperProps) {
  return <>{children}</>;
}
