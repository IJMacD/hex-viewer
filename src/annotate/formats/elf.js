import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, [ 0x7f,0x45,0x4c,0x46 ])) {
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
        id: "bit_indicator",
        type: "Uint8",
        label: "32/64-bit Indicator",
    },
    {
        id: "endian_indicator",
        type: "Uint8",
        label: "Little/Big-endian Indicator",
    },
    {
        type: "Uint8",
        label: "Version",
    },
    {
        type: "Uint8",
        label: "Target",
        display: "hex",
    },
    {
        type: "Uint8",
        label: "ABI Version",
        display: "hex",
    },
    {
        type: "Uint16",
        start: 0x10,
        label: "Type",
        display: "hex",
        littleEndian: "endian_indicator = 1",
    },
    {
        type: "Uint16",
        label: "Instruction Set",
        display: "hex",
        littleEndian: "endian_indicator = 1",
    },
    {
        type: "Uint32",
        label: "Version",
        littleEndian: "endian_indicator = 1",
    },
    {
        type: "switch",
        value: "bit_indicator",
        cases: {
            0x01: [
                {
                    type: "Uint32",
                    label: "Start Address",
                    littleEndian: "endian_indicator = 1",
                },
                {
                    type: "Uint32",
                    label: "Program Header Address",
                    littleEndian: "endian_indicator = 1",
                },
                {
                    type: "Uint32",
                    label: "Section Header Address",
                    littleEndian: "endian_indicator = 1",
                }
            ],
            0x02: [
                {
                    type: "Uint64",
                    label: "Start Address",
                    littleEndian: "endian_indicator = 1",
                },
                {
                    type: "Uint64",
                    label: "Program Header Address",
                    littleEndian: "endian_indicator = 1",
                },
                {
                    type: "Uint64",
                    label: "Section Header Address",
                    littleEndian: "endian_indicator = 1",
                }
            ]
        }
    },
    {
        type: "Uint32",
        label: "Flags",
        display: "binary"
    },
    {
        type: "Uint16",
        label: "Header Length",
        littleEndian: "endian_indicator = 1",
    },
    {
        type: "Uint16",
        label: "Program Header Length",
        littleEndian: "endian_indicator = 1",
    },
    {
        type: "Uint16",
        label: "Program Header Entries",
        littleEndian: "endian_indicator = 1",
    },
    {
        type: "Uint16",
        label: "Section Header Length",
        littleEndian: "endian_indicator = 1",
    },
    {
        type: "Uint16",
        label: "Section Header Entries",
        littleEndian: "endian_indicator = 1",
    },
    {
        type: "Uint16",
        label: "Section Header Names Index",
        littleEndian: "endian_indicator = 1",
    },
];

export default template;
