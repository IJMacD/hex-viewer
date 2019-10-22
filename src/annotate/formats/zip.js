import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, "PK")) {
        return template;
    }
}

const template = [
    // {
    //     type: "repeater",
    //     children: [
            {
                type: "ASCII",
                label: "Marker",
                start: 0,
                length: 4,
            },
            {
                type: "Uint16",
                label: "Version (Minimum)",
                littleEndian: true,
            },
            {
                type: "bytes",
                label: "Flags",
                length: 2,
            },
            {
                type: "Uint16",
                label: "Compression Method",
                littleEndian: true,
            },
            {
                type: "Uint16",
                label: "Modification Time",
                littleEndian: true,
            },
            {
                type: "Uint16",
                label: "Modification Date",
                littleEndian: true,
            },
            {
                type: "Uint32",
                label: "CRC",
                littleEndian: true,
            },
            {
                id: "compressed_length",
                type: "Uint32",
                label: "Compressed Size",
                littleEndian: true,
            },
            {
                type: "Uint32",
                label: "Uncompressed Size",
                littleEndian: true,
            },
            {
                id: "filename_length",
                type: "Uint16",
                label: "Filename Length",
                littleEndian: true,
            },
            {
                id: "extra_length",
                type: "Uint16",
                label: "Extra Field Length",
                littleEndian: true,
            },
            {
                type: "ASCII",
                label: "Filename",
                length: "filename_length"
            },
            {
                type: "bytes",
                label: "Extra Field",
                length: "extra_length"
            },
            {
                type: "bytes",
                label: "Compressed Data",
                length: "compressed_length"
            }
    //     ]
    // }
];

export default template;
