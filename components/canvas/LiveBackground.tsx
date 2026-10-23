'use client';
import dynamic from 'next/dynamic';
import { useLive3D } from '@/hooks/useLive3D';

const ParticleBackground = dynamic(() => import('./ParticleBackground').then((mod) => mod.ParticleBackground), { ssr: false });

/** The particle field behind the home page, only where live 3D is cheap (see useLive3D); elsewhere the plain dark page. */
export const LiveBackground = () => (useLive3D() ? <ParticleBackground /> : null);
