import { useEffect, useRef } from 'react';

interface TrackingData {
    ip: string;
    city: string;
    country: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    userAgent: string;
    path: string;
}

export const useAnalyticsPipeline = () => {
    const isTracked = useRef(false);

    useEffect(() => {
        if (isTracked.current || process.env.NODE_ENV === 'development') return;

        const executePipeline = async () => {
            try {
                const ipRes = await fetch('https://ipapi.co/json/');
                const ipData = await ipRes.json();

                const params = new URLSearchParams(window.location.search);
                
                const payload: TrackingData = {
                    ip: ipData.ip || 'Unknown',
                    city: ipData.city || 'Unknown',
                    country: ipData.country_name || 'Unknown',
                    utm_source: params.get('utm_source') || params.get('source') || 'Direct',
                    utm_medium: params.get('utm_medium') || 'None',
                    utm_campaign: params.get('utm_campaign') || params.get('ref') || 'None',
                    userAgent: navigator.userAgent,
                    path: window.location.pathname
                };

                const SCRIPT_URL = process.env.NEXT_PUBLIC_GAS_URL;
                
                if (!SCRIPT_URL) return;

                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                isTracked.current = true;
                
            } catch (error) {
                // Fail silently to not affect UX
            }
        };

        executePipeline();
    }, []);
};