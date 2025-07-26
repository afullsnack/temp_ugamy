import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link } from "@tanstack/react-router"
import AppleLoginIcon from "../common/apple-login-icon"
import FacebookLoginIcon from "../common/facebook-login-icon"
import GoogleLoginIcon from "../common/google-login-icon"
import { BrandLogoDark } from "../common/brand-logo-dark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupForm() {
    const [formData, setFormData] = useState({
        fullname: "",
        username: "",
        email: "",
        verificationCode: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleVerifyEmail = () => {
        if (formData.email) {
            setEmailSent(true)
            // Simulate sending verification email
            console.log("Verification email sent to:", formData.email)
        }
    }

    const handleSocialLogin = (provider: string) => {
        console.log(`Login with ${provider}`)
    }

    const isFormValid = () => {
        return (
            formData.fullname &&
            formData.username &&
            formData.email &&
            formData.phone &&
            formData.password &&
            formData.confirmPassword &&
            formData.password === formData.confirmPassword
        )
    }

    return (
        <div className="z-10 bg-white min-h-screen flex items-center justify-center">
            <div className="bg-white w-full pt-[80px] md:pt-8 p-8">
                <div className="md:hidden w-full flex items-center justify-center pb-[50px] p-0">
                    <BrandLogoDark />
                </div>
                {/* Header */}
                <div className="text-center mb-8 space-y-[24px]">
                    <h1 className="text-2xl font-bold text-gray-900">Create Your Ugamy Account</h1>
                    <p className="text-[hsla(221,39%,11%,1)] text-sm">Join The Community. Start Mastering Your Favorite Games.</p>
                </div>

                {/* Form */}
                <form className="space-y-4">
                    {/* Fullname */}
                    <div>
                        <Label htmlFor="fullname" className="text-sm text-gray-700 mb-1 block">
                            Fullname:
                        </Label>
                        <Input
                            id="fullname"
                            type="text"
                            value={formData.fullname}
                            onChange={(e) => handleInputChange("fullname", e.target.value)}
                            className="w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <Label htmlFor="username" className="text-sm text-gray-700 mb-1 block">
                            Username:
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter info"
                            value={formData.username}
                            onChange={(e) => handleInputChange("username", e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <Label htmlFor="email" className="text-sm text-gray-700">
                                Email:
                            </Label>
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                onClick={handleVerifyEmail}
                                className="text-[hsla(160,84%,39%,1)] hover:text-cyan-700 p-0 h-auto text-sm"
                            >
                                Verify Email:
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter info"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                type="text"
                                placeholder="000000"
                                value={formData.verificationCode}
                                onChange={(e) => handleInputChange("verificationCode", e.target.value)}
                                className="w-20 text-center"
                                maxLength={6}
                            />
                        </div>
                        {emailSent && (
                            <p className="text-xs text-[hsla(160,84%,39%,1)] mt-1">(Confirm the verification code that was sent to you email.)</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <Label htmlFor="phone" className="text-sm text-gray-700 mb-1 block">
                            Phone:
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter info"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="password" className="text-sm text-gray-700 mb-1 block">
                                Password:
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter info"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                    className="w-full pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword" className="text-sm text-gray-700 mb-1 block">
                                Confirm Password:
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Enter info"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    className="w-full pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Next Button */}
                    <Button
                        type="submit"
                        disabled={!isFormValid()}
                        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-600 disabled:bg-gray-200 disabled:text-gray-400 mt-6"
                    >
                        Next
                    </Button>
                </form>

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
                    <Link to="/signin" className="text-[hsla(160,84%,39%,1)] hover:text-cyan-700 text-sm font-medium">
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
                    .
                </div>
            </div>
        </div>
    )
}
