"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { authClient } from "@/lib/auth-client"

const formSchema = z.object({
    code: z
        .string()
        .min(6, {
            message: "Verification code must be 6 characters.",
        })
        .max(6, {
            message: "Verification code must be 6 characters.",
        })
        .regex(/^\d{6}$/, {
            message: "Verification code must be 6 digits.",
        }),
})

const VerifyEmail = async (payload: { code: string, email: string }) => {
    const { data, error } = await authClient.emailOtp.verifyEmail({
        email: payload.email,
        otp: payload.code,
    });

    if (error) {
        throw error
    }

    return data
}

export default function VerifyEmailForm() {
    const navigate = useNavigate()

    const search = useSearch({
        from: "/verify-email"
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
        },
    })

    // Handle verify Email
    const handleSendEmailVerification = async () => {
        if (!search.email) {
            toast.error("Enter email address")
            return
        }

        // Send Email verification API mutation
        const { data, error } = await authClient.emailOtp.sendVerificationOtp({
            email: `${search.email}`,
            type: "email-verification",
        })

        if (data?.success) {
            toast.success(`OTP has been sent to: ${search.email}`)
        }

        if (error) {
            toast.error(error.message ?? "Error sending OTP")
        }
    }

    // Verify Email
    const { isPending, mutateAsync } = useMutation({
        mutationFn: VerifyEmail,
        onSuccess: () => {
            toast.success("Proceed to sign in")
            navigate({
                to: "/dashboard"
            })
        },
        onError: (error) => {
            toast.error(error.message || "An unexpected error occured, kindly try again")
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await mutateAsync({
            code: values.code,
            email: search.email ?? ""
        })
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Verify your email</CardTitle>
                <CardDescription>
                    We've sent a 6-digit code to your email address <span className="text-black">{search.email}</span>. Please enter it below to verify your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending} className="w-full h-[50px]">
                            {isPending ? "Verifying Account..." : " Verify Account"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-sm">
                <p className="text-muted-foreground">
                    Didn't receive the code?{" "}
                    <Button type="button" variant="link" onClick={handleSendEmailVerification} className="font-medium text-primary hover:underline p-0">
                        Resend Code
                    </Button>
                </p>
                <p className="text-muted-foreground">
                    <Link to="/signin" className="font-medium text-primary hover:underline">
                        Back to Login
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
