// Hashing utility using Web Crypto
async function sha256(data: Uint8Array): Promise<Uint8Array> {
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(buffer);
}

// Optimized count leading zero bits using bit manipulation
function countLeadingZeros(data: Uint8Array): number {
    let leadingZeros = 0;
    for (const byte of data) {
        if (byte === 0) {
            leadingZeros += 8;
        } else {
            // Use Math.clz32 for faster counting
            leadingZeros += Math.clz32(byte) - 24;
            break;
        }
    }
    return leadingZeros;
}

export interface PoWResult {
    ok: true;
    data: string;
}

// Optimized worker code
const workerCode = `
// Optimized count leading zero bits
function countLeadingZeros(data) {
    let leadingZeros = 0;
    for (const byte of data) {
        if (byte === 0) {
            leadingZeros += 8;
        } else {
            leadingZeros += Math.clz32(byte) - 24;
            break;
        }
    }
    return leadingZeros;
}

self.onmessage = async (event) => {
    const { nonce, difficulty, startValue, increment } = event.data;

    // Pre-allocate all buffers
    const salt = new Uint8Array([
        0x61, 0x6c, 0x70, 0x65, 0x6e, 0x20,
        0x66, 0x61, 0x75, 0x63, 0x65, 0x74, 0x20,
        0x32, 0x30, 0x32, 0x34,
    ]);

    const nonceBytes = new Uint8Array(
        nonce.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)),
    );

    // Pre-allocate hash input buffer
    const hashInput = new Uint8Array(salt.length + nonceBytes.length + 8);
    hashInput.set(salt, 0);
    hashInput.set(nonceBytes, salt.length);

    // Use DataView for efficient byte manipulation
    const solutionView = new DataView(hashInput.buffer, salt.length + nonceBytes.length, 8);

    // Pre-allocate hash output buffer
    let hashBuffer = new ArrayBuffer(32);
    let hashArray = new Uint8Array(hashBuffer);

    // Batch processing variables
    const batchSize = 1000;
    let attempts = 0;
    let currentValue = BigInt(startValue);
    const incrementBig = BigInt(increment);
    const reportInterval = 1000; // Report less frequently

    // Main loop with batching
    while (true) {
        for (let batch = 0; batch < batchSize; batch++) {
            // Write current value as little-endian using DataView
            solutionView.setBigUint64(0, currentValue, true);

            // Hash the input
            const buffer = await crypto.subtle.digest("SHA-256", hashInput);
            hashArray = new Uint8Array(buffer);

            attempts++;

            // Check if we found a solution
            if (countLeadingZeros(hashArray) >= difficulty) {
                // Convert solution to hex
                const solutionHex = Array.from(new Uint8Array(hashInput.buffer, salt.length + nonceBytes.length, 8))
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");
                self.postMessage({ type: 'solution', solution: solutionHex });
                return;
            }

            currentValue += incrementBig;
        }

        // Report progress less frequently to reduce overhead
        if (attempts % reportInterval === 0) {
            self.postMessage({ type: 'progress', attempts: reportInterval });
        }
    }
};
`;

// Create worker blob URL
const workerBlob = new Blob([workerCode], { type: "application/javascript" });
const workerUrl = URL.createObjectURL(workerBlob);

/**
 * Attempts to find a valid solution to a PoW challenge.
 * @param nonce - Hex string representing the nonce.
 * @param difficulty - Number of required leading zero bits.
 * @param updateAttempts - Callback for updating UI with attempt count.
 * @returns A successful solution or never returns until found.
 */
export async function findSolution(
    nonce: string,
    difficulty: number,
    updateAttempts: (attempts: number) => void,
): Promise<PoWResult> {
    // Optimize worker count - sometimes fewer workers with better code is faster
    const coreCount = navigator.hardwareConcurrency || 4;
    const numWorkers = coreCount;
    const workers: Worker[] = [];
    let totalAttempts = 0;
    let solutionFound = false;

    // Pre-calculate update frequency to reduce callback overhead
    let lastUpdate = 0;
    const updateThreshold = 5000; // Update UI less frequently

    return new Promise<PoWResult>((resolve) => {
        // Create and start workers
        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker(workerUrl);

            worker.onmessage = (event: MessageEvent) => {
                const response = event.data;

                if (response.type === "progress") {
                    totalAttempts += response.attempts;

                    // Throttle UI updates
                    if (totalAttempts - lastUpdate >= updateThreshold) {
                        updateAttempts(totalAttempts);
                        lastUpdate = totalAttempts;
                    }
                } else if (response.type === "solution" && !solutionFound) {
                    solutionFound = true;

                    // Update final attempt count
                    updateAttempts(totalAttempts);

                    // Terminate all workers
                    workers.forEach((w) => w.terminate());

                    // Clean up the blob URL
                    URL.revokeObjectURL(workerUrl);

                    resolve({ ok: true, data: response.solution });
                }
            };

            // Start each worker with a different starting point
            worker.postMessage({
                type: "start",
                nonce,
                difficulty,
                startValue: i,
                increment: numWorkers,
            });

            workers.push(worker);
        }
    });
}
