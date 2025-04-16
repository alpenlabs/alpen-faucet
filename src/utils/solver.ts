// Hashing utility using Web Crypto
async function sha256(data: Uint8Array): Promise<Uint8Array> {
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(buffer);
}

// Count leading zero bits in a hash result
function countLeadingZeros(data: Uint8Array): number {
    let leadingZeros = 0;
    for (const byte of data) {
        if (byte === 0) {
            leadingZeros += 8;
        } else {
            leadingZeros += byte.toString(2).padStart(8, "0").indexOf("1");
            break;
        }
    }
    return leadingZeros;
}

export interface PoWResult {
    ok: true;
    data: string;
}

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
    const salt = new Uint8Array([
        0x73, 0x74, 0x72, 0x61, 0x74, 0x61, 0x20, 0x66, 0x61, 0x75, 0x63, 0x65,
        0x74, 0x20, 0x32, 0x30, 0x32, 0x34,
    ]);

    const nonceBytes = new Uint8Array(
        nonce.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    );

    const solution = new Uint8Array(8);
    let attempts = 0;

    while (true) {
        attempts++;
        const hashInput = new Uint8Array([...salt, ...nonceBytes, ...solution]);
        const hash = await sha256(hashInput);
        updateAttempts(attempts);

        if (countLeadingZeros(hash) >= difficulty) {
            const solutionHex = Array.from(solution)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            return { ok: true, data: solutionHex };
        }

        // Increment solution like a little-endian counter
        for (let i = 7; i >= 0; i--) {
            if (solution[i] < 0xff) {
                solution[i]++;
                break;
            } else {
                solution[i] = 0;
            }
        }
    }
}
