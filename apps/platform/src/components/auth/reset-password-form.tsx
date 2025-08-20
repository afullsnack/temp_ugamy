"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Link, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BrandLogoDark } from "../common/brand-logo-dark"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { authClient } from "@/lib/auth-client"

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
})

const ResetPassword = async (payload: { email: string }) => {
    const { data, error } = await authClient.forgetPassword.emailOtp({
        email: payload.email,
    });

    if (error) {
        throw error
    }

    return data
}

const ResetPasswordForm = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    // Reset password mutation
    const { mutateAsync, isPending } = useMutation({
        mutationFn: ResetPassword,
        onSuccess: () => {
            queryClient.resetQueries()
            navigate({ to: "/signin" })
        },
        onError: (error) => {
            toast.error(error.message || "Error resetting your password. Try again")
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await mutateAsync(values)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-md space-y-8 text-center">
                <div className="flex flex-col items-center gap-y-12">
                    <BrandLogoDark />
                    <div className="space-y-[24px]">
                        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Reset Your Password</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter Your Registered Email And We&apos;ll Send You A Link To Reset It.
                        </p>
                    </div>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Email:</FormLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                                        {...field}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="flex w-full h-[50px] justify-center font-bold rounded-md border border-transparent bg-primary px-4 py-2 text-sm text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                {isPending ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </div>
                    </form>
                </Form>
                <div className="text-center text-sm">
                    <Link to="/signin" className="font-medium">
                        Back to - <span className="text-primary hover:text-primary/90">Sign In</span>
                    </Link>
                    <p className="mt-4 text-xs text-gray-500">
                        Make sure to check your spam folder if you don&apos;t see the email within a few minutes.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordForm
