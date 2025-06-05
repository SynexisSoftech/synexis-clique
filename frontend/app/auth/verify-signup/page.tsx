import { Suspense } from "react"
import VerificationForm from "./VerificationForm"
import Loading from "./loading"

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerificationForm />
    </Suspense>
  )
}
