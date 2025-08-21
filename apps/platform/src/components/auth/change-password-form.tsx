"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { BrandLogoDark } from "../common/brand-logo-dark"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { authClient } from "@/lib/auth-client"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

const formSchema = z
    .object({
        otp: z
            .string()
            .length(6, { message: "OTP must be exactly 6 digits." })
            .regex(/^\d+$/, { message: "OTP must contain only numbers." }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters." })
            .regex(/(?=.*[0-9!@#$%^&*])/, {
                message: "Password must include a number or symbol.",
            }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match.",
    })

const ChangePasswordForm = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const search = useSearch({
        from: "/change-password",
    })

    // Send OTP mutation
    const { mutate: sendOtp, isPending: sendingOtp } = useMutation({
        mutationFn: () =>
            authClient.forgetPassword.emailOtp({
                email: search?.email,
            }),
        onSuccess: () => {
            toast.success("OTP sent to your email.")
        },
        onError: (err: any) => {
            toast.error(err?.message || "Failed to send OTP")
        },
    })

    const handleSendOtp = () => {
        if (!search.email) {
            toast.error("Invalid email parameter")
            return
        }
        sendOtp()
    }

    // Change password mutation (called only after OTP verification succeeds)
    const { mutateAsync: changePwd, isPending: changing } = useMutation({
        mutationFn: (payload: { otp: string; password: string }) =>
            authClient.emailOtp.resetPassword({
                email: search?.email,
                otp: payload.otp,
                password: payload.password,
            }),
        onSuccess: () => {
            toast.success("Password changed successfully")
            navigate({ to: "/signin" })
        },
        onError: (err: any) => {
            toast.error(err?.message || "Error changing password")
        },
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { otp: "", password: "", confirmPassword: "" },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!search.email) {
            toast.error("Invalid email parameter")
            return
        }
        try {
            await changePwd({ otp: values.otp, password: values.password })
        } catch (err: any) {
            toast.error(err?.message || "Invalid OTP")
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md flex flex-col gap-y-8 items-center text-center">
                <BrandLogoDark />
                <div className="w-full space-y-[16px]">
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
                        Change Your Password
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        {search.email
                            ? `OTP was sent to ${search.email}. Check your inbox.`
                            : "Invalid email parameter."}
                    </p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-7"
                    >
                        {/* New Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            className="placeholder:text-sm"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                                            onClick={() => setShowPassword((s) => !s)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 text-start">
                                        (Min. 8 characters, include a number or symbol)
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Confirm password"
                                            className="placeholder:text-sm"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                                            onClick={() => setShowConfirm((s) => !s)}
                                        >
                                            {showConfirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="w-full space-y-[4px]">
                            {/* OTP Field */}
                            <FormField
                                control={form.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OTP</FormLabel>
                                        <Input
                                            {...field}
                                            id="otp"
                                            maxLength={6}
                                            placeholder="Enter OTP"
                                            className="placeholder:text-sm"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-start">
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    disabled={sendingOtp}
                                    onClick={handleSendOtp}
                                    className="p-0"
                                >
                                    {sendingOtp ? "Resending..." : "Resend OTP"}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={changing}
                            className="w-full h-[50px] font-bold"
                        >
                            {changing ? "Changing..." : "Change Password"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default ChangePasswordForm
