export function magic (buffer) {
    const data = new DataView(buffer);

    for (let i = 0; i < Math.min(data.byteLength, 0x100); i++) {
        if (data.getUint8(i) > 128) return null;
    }

    return [];
}