"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
// import AppleLoginIcon from "../common/apple-login-icon"
// import FacebookLoginIcon from "../common/facebook-login-icon"
// import GoogleLoginIcon from "../common/google-login-icon"
import { BrandLogoDark } from "../common/brand-logo-dark"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

const SignupSchema = z
    .object({
        fullname: z.string().min(1, "Fullname is required"),
        username: z.string().min(1, "Username is required"),
        email: z.string().min(1, "Email is required").email("Invalid email address"),
        phone: z.string().min(1, "Phone number is required"),
        password: z.string().min(8, "Password must be at least 8 characters long"),
        confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"], // Path of the error
    })

type SignupFormValues = z.infer<typeof SignupSchema>

// Handle Signup
const signUp = async (payload: SignupFormValues) => {
    const { error, data } = await authClient.signUp.email({
        email: payload.email,
        password: payload.password,
        name: payload.fullname,
        username: payload.username,
        phoneNumber: payload.phone,
    })

    if (error) {
        throw error
    }

    return data
}

export default function SignupForm() {
    const navigate = useNavigate()

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(SignupSchema),
        mode: "onChange",
        defaultValues: {
            fullname: "",
            username: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    })

    // Handle verify Email
    const handleSendEmailVerification = async (payload: { email: string }) => {
        // Send Email verification API mutation
        const { data, error } = await authClient.emailOtp.sendVerificationOtp({
            email: payload.email,
            type: "email-verification",
        })

        if (data?.success) {
            toast.success(`OTP has been sent to: ${payload.email}`)
            navigate({
                to: "/verify-email",
                search: (prev) => ({ ...prev, email: `${payload.email}` }),
            })
        }

        if (error) {
            toast.error(error.message ?? "Error sending OTP")
        }
    }

    // Reset Password mutation
    const { isPending, mutateAsync } = useMutation({
        mutationFn: signUp,
        onError: (error) => {
            toast.error(error.message || "An unexpected error occured, kindly try again")
        }
    })

    const onSubmit = async (values: SignupFormValues) => {
        await mutateAsync(values)
            .then((data) => {
                if (data.user.emailVerified) {
                    toast.success("Proceed to sign in")
                    navigate({
                        to: "/signin"
                    })
                } else {
                    handleSendEmailVerification({
                        email: values.email
                    })
                }
            })
    }

    return (
        <div className="z-10 flex w-full min-h-screen items-center justify-center bg-white">
            <div className="w-full p-8 pt-[80px] md:pt-8">
                <div className="mb-[50px] flex w-full items-center justify-center p-0 md:hidden">
                    <BrandLogoDark />
                </div>
                {/* Header */}
                <div className="mb-8 space-y-[24px] text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Create Your Ugamy Account</h1>
                    <p className="text-sm text-[hsla(221,39%,11%,1)]">Join The Community. Start Mastering Your Favorite Games.</p>
                </div>
                {/* Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Fullname */}
                        <FormField
                            control={form.control}
                            name="fullname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm text-gray-700">Fullname:</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Enter info"
                                            {...field}
                                            className="w-full border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Username */}
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm text-gray-700">Username:</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Enter info" {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm text-gray-700">Email:</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Enter info" {...field} className="flex-1" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Phone */}
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm text-gray-700">Phone:</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Enter info" {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password and Confirm Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 md:items-start gap-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm text-gray-700">Password:</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter info"
                                                    {...field}
                                                    className="w-full pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm text-gray-700">Confirm Password:</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Enter info"
                                                    {...field}
                                                    className="w-full pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Next Button */}
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-[50px] text-bold text-base text-white py-4 px-8 mt-6"
                        >
                            {isPending ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>
                </Form>

                {/* Divider */}
                {/* <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div> */}

                {/* Social Login */}
                {/* <div className="mb-6 flex justify-center gap-4"> */}
                {/* Google login */}
                {/* <button
                        onClick={() => handleSocialLogin("Google")}
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-50"
                    >
                        <GoogleLoginIcon />
                    </button> */}
                {/* Facebook login */}
                {/* <button
                        onClick={() => handleSocialLogin("Facebook")}
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-50"
                    >
                        <FacebookLoginIcon />
                    </button> */}
                {/* Apple login */}
                {/* <button
                        onClick={() => handleSocialLogin("Apple")}
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-50"
                    >
                        <AppleLoginIcon />
                    </button> */}
                {/* </div> */}

                {/* Sign In Link */}
                <div className="mt-2 mb-4 text-center">
                    <span className="text-sm text-gray-600">Already have an account? </span>
                    <Link to="/signin" className="text-sm font-medium text-[hsla(160,84%,39%,1)] hover:text-cyan-700">
                        Sign In
                    </Link>
                </div>
                {/* Terms */}
                <div className="text-center text-xs text-gray-500">
                    By signing up, you agree to our{" "}
                    <Link to="/terms" className="text-[hsla(160,84%,39%,1)] hover:text-cyan-700">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-[hsla(160,84%,39%,1)] hover:text-cyan-700">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    )
}
