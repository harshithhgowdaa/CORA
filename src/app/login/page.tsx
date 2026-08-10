import { LoginButton } from '@/components/auth/login-button'
import Image from 'next/image'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; status?: string }> }) {
  const params = await searchParams
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#B8BCC4] p-4 sm:p-8">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-[24px] border border-[#E7E8EC] bg-white shadow-2xl">
        <div className="flex flex-col items-center justify-center space-y-4 border-b border-[#E7E8EC] bg-white px-6 py-10 sm:px-12">
          <div className="mb-2 flex w-full justify-center">
            <Image 
              src="/rvu-logo.png" 
              alt="RV University Logo" 
              width={240}
              height={112}
              className="h-28 w-auto object-contain" 
              priority
            />
          </div>
          <h3 className="text-[28px] font-semibold tracking-tight text-[#1A1D24]">Sign In to CORA - RVU</h3>
          <p className="text-[14px] font-medium text-[#6B7280]">
            Corporate & Alumni Relations CRM
          </p>
          {params.status === 'pending' && (
            <div className="mt-4 w-full rounded-full bg-blue-100 px-4 py-2 text-center text-[13px] font-medium text-blue-500">
              Your access request is pending administrator approval.
            </div>
          )}
          {params.error && (
            <div className="mt-4 w-full rounded-full bg-red-100 px-4 py-2 text-center text-[13px] font-medium text-red-600">
              {params.error}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-4 bg-[#F7F8FA] px-6 py-8 sm:px-12">
          <LoginButton />
        </div>
      </div>
    </div>
  )
}
