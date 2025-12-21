'use client';

import { useAnalyticsPipeline } from '@/hooks/useAnalyticsPipeline';

export const PipelineTrigger = () => {
    useAnalyticsPipeline();
    return null;
};