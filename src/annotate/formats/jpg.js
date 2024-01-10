import { markerMatch } from "../util";

export function magic(buffer) {
    if (markerMatch(buffer, [0xFF,0xD8])) {
        return template;
    }
}

const template = [
    {
        "label": "Start of Image",
        "type": "bytes",
        "length": "2",
        "color": "hsl(0deg, 100%, 50%)"
    },
    {
        "type": "repeater",
        "children": [
            {
                "label": "Marker",
                "id": "marker",
                "type": "Uint16",
                "display": "hex",
                "color": "hsl(57deg, 100%, 50%)"
            },
            {
                "label": "Size",
                "id": "size",
                "type": "Uint16",
                "color": "hsl(114deg, 100%, 50%)"
            },
            {
                "type": "switch",
                "value": "marker",
                "cases": {
                    "65505": [
                        {
                            "type": "group",
                            "label": "Exif",
                            "length": "size - 2",
                            "children": [
                                {
                                    "type": "ASCII",
                                    "length": 6,
                                    "label": "EXIF Header",
                                    "color": "hsl(102deg, 100%, 50%)"
                                },
                                {
                                    "type": "ASCII",
                                    "length": 2,
                                    "label": "TIFF Header",
                                    "color": "hsl(159deg, 100%, 50%)"
                                },
                                {
                                    "type": "Uint16",
                                    "label": "Tiff Version",
                                    "color": "hsl(216deg, 100%, 50%)"
                                },
                                {
                                    "type": "Uint32",
                                    "label": "IFD Offset",
                                    "color": "hsl(0deg, 100%, 50%)"
                                },
                                {
                                    "type": "Uint16",
                                    "label": "Entry Count",
                                    "id": "entry_count",
                                    "color": "hsl(57deg, 100%, 50%)"
                                },
                                {
                                    "type": "repeater",
                                    "count": "entry_count",
                                    "children": [
                                        {
                                            "label": "Tag",
                                            "type": "bytes",
                                            "length": "2",
                                            "color": "hsl(342deg, 100%, 50%)"
                                        },
                                        {
                                            "label": "Format",
                                            "type": "Uint16",
                                            "color": "hsl(39deg, 100%, 50%)"
                                        },
                                        {
                                            "label": "Num Components",
                                            "type": "Uint32",
                                            "color": "hsl(96deg, 100%, 50%)"
                                        },
                                        {
                                            "label": "Data",
                                            "type": "bytes",
                                            "length": 4,
                                            "color": "hsl(153deg, 100%, 50%)"
                                        }
                                    ],
                                    "color": "hsl(114deg, 100%, 50%)"
                                }
                            ],
                            "color": "hsl(228deg, 100%, 50%)"
                        }
                    ],
                    "default": [
                        {
                            "label": "Data",
                            "type": "bytes",
                            "length": "size - 2",
                            "color": "hsl(171deg, 100%, 50%)"
                        }
                    ]
                },
                "color": "hsl(171deg, 100%, 50%)"
            }
        ],
        "color": "hsl(228deg, 100%, 50%)"
    }
];

export default template;
