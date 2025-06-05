import { Suspense } from "react"
import ResetPasswordForm from "./reset-passowrd"
import Loading from "./loading"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
