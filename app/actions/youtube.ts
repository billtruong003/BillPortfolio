"use server";

export async function fetchYouTubeStats(channelIds: string[]) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        return null;
    }

    try {
        const ids = channelIds.join(",");
        const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${ids}&key=${apiKey}`;
        const res = await fetch(url, { next: { revalidate: 300 } });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return data.items || [];
    } catch {
        return null;
    }
}