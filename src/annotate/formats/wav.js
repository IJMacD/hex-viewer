export function magic (buffer) {
    const data = new DataView(buffer);

    if (data.getUint8(0) === 0x52 &&
        data.getUint8(1) === 0x49 &&
        data.getUint8(2) === 0x46 &&
        data.getUint8(3) === 0x46) {
        return template;
    }
}

const template = [
    {
        type: "ASCII",
        label: "Marker",
        length: 4,
    },
    {
        type: "Uint32",
        label: "Length",
        littleEndian: true,
    },
    {
        type: "ASCII",
        label: "Marker",
        length: 4,
    },
    {
        type: "repeater",
        children: [
            {
                id: "chunk_type",
                type: "ASCII",
                label: "Marker",
                length: 4,
            },
            {
                id: "chunk_length",
                type: "Uint32",
                label: "Chunk Size",
                littleEndian: true,
            },
            {
                type: "switch",
                value: "chunk_type",
                cases: {
                    "fmt ": [
                        {
                            type: "Uint16",
                            label: "Format Code",
                            littleEndian: true,
                        },
                        {
                            type: "Uint16",
                            label: "Channels",
                            littleEndian: true,
                        },
                        {
                            type: "Uint32",
                            label: "Samples per Second",
                            littleEndian: true,
                        },
                        {
                            type: "Uint32",
                            label: "Average Bytes per Second",
                            littleEndian: true,
                        },
                        {
                            type: "Uint16",
                            label: "Data Block Size",
                            littleEndian: true,
                        },
                        {
                            type: "Uint16",
                            label: "Bits per Sample",
                            littleEndian: true,
                        },
                    ],
                    "default": [
                        {
                            type: "bytes",
                            label: "chunk_data",
                            length: "chunk_length",
                        },
                    ]
                }
            }
        ]
    },
];