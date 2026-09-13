/**
 * The three YouTube channels, in one place.
 *
 * Identity only (id, handle, title, blurb). Per-surface styling stays in the component that
 * renders it, so adding a channel here shows up on the homepage, the stats row and the admin
 * dashboard without touching three files.
 */
export interface Channel {
    id: string;
    handle: string;
    title: string;
    label: string;
}

export const CHANNELS: Channel[] = [
    {
        id: 'UCdRe_4FG7JhOERlfcyeNhnw',
        handle: '@BillTheDev',
        title: 'Bill The Dev',
        label: 'Unity Dev & Shader Tutorials',
    },
    {
        id: 'UCodHIrwfVJfHen6ljDfFbzA',
        handle: '@BillVRGamer',
        title: 'Bill VR Gamer',
        label: 'VR Gaming & Reviews',
    },
    {
        id: 'UC9E61azlbreSfShsGuSSDnw',
        handle: '@BillAITrainer',
        title: 'Bill AI Trainer',
        label: 'AI Training & Experiments',
    },
];

export const CHANNEL_IDS = CHANNELS.map(c => c.id);
