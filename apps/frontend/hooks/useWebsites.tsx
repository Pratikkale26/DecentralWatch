"use client"
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BACKEND_URL } from "@/config";

interface Website {
    id: number;
    url: string;
    ticks: {
        id: string;
        createdAt: string;
        status: string;
        latency: number;
    }[];
}

export function useWebsites() {
    const {getToken } = useAuth()
    const [websites, setWebsites] = useState<Website[]>([])

    async function refreshWebsites() {
        const token = await getToken();

        const res = await axios.get(`${API_BACKEND_URL}/api/v1/websites`, {
            headers: {
                Authorization: token, 
            }
        })
        
        setWebsites(res.data.websites)
    }

    useEffect(() => {
        refreshWebsites();

        const interval = setInterval(() => {
            refreshWebsites();
        }, 1000 * 60 * 1);

        return () => clearInterval(interval);
    }, [])

    return websites;
}
