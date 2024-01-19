export function magic (buffer) {
    const data = new DataView(buffer);

    if (data.getUint8(0) === 0x89 &&
        data.getUint8(1) === 0x50 &&
        data.getUint8(2) === 0x4E &&
        data.getUint8(3) === 0x47 &&
        data.getUint8(4) === 0x0D &&
        data.getUint8(5) === 0x0A &&
        data.getUint8(6) === 0x1A &&
        data.getUint8(7) === 0x0A) {
        return template;
    }
}

const template = [
    {
        type: "ASCII",
        label: "Marker",
        start: 0,
        length: 8,
    },
    {
        type: "repeater",
        children: [
            {
                id: "chunk_length",
                type: "Uint32",
                label: "Chunk Length",
            },
            {
                id: "chunk_type",
                type: "ASCII",
                label: "Chunk Type",
                length: 4,
            },
            {
                type: "switch",
                value: "chunk_type",
                cases: {
                    "IHDR": [
                        {
                            type: "Uint32",
                            label: "Image Width",
                        },
                        {
                            type: "Uint32",
                            label: "Image Height",
                        },
                        {
                            type: "Uint8",
                            label: "Bit Depth",
                        },
                        {
                            type: "Uint8",
                            label: "Colour Type",
                        },
                        {
                            type: "Uint8",
                            label: "Compression Method",
                        },
                        {
                            type: "Uint8",
                            label: "Filter Method",
                        },
                        {
                            type: "Uint8",
                            label: "Interlace Method",
                        }
                    ],
                    "pHYs": [
                        {
                            type: "Uint32",
                            label: "Pixels per Unit, X"
                        },
                        {
                            type: "Uint32",
                            label: "Pixels per Unit, Y"
                        },
                        {
                            type: "Uint8",
                            label: "Unit Type"
                        },
                    ],
                    "tEXt": [
                        {
                            id: "text_key",
                            type: "ASCII",
                            label: "key"
                        },
                        {
                            type: "null",
                        },
                        {
                            type: "UTF-8",
                            label: "value",
                            length: "text_key:start + chunk_length - :start",
                        },
                    ],
                    "default": [
                        {
                            type: "bytes",
                            label: "chunk_data",
                            length: "chunk_length",
                        },
                    ],
                }
            },
            {
                type: "bytes",
                label: "Chunk CRC",
                length: 4,
            },
        ],
    },
];