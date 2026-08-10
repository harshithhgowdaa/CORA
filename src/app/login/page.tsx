import { LoginButton } from '@/components/auth/login-button'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; status?: string }> }) {
  const params = await searchParams
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Sign In to CORA</h3>
          <p className="text-sm text-gray-500">
            Corporate & Alumni Relations CRM
          </p>
          {params.status === 'pending' && <p className="text-sm text-amber-600">Your access request is pending administrator approval.</p>}
          {params.error && <p className="text-sm text-red-600">{params.error}</p>}
        </div>
        <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16">
          <LoginButton />
        </div>
      </div>
    </div>
  )
}
