"use client";

import { Heart } from 'lucide-react';
import { Button } from '../ui/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { env } from '@/env';
import { useEffect, useState, type FC } from 'react';
import { toast } from 'sonner';

const likeVideo = async (payload: Record<string, string>): Promise<{
    success: boolean,
    message: string
}> => {
    const response = await axios.post(`${env.VITE_API_URL}/videos/like/`, payload, {
        withCredentials: true
    })
    return response.data
}

interface IProps {
    vid: string;
    isFavourite: boolean
}

const LikeVideoWidget: FC<IProps> = ({ vid, isFavourite }) => {
    const [favourite, setFavourite] = useState<boolean>(false)

    console.log(isFavourite)
    const queryClient = useQueryClient()

    useEffect(() => {
        setFavourite(isFavourite)
    }, [isFavourite])


    // Like video API mutation
    const { mutateAsync, isPending } = useMutation({
        mutationFn: likeVideo,
        onError: (error) => {
            toast.error(error.message || 'Error liking this video')
        },
    })

    const handlLikeVideo = async (videoId: string) => {
        setFavourite((prev) => !prev)
        await mutateAsync({
            videoId: videoId
        }).then(() => {
            setFavourite((prev) => !prev)
            queryClient.invalidateQueries({ queryKey: ["courses-details"] })
        }).catch(() => {
            setFavourite((prev) => !prev)
        })
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 bg-black/3 hover:bg-white/5"
                onClick={(e) => {
                    e.stopPropagation()
                    handlLikeVideo(vid)
                }}
            >
                <Heart
                    className={`w-4 h-4 ${favourite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                />
            </Button>
        </>
    )
}

export default LikeVideoWidget
