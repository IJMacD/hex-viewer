import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, "MThd")) {
        return template;
    }
}

const template = [
    {
        type: "repeater",
        children: [
            {
                id: "chunk_type",
                type: "ASCII",
                label: "Chunk Type",
                length: 4,
            },
            {
                id: "chunk_length",
                type: "Uint32",
                label: "Chunk Length",
            },
            
            {
                type: "switch",
                value: "chunk_type",
                cases: {
                    "MThd ": [
                        {
                            type: "bytes",
                            label: "Data",
                            length: "chunk_length",
                        },
        ]
    }
];