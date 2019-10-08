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
        littleEndian: true,
    },
    {
        type: "Uint16",
        label: "Height",
        littleEndian: true,
    },
    {
        type: "bytes",
        label: "GCT Indicator",
        length: 1,
        display: "binary",
    },
    {
        type: "Uint8",
        label: "Background Color",
    },
    {
        type: "Uint8",
        label: "Default Pixel Ratio",
    },
    {
        type: "bytes",
        label: "GCT",
        length: 256 * 3,
    },
    {
        type: "repeater",
        children: [
            {
                type: "switch",
                cases: {
                    0x21: [
                        {
                            type: "ASCII",
                            label: "Extension Marker",
                        },
                        {
                            type: "Uint8",
                            label: "Extension Type",
                            display: "hex",
                        },
                        {
                            id: "extension_block_length",
                            type: "Uint8",
                            label: "Extension Block Length",
                        },
                        {
                            type: "bytes",
                            label: "Extension Data",
                            length: "extension_block_length",
                        },
                        {
                            type: "Uint8",
                            label: "Extension End Marker",
                            start: { operation: "add", left: "extension_block_length", right: "extension_block_length:end" },
                            display: "hex",
                        },
                    ],
                    0x2C: [
                        {
                            type: "ASCII",
                            label: "Image Start Marker",
                        },
                        {
                            type: "Uint16",
                            label: "Image Start X",
                            littleEndian: true,
                        },
                        {
                            type: "Uint16",
                            label: "Image Start Y",
                            littleEndian: true,
                        },
                        {
                            type: "Uint16",
                            label: "Image Width",
                            littleEndian: true,
                        },
                        {
                            type: "Uint16",
                            label: "Image Height",
                            littleEndian: true,
                        },
                        {
                            type: "Uint8",
                            label: "Local Colour Table Indicator",
                            display: "hex"
                        },
                        {
                            type: "Uint8",
                            label: "LZW Minimum Size",
                        },
                        {
                            type: "repeater",
                            children: [
                                {
                                    type: "if",
                                    value: 0,
                                    then: [
                                        {
                                            type: "Uint8",
                                            label: "End of Blocks",
                                        },
                                        {
                                            type: "Uint8",
                                            label: "End of Image",
                                            display: "hex",
                                        },
                                    ],
                                    else: [
                                        {
                                            id: "image_block_size",
                                            type: "Uint8",
                                            label: "Image Block Size",
                                        },
                                        {
                                            type: "bytes",
                                            label: "Image Data",
                                            length: "image_block_size",
                                        },
                                    ],
                                },
                            ],
                        },
                    ]
                }
            },
        ],
    },
];