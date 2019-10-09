export function magic (buffer) {
    const data = new DataView(buffer);
    
    if (data.getUint8(0) === 0x42 && data.getUint8(1) === 0x4D) {
        return template;
    }
}

const template = [
    {
        type: "ASCII",
        label: "Marker",
        start: 0,
        length: 2,
    },
    {
        type: "Uint16",
        label: "Length",
        start: 2,
        littleEndian: true,
    },
    {
        id: "pixel_data_start",
        type: "Uint32",
        label: "Pixel Data Start",
        start: 0x0A,
        littleEndian: true,
        display: "hex",
    },
    {
        id: "header_length",
        type: "Uint32",
        label: "Header Length",
        start: 0x0E,
        littleEndian: true,
    },
    {
        type: "Uint32",
        label: "Width",
        start: 0x12,
        littleEndian: true,
    },
    {
        type: "Uint32",
        label: "Height",
        start: 0x16,
        littleEndian: true,
    },
    {
        type: "Uint16",
        label: "Color Planes",
        start: 0x1A,
        littleEndian: true,
    },
    {
        type: "Uint16",
        label: "Bits per Pixel",
        start: 0x1C,
        littleEndian: true,
    },
    {
        type: "Uint32",
        label: "Compression",
        start: 0x1E,
        littleEndian: true,
    },
    {
        id: "image_size",
        type: "Uint32",
        label: "Image Size",
        start: 0x22,
        littleEndian: true,
    },
    {
        type: "Int32",
        label: "Horizontal Resolution",
        start: 0x26,
        littleEndian: true,
    },
    {
        type: "Int32",
        label: "Vertical Resolution",
        start: 0x2A,
        littleEndian: true,
    },
    {
        type: "Uint32",
        label: "Number of Colors",
        start: 0x2E,
        littleEndian: true,
    },
    {
        type: "Uint32",
        label: "Number of Important Colours",
        start: 0x32,
        littleEndian: true,
    },
    {
        type: "bytes",
        label: "Color Map",
        start: { operation: "relative", to: "header_length" },
        length: { operation: "subtract", left: "pixel_data_start", right: { operation: "relative", to: "header_length" }},
    },
    {
        type: "bytes",
        label: "Pixel Data",
        start: "pixel_data_start",
        length: "image_size",
    }
];

export default template;
