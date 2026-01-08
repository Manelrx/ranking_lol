"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type QueueType = 'SOLO' | 'FLEX';

interface QueueContextType {
    queueType: QueueType;
    setQueueType: (type: QueueType) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: ReactNode }) {
    const [queueType, setQueueState] = useState<QueueType>('SOLO');

    useEffect(() => {
        // Load from localStorage on mount
        const saved = localStorage.getItem('riftscore_queue');
        if (saved === 'SOLO' || saved === 'FLEX') {
            setQueueState(saved);
        }
    }, []);

    const setQueueType = (type: QueueType) => {
        setQueueState(type);
        localStorage.setItem('riftscore_queue', type);
    };

    return (
        <QueueContext.Provider value={{ queueType, setQueueType }}>
            {children}
        </QueueContext.Provider>
    );
}

export function useQueue() {
    const context = useContext(QueueContext);
    if (context === undefined) {
        throw new Error('useQueue must be used within a QueueProvider');
    }
    return context;
}
