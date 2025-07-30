"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { BrandLogoDark } from "../common/brand-logo-dark"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { authClient } from "@/lib/auth-client"

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
})

const ResetPasswordForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const emailToSendLink = form.watch("email");

        const { data, error } = await authClient.forgetPassword.emailOtp({
            email: `${values}`,
        });
        if (data?.success) {
            toast.success(`Check you email: ${emailToSendLink}`)
        }
        if (error) {
            toast.error(error.message ?? "Error sending reset link")
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-md space-y-8 text-center">
                <div className="flex flex-col items-center gap-y-12">
                    <BrandLogoDark />
                    <div className="space-y-[24px]">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Reset Your Password</h2>
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
                                disabled={!form.formState.isValid || form.formState.isSubmitting}
                                className="flex w-full h-[50px] justify-center font-bold rounded-md border border-transparent bg-primary px-4 py-2 text-sm text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
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
