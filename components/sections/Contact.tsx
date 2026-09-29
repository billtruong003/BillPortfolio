'use client';
import { useEffect, useState } from 'react';
import { Mail, Linkedin, Github, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SITE } from '@/lib/site';
import { CONTACT_TOPICS } from '@/data/services';
import { SELECT_TOPIC_EVENT } from '@/components/sections/Services';
import { SectionHeading } from '@/components/ui/SectionHeading';

// FormSubmit forwards the JSON body to this inbox. The first submission sends
// an activation email that has to be confirmed once before messages arrive.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${SITE.email}`;

const DIRECT_LINKS = [
    { label: SITE.email, href: `mailto:${SITE.email}`, icon: Mail },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/billtruong003/', icon: Linkedin },
    { label: 'GitHub', href: 'https://github.com/billtruong003', icon: Github },
];

type Status = 'idle' | 'sending' | 'sent' | 'error';

const FIELD =
    'w-full px-4 py-3 bg-zinc-900/60 border border-white/10 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary';

export const Contact = () => {
    const [topic, setTopic] = useState(CONTACT_TOPICS[0].id);
    const [status, setStatus] = useState<Status>('idle');

    useEffect(() => {
        const onSelect = (e: Event) => setTopic((e as CustomEvent<string>).detail);
        window.addEventListener(SELECT_TOPIC_EVENT, onSelect);
        return () => window.removeEventListener(SELECT_TOPIC_EVENT, onSelect);
    }, []);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        const topicTitle = CONTACT_TOPICS.find((t) => t.id === data.topic)?.title ?? 'General';

        setStatus('sending');
        try {
            const res = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    ...data,
                    topic: topicTitle,
                    _subject: `[billthedev.com] ${topicTitle}: ${data.name}`,
                    _replyto: data.email,
                    _template: 'table',
                    _captcha: 'false',
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || String(json.success) !== 'true') throw new Error(json.message);
            setStatus('sent');
            form.reset();
        } catch {
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="py-24 px-6 relative z-20 scroll-mt-20 border-t border-white/5">
            <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-2">
                    <SectionHeading eyebrow="Contact" title="Tell me what you are building">
                        Send a short brief: what you need, a rough timeline, and a budget if you have one.
                    </SectionHeading>

                    <ul className="space-y-3">
                        {DIRECT_LINKS.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    target={link.href.startsWith('mailto') ? undefined : '_blank'}
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 text-zinc-300 hover:text-primary transition-colors"
                                >
                                    <link.icon size={18} aria-hidden />
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <form onSubmit={onSubmit} className="lg:col-span-3 space-y-5 p-6 md:p-8 bg-zinc-900/40 border border-white/10 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <label className="block">
                            <span className="block mb-2 text-sm text-zinc-300">Name</span>
                            <input name="name" required autoComplete="name" className={FIELD} />
                        </label>
                        <label className="block">
                            <span className="block mb-2 text-sm text-zinc-300">Email</span>
                            <input name="email" type="email" required autoComplete="email" className={FIELD} />
                        </label>
                    </div>

                    <label className="block">
                        <span className="block mb-2 text-sm text-zinc-300">What is it about?</span>
                        <select name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={FIELD}>
                            {CONTACT_TOPICS.map((t) => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="block mb-2 text-sm text-zinc-300">Budget <span className="text-zinc-500">(optional)</span></span>
                        <input name="budget" placeholder="e.g. $2,000, or hourly" className={FIELD} />
                    </label>

                    <label className="block">
                        <span className="block mb-2 text-sm text-zinc-300">Message</span>
                        <textarea name="message" required rows={5} className={FIELD} placeholder="What do you need, and by when?" />
                    </label>

                    <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="inline-flex items-center gap-2 px-6 py-3 font-bold text-black bg-primary rounded-lg hover:bg-white disabled:opacity-60 transition-colors"
                        >
                            <Send size={16} aria-hidden />
                            {status === 'sending' ? 'Sending…' : 'Send message'}
                        </button>

                        <p role="status" className="text-sm">
                            {status === 'sent' && (
                                <span className="inline-flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 size={16} aria-hidden /> Thanks, your message is on its way.
                                </span>
                            )}
                            {status === 'error' && (
                                <span className="inline-flex items-center gap-2 text-amber-300">
                                    <AlertTriangle size={16} aria-hidden />
                                    Could not send. Email me at{' '}
                                    <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a>
                                </span>
                            )}
                        </p>
                    </div>
                </form>
            </div>
        </section>
    );
};
