import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, "!<arch>")) {
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
    // {
    //     type: "repeater",
    //     children: [
            {
                type: "ASCII",
                length: 16,
                label: "Filename"
            },
            {
                type: "ASCII",
                length: 12,
                label: "Timestamp"
            },
            {
                type: "ASCII",
                length: 6,
                label: "Owner ID"
            },
            {
                type: "ASCII",
                length: 6,
                label: "Group ID"
            },
            {
                type: "ASCII",
                length: 8,
                label: "File mode"
            },
            {
                type: "ASCII",
                length: 10,
                label: "File size"
            },
            {
                type: "bytes",
                length: 2,
                label: "End Marker"
            },
    //     ],
    // },
];

export default template;
