// app/verify-otp/page.tsx (using app directory convention)
// Or pages/verify-otp.tsx (using pages directory convention)

import VerificationForm from './VerificationForm'; // Adjust path as needed

// No props needed here because VerificationForm now uses useSearchParams directly.
export default function VerifyOtpPage() {
  return (
    <VerificationForm />
  );
}