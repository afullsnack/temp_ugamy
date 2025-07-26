import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import AppleLoginIcon from "../common/apple-login-icon"
import FacebookLoginIcon from "../common/facebook-login-icon"
import GoogleLoginIcon from "../common/google-login-icon"
import { BrandLogoDark } from "../common/brand-logo-dark"
import { Checkbox } from "../ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean().default(false),
})

export type LoginFormData = z.infer<typeof loginSchema>

export default function SigninForm() {
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: true,
        },
    })

    const onSubmit = async (data: LoginFormData) => {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log("Login data:", data)
            // Handle successful login here
        } catch (error) {
            console.error("Login error:", error)
        }
    }

    const handleSocialLogin = (provider: string) => {
        console.log(`Login with ${provider}`)
    }

    return (
        <div className="z-10 bg-white min-h-screen flex items-center justify-center">
            <div className="bg-white w-full pt-[80px] md:pt-8 p-8">
                <div className="md:hidden w-full flex items-center justify-center pb-[50px] p-0">
                    <BrandLogoDark />
                </div>
                {/* Header */}
                <div className="text-center mb-8 space-y-[24px]">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome Back, Gamer</h1>
                    <p className="text-[hsla(221,39%,11%,1)] text-sm">Log in to continue your learning and level up.</p>
                </div>

                {/* Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">Email:</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            className="border-teal-400 focus:border-teal-500 focus:ring-teal-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">Password:</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter info"
                                                className="pr-10 focus:border-teal-500 focus:ring-teal-500"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Forgot Password Link */}
                        <div className="text-sm">
                            <span className="text-gray-600">Forgot your password? </span>
                            <button
                                type="button"
                                className="text-[hsla(160,84%,39%,1)] hover:text-teal-700 font-medium"
                                onClick={() => {
                                    // Handle forgot password
                                    console.log("Forgot password clicked")
                                }}
                            >
                                Reset here
                            </button>
                        </div>

                        {/* Remember Me Checkbox */}
                        <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-[10px] space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium text-gray-700 cursor-pointer">Remember Me</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="w-full bg-[hsla(160,84%,39%,1)] hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>
                </Form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-gray-500 text-sm">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Social Login */}
                <div className="flex justify-center gap-4 mb-6">
                    {/* Google login */}
                    <button
                        onClick={() => handleSocialLogin("Google")}
                        className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <GoogleLoginIcon />
                    </button>

                    {/* Facebook login */}
                    <button
                        onClick={() => handleSocialLogin("Facebook")}
                        className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <FacebookLoginIcon />
                    </button>

                    {/* Apple login */}
                    <button
                        onClick={() => handleSocialLogin("Apple")}
                        className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <AppleLoginIcon />
                    </button>
                </div>

                {/* Sign In Link */}
                <div className="text-center mb-4">
                    <span className="text-gray-600 text-sm">Already have an account? </span>
                    <Link to="/register" className="text-[hsla(160,84%,39%,1)] hover:text-cyan-700 text-sm font-medium">
                        Sign up
                    </Link>
                </div>

                {/* Terms */}
                <div className="text-center text-xs text-gray-500">
                    By signing in, you agree to our{" "}
                    <Link to="/terms" className="text-[hsla(160,84%,39%,1)] hover:text-cyan-700">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-[hsla(160,84%,39%,1)] hover:text-cyan-700">
                        Privacy Policy
                    </Link>
                    .
                </div>
            </div>
        </div>
    )
}
