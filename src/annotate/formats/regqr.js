import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, [0x18])) {
        return template;
    }
}

const template = [
    {
        type: "bytes",
        label: "Marker",
        start: 0,
        length: 1,
    },
    {
        type: "Uint8",
        label: "Count",
        id: "count",
    },
    {
        type: "repeater",
        count: "count",
        children: [
            {
                type: "bytes",
                label: "Unknown",
                length: 1
            },
            {
                type: "Uint8",
                label: "Unknown",
            },
            {
                type: "bytes",
                label: "Unknown",
                length: 2
            },
            {
                type: "Uint8",
                label: "Length",
                id: "base64_length"
            },
            {
                type: "bytes",
                label: "Unknown",
                length: 1
            },
            {
                type: "ASCII",
                label: "Base64",
                length: "base64_length * 2"
            },
            {
                type: "bytes",
                label: "Unknown",
                length: 1
            },
            {
                type: "Uint8",
                label: "ID Length",
                id: "id_length"
            },
            {
                type: "ASCII",
                label: "ID",
                length: "id_length"
            },
        ],
    }
];

export default template;
