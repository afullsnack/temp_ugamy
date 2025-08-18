"use client"

import { create, useModal } from "@ebay/nice-modal-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "@/lib/auth-hooks"

export const ProfileEditModal = create(() => {
    const { remove, visible } = useModal()
    const { user } = useSession()

    const getUserInitials = (name: string | null | undefined) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const ProfileEditSheetContent = () => (
        <div className="h-full bg-[hsla(221,39%,11%,1)] flex flex-col text-white p-6 overflow-y-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Edit Profile</h2>
                <p className="text-gray-400">Update your profile information</p>
            </div>

            <div className="flex-1 space-y-6">
                {/* Profile Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                    <Avatar className="h-20 w-20 mb-4">
                        <AvatarFallback className="bg-white text-primary font-semibold text-xl">
                            {getUserInitials(user?.name)}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        variant="outline"
                        className="border-teal-400 text-teal-400 hover:bg-white hover:text-black bg-transparent"
                    >
                        Change Avatar
                    </Button>
                </div>

                {/* Profile Form Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                        <input
                            type="text"
                            defaultValue={user?.name ?? ""}
                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md text-white focus:border-teal-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Gamer's Tag</label>
                        <input
                            type="text"
                            defaultValue={user?.displayUsername ?? ""}
                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md text-white focus:border-teal-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            defaultValue={user?.email ?? ""}
                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md text-white focus:border-teal-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            defaultValue={user?.phoneNumber ?? ""}
                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md text-white focus:border-teal-400 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4 mt-8">
                <Button className="w-full bg-white hover:bg-white text-black">Save Changes</Button>
                <Button
                    variant="outline"
                    className="w-full border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                    onClick={() => remove()}
                >
                    Cancel
                </Button>
            </div>
        </div>
    )

    return (
        <Sheet open={visible} onOpenChange={() => remove()}>
            <SheetContent side="right" className="p-0 w-96">
                <ProfileEditSheetContent />
            </SheetContent>
        </Sheet>
    )
})
