import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth/signup')({
  component: Signup,
})

function Signup() {
  // const context = Route.useRouteContext()
  // const queryClient = context.queryClient
  return (
    <div className="container text-center mt-[10%]">
      <form
        action={async (formData) => {
          console.log('Formdata', formData)
          const username = formData.get('username')?.toString(),
            email = formData.get('email')?.toString(),
            fullName = formData.get('fullName')?.toString(),
            phone = formData.get('phone')?.toString(),
            password = formData.get('password')?.toString(),
            confirm_password = formData.get('confirm_password')?.toString()
          console.log(
            'Extracted data',
            username,
            email,
            phone,
            fullName,
            password,
            confirm_password,
          )

          if (
            !username ||
            !email ||
            !fullName ||
            !phone ||
            !password ||
            !confirm_password
          ) {
            return window.alert('Fill required fields')
          }

          if (password !== confirm_password) {
            return window.alert('Passwords do not match')
          }

          const { data, error } = await authClient.signUp.email({
            email,
            password,
            name: username,
            username,
            displayUsername: username,
            phoneNumber: phone
          })

          if (error) {
            console.log('Error', error)
            return window.alert('Error creating user...')
          }
          console.log('Data', data)
          window.alert('Account created')
        }}
        className="max-w-lg border-zinc-500 mx-auto space-y-2.5"
      >
        <Input name="fullName" placeholder="Full name" className="w-full" />
        <Input
          name="username"
          placeholder="Enter username"
          className="w-full"
        />
        <Input name="email" placeholder="Enter email" className="w-full" />
        <Input name="phone" placeholder="Enter phone" className="w-full" />
        <Input
          name="password"
          placeholder="Enter password"
          type="password"
          className="w-full"
        />
        <Input
          name="confirm_password"
          placeholder="Confirm password"
          type="password"
          className="w-full"
        />
        <Button type="submit">Signup</Button>
      </form>
    </div>
  )
}
