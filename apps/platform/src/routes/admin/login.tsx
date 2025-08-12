import { createFileRoute } from '@tanstack/react-router'

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

export const Route = createFileRoute('/admin/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedValue, setSelectedValue] = useState<'admin-1' | 'admin-2'>(
    'admin-1',
  )
  const [otpValue, setOTPValue] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (otpValue && otpValue.length >= 6) {
      // TODO: submit otp for verification
      console.log('OTP Value', otpValue)
    }
  }, [otpValue])

  useEffect(() => {
    if (isLoading) {
      ;(async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          setIsLoading(false)
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
            onValueChange={(value: 'admin-1' | 'admin-2') =>
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
