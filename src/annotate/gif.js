export function magic (buffer) {
    const data = new DataView(buffer);
    
    if (data.getUint8(0) === 0x47 && 
        data.getUint8(1) === 0x49 && 
        data.getUint8(2) === 0x46 && 
        data.getUint8(3) === 0x38 && 
        (data.getUint8(4) === 0x37 || data.getUint8(4) === 0x39) && 
        data.getUint8(5) === 0x61) {
        return template;
    }
}

const template = [
    {
        type: "ASCII",
        label: "Marker",
        start: 0,
        length: 6,
    },
    {
        type: "Uint16",
        label: "Width",
        start: 6,
        littleEndian: true,
    },
    {
        type: "Uint16",
        label: "Height",
        start: 8,
        littleEndian: true,
    },
    {
        type: "bytes",
        label: "GCT Indicator",
        start: 0x0A,
        length: 1,
        display: "binary",
    },
    {
        type: "Uint8",
        label: "Background Color",
        start: 0x0B,
    },
    {
        type: "Uint8",
        label: "Default Pixel Ratio",
        start: 0x0C,
    },
    {
        type: "binary",
        label: "GCT",
        start: 0x0D,
        length: 256 * 3,
    },
    {
        type: "ASCII",
        label: "Image Start Marker",
        start: 0x30D,
        littleEndian: true,
    },
    {
        type: "Uint16",
        label: "Image Start X",
        start: 0x30E,
        littleEndian: true,
    },
    {
        type: "Uint16",
        label: "Image Start Y",
        start: 0x310,
        littleEndian: true,
    },
    {
        type: "Uint16",
        label: "Image Width",
        start: 0x312,
        littleEndian: true,
    },
    {
        type: "Uint16",
        label: "Image Height",
        start: 0x314,
        littleEndian: true,
    },
    {
        type: "Uint8",
        label: "Local Colour Table Indicator",
        start: 0x316,
        display: "hex"
    },
    {
        type: "Uint8",
        label: "LZW Minimum Size",
        start: 0x317,
        display: "hex"
    },
];