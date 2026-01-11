import { useState, useEffect, useRef, useCallback } from 'react';

export const usePrecisionTimer = (
    isRunning: boolean,
    onTick?: (elapsed: number) => void
) => {
    const [elapsedTime, setElapsedTime] = useState(0); // milliseconds
    const workerRef = useRef<Worker | null>(null);

    // Initialize Worker
    useEffect(() => {
        workerRef.current = new Worker('/worker.js');

        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'TICK') {
                const time = e.data.time;
                setElapsedTime(time);
                if (onTick) onTick(time);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []); // Empty dependency array -> Run once on mount

    // Handle Start/Pause
    useEffect(() => {
        if (isRunning) {
            workerRef.current?.postMessage({ action: 'START' });
        } else {
            workerRef.current?.postMessage({ action: 'PAUSE' });
        }
    }, [isRunning]);

    const reset = useCallback(() => {
        setElapsedTime(0);
        workerRef.current?.postMessage({ action: 'RESET' });
    }, []);

    // Additional sync helper if needed
    const sync = useCallback((time: number) => {
        setElapsedTime(time);
        workerRef.current?.postMessage({ action: 'SYNC', payload: { time } });
    }, []);

    return { elapsedTime, reset, sync };
};
