export interface DocTrack {
    id: string;
    name: string;
    short: string;
    description: string;
    color: string;
}

// Order here is the order of the tab bar and the /docs index.
export const DOC_TRACKS: DocTrack[] = [
    {
        id: 'csharp',
        name: 'C#',
        short: 'C#',
        description: 'Ngôn ngữ của Unity. Học từ biến, vòng lặp tới class và interface, ví dụ nào cũng gắn với game.',
        color: '#9B4F96',
    },
    {
        id: 'python',
        name: 'Python',
        short: 'Python',
        description: 'Ngôn ngữ dễ đọc nhất để bắt đầu, dùng để viết tool, tự động hóa và script cho Blender.',
        color: '#3776AB',
    },
    {
        id: 'javascript',
        name: 'JavaScript & TypeScript',
        short: 'JS/TS',
        description: 'Ngôn ngữ của trình duyệt. Từ biến, hàm, DOM tới async và kiểu dữ liệu của TypeScript.',
        color: '#F7DF1E',
    },
    {
        id: 'hlsl',
        name: 'HLSL cho Unity',
        short: 'HLSL',
        description: 'Viết shader cho Unity URP từ con số 0: vertex, fragment, UV, màu, ánh sáng đơn giản.',
        color: '#FFB84D',
    },
    {
        id: 'algorithms',
        name: 'Giải thuật phỏng vấn',
        short: 'Giải thuật',
        description: 'Các bài toán hay gặp khi phỏng vấn, giải bằng C# và Python, kèm tình huống trong game.',
        color: '#2FB37A',
    },
];

export const getTrack = (id: string) => DOC_TRACKS.find((t) => t.id === id);
