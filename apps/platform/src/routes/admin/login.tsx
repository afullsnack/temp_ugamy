import { createFileRoute, useRouter } from '@tanstack/react-router'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { LoaderCircle } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useSession } from '@/lib/auth-hooks'
import { authClient } from '@/lib/auth-client'
import { setAdminToken } from '@/components/auth/admin-auth-guard'

export const Route = createFileRoute('/admin/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const [selectedValue, setSelectedValue] = useState<'admin-1' | 'admin-2' | 'admin-3'>(
    'admin-1',
  )
  const [otpValue, setOTPValue] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)


  const getAdminEmail = (adminValue: 'admin-1' | 'admin-2' | 'admin-3') => {
    switch (adminValue) {
      case 'admin-1':
        return 'miraclef60@gmail.com';
      case 'admin-2':
        return 'jesudara.j@gmail.com';
      case 'admin-3':
        return 'adiejoel14@gmail.com';
      default:
        return 'miraclef60@gmail.com'
    }
  }

  useEffect(() => {
    const verifyOTP = async (otp: string) => {
      try {
        const { data, error } = await authClient.signIn.emailOtp({
          email: getAdminEmail(selectedValue),
          otp: otp,
        })

        if (error) {
          setOTPValue(undefined)
          toast.error(error.message || 'Failed to verify OTP. Please try again.')
          return
        }

        // Check if user has admin role
        if (data?.user?.role !== 'admin') {
          setOTPValue(undefined)
          toast.error('Unauthorized: Admin access required')
          return
        }

        // Store the admin token
        if (data?.token) {
          setAdminToken(data.token)
          toast.success(`Welcome back, ${data.user.name}!`)
          router.navigate({ to: '/admin/dashboard' })
        } else {
          setOTPValue(undefined)
          toast.error('Authentication failed: No token received')
        }
      } catch (err) {
        setOTPValue(undefined)
        toast.error('An unexpected error occurred. Please try again.')
        console.error('Admin login error:', err)
      }
    }

    if (otpValue && otpValue.length >= 6) {
      verifyOTP(otpValue)
    }
  }, [otpValue, selectedValue, router])

  useEffect(() => {
    if (isLoading) {
      ; (async () => {
        try {
          const { error, data } = await authClient.emailOtp.sendVerificationOtp({
            email:
              getAdminEmail(selectedValue),
            type: 'sign-in',
          })
          await new Promise((resolve) => setTimeout(resolve, 2000))
          if (error) {
            setIsLoading(false)
            toast.error(
              error.message || 'Failed to send OTP, please try again later',
            )
            return
          }
          setIsLoading(false)
          console.log("OTP Sent", data)
          toast.success('OTP Code sent')
        } catch (error) {
          console.error(error)
        }
      })()
    }
  }, [isLoading])

  return (
    <div className="w-full grid min-h-screen items-center justify-center">
      <div className="max-w-3xl mx-auto grid items-center justify-center">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        <span className="text-balance">
          Select admin email to login with OTP code
        </span>
        <form className="space-y-4 items-center justify-center flex flex-col mt-6">
          <ToggleGroup
            type="single"
            orientation="vertical"
            className="flex flex-col gap-4"
            defaultValue={selectedValue}
            value={selectedValue}
            onValueChange={(value: 'admin-1' | 'admin-2' | 'admin-3') =>
              setSelectedValue(value)
            }
          >
            <ToggleGroupItem value="admin-1" aria-label="Toggle bold">
              <Button type="button" size="default" variant="ghost">
                miraclef60@gmail.com
              </Button>
            </ToggleGroupItem>
            <ToggleGroupItem value="admin-2" aria-label="Toggle italic">
              <Button type="button" size="default" variant="ghost">
                jesudara.j@gmail.com
              </Button>
            </ToggleGroupItem>
            <ToggleGroupItem value='admin-3' aria-label='Toggle italic'>
              <Button type="button" size="default" variant="ghost">
                adiejoel14@gmail.com
              </Button>
            </ToggleGroupItem>
          </ToggleGroup>
          {!isLoading ? (
            <Button
              type="button"
              variant="link"
              size="lg"
              onClick={() => setIsLoading(true)}
            >
              Get OTP code
            </Button>
          ) : (
            <LoaderCircle className="animate-spin" />
          )}
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={otpValue}
            onChange={(value) => setOTPValue(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </form>
      </div>
    </div>
  )
}
