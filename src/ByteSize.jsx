import React from "react";

export function ByteSize ({ bytes }) {
    return <span title={`${bytes} bytes`}>{formatBytes(bytes)}</span>;
}

/**
 * @param {number|BigInt} n
 */
function formatBytes (n) {
    if (typeof n === "bigint") {
        if (n > 1024n * 1024n * 1024n)
            return `${(n / (1024n * 1024n * 1024n))} GB`;
        if (n > 1024n * 1024n)
            return `${(n / (1024n * 1024n))} MB`;
        if (n > 1024n)
            return `${(n / (1024n))} kB`;
        return `${n} bytes`;
    }

    if (n > 1024 * 1024 * 1024)
        return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (n > 1024 * 1024)
        return `${(n / (1024 * 1024)).toFixed(2)} MB`;
    if (n > 1024)
        return `${(n / (1024)).toFixed(2)} kB`;
    return `${n} bytes`;
}