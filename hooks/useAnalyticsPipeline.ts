'use client';

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
        // Kiểm tra session để tránh spam (nếu muốn test thì comment dòng này lại)
        const sessionKey = 'analytics_logged_v2'; 
        if (isTracked.current || sessionStorage.getItem(sessionKey)) return;

        const executePipeline = async () => {
            console.log("🚀 Starting Analytics Pipeline...");

            // 1. Khởi tạo data mặc định (Phòng trường hợp API lấy IP bị lỗi)
            let ipInfo = {
                ip: 'Unknown',
                city: 'Unknown',
                country: 'Unknown'
            };

            // 2. Thử lấy IP từ dịch vụ miễn phí (ipwho.is)
            try {
                // ipwho.is dễ tính hơn ipapi.co, ít bị lỗi CORS và 429
                const ipRes = await fetch('https://ipwho.is/');
                const ipJson = await ipRes.json();
                
                if (ipJson.success) {
                    ipInfo = {
                        ip: ipJson.ip,
                        city: ipJson.city,
                        country: ipJson.country
                    };
                } else {
                    console.warn("⚠️ IP Fetch Failed:", ipJson.message);
                }
            } catch (error) {
                console.error("❌ Network Error getting IP (Ignored):", error);
                // Không return, vẫn tiếp tục chạy để gửi các data khác
            }

            // 3. Chuẩn bị Payload
            try {
                const params = new URLSearchParams(window.location.search);
                
                const payload: TrackingData = {
                    ...ipInfo, // Spread thông tin IP lấy được (hoặc Unknown)
                    utm_source: params.get('utm_source') || params.get('source') || 'Direct',
                    utm_medium: params.get('utm_medium') || 'None',
                    utm_campaign: params.get('utm_campaign') || params.get('ref') || 'None',
                    userAgent: navigator.userAgent,
                    path: window.location.pathname
                };

                const SCRIPT_URL = process.env.NEXT_PUBLIC_GAS_URL;
                
                if (!SCRIPT_URL) {
                    console.error("❌ Missing Google Script URL in ENV");
                    return;
                }

                // 4. Gửi về Google Sheet (Dùng no-cors để tránh lỗi CORS từ Google)
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Giữ nguyên no-cors
                    // XÓA DÒNG HEADERS Content-Type ĐI
                    // headers: { 'Content-Type': 'application/json' }, 
                    
                    // Gửi chuỗi JSON thô, Google Script sẽ tự parse được
                    body: JSON.stringify(payload)
                });

                console.log("✅ Data sent to Google Sheet!");
                
                // Đánh dấu đã track để không gửi lại khi F5
                sessionStorage.setItem(sessionKey, 'true');
                isTracked.current = true;

            } catch (error) {
                console.error("🔥 Pipeline Error:", error);
            }
        };

        executePipeline();
    }, []);
};