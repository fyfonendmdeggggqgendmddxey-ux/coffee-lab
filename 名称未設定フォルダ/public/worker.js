// Web Worker for Precision Timer

let timerId = null;
let startTime = null;
let accumulatedTime = 0;
let isRunning = false;

self.onmessage = (e) => {
    const { action, payload } = e.data;

    switch (action) {
        case 'START':
            if (!isRunning) {
                startTime = performance.now();
                isRunning = true;
                timerId = setInterval(() => {
                    const now = performance.now();
                    const delta = now - startTime;
                    const total = accumulatedTime + delta;
                    self.postMessage({ type: 'TICK', time: total });
                }, 16); // ~60fps tick
            }
            break;

        case 'PAUSE':
            if (isRunning && startTime !== null) {
                const now = performance.now();
                accumulatedTime += now - startTime;
                startTime = null;
                isRunning = false;
                if (timerId) clearInterval(timerId);
                self.postMessage({ type: 'TICK', time: accumulatedTime });
            }
            break;

        case 'RESET':
            isRunning = false;
            startTime = null;
            accumulatedTime = 0;
            if (timerId) clearInterval(timerId);
            self.postMessage({ type: 'TICK', time: 0 });
            break;

        case 'SYNC':
            if (payload && typeof payload.time === 'number') {
                accumulatedTime = payload.time;
                if (isRunning) startTime = performance.now();
                self.postMessage({ type: 'TICK', time: accumulatedTime });
            }
            break;
    }
};
