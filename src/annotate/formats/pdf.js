import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, "%PDF")) {
        return template;
    }
}

const template = [
    {
        type: "ASCII",
        label: "Marker",
        start: 0,
        length: 5,
    },
    {
        type: "ASCII",
        label: "Version",
        length: 3,
    },
];

export default template;
