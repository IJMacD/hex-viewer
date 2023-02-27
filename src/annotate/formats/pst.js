import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, "!BDN")) {
        return template;
    }
}

const template = [
    {"label":"Magic","type":"ASCII","start":0,"length":4,"color":"#ff0000"},
    {"label":"CRC","type":"bytes","length":4,"color":"#00ff00"},
    {"label":"Magic Client","type":"bytes","length":2,"color":"#0000ff"},
    {"label":"wVer","type":"Uint16","littleEndian":true,"color":"#00ffff"},
    {"label":"wVerClient","type":"Uint16","littleEndian":true,"color":"#ff00ff"},
    {"label":"bPlatformCreate","type":"bytes","length":1,"color":"#ff8000"},
    {"label":"bPlatformAccess","type":"bytes","length":1,"color":"#80ff00"},
    {"label":"dwReserved1","type":"bytes","length":4,"color":"#00ff80"},
    {"label":"dwReserved2","type":"bytes","length":4,"color":"#007fff"},
    {"label":"bidUnused","type":"bytes","length":8,"color":"#7f00ff"},
    {"label":"bidNextP","type":"Uint64","littleEndian":true,"color":"#ff0080"},
    {"label":"dwUnique","type":"Uint32","littleEndian":true,"color":"#ff0000"},
    {"label":"rgnid","type":"bytes","length":128,"color":"#00ff00"},
    {"label":"qwUnused","type":"bytes","length":8,"color":"#0000ff"},
    {
        "label":"root",
        "type": "group",
        "children": [
            {"label":"dwReserved","type":"bytes","length":4,"color":"#ffff00"},
            {"label":"ibFileEof","type":"Uint64","littleEndian":true,"color":"#40ff00"},
            {"label":"ibAMapLast","type":"Uint64","littleEndian":true,"color":"#00ff40"},
            {"label":"cbAMapFree","type":"Uint64","littleEndian":true,"color":"#00ffbf"},
            {"label":"cbPMapFree","type":"Uint64","littleEndian":true,"color":"#0040ff"},
            {"label":"BREFNBT","type":"bytes","length":16,"color":"#4000ff"},
            {"label":"BREFBBT","type":"bytes","length":16,"color":"#bf00ff"},
            {"label":"fAMapValid","type":"bytes","length":1,"color":"#ff00bf"},
            {"label":"bReserved","type":"bytes","length":1,"color":"#ff0040"},
            {"label":"wReserved","type":"bytes","length":2,"color":"#ff2000"}
        ],
    },
    {"label":"dwAlign","type":"bytes","length":4,"color":"#00ffff"},
    {"label":"rgbFM","type":"bytes","length":128,"color":"#ff00ff"},
    {"label":"rgbFP","type":"bytes","length":128,"color":"#ff8000"},
    {"label":"bSentinel","type":"bytes","length":1,"color":"#80ff00"},
    {"label":"bCryptMethod","type":"bytes","length":1,"color":"#00ff80"},
    {"label":"rgbReserved","type":"bytes","length":2,"color":"#007fff"},
    {"label":"bidNextB","type":"Uint64","littleEndian":true,"color":"#7f00ff"},
    {"label":"dwCRCFull","type":"bytes","length":4,"color":"#ff0080"},
    {"label":"rgbReserved","type":"bytes","length":3,"color":"#ff4000"},
    {"label":"bReserved","type":"bytes","length":1,"color":"#ffbf00"},
    {"label":"rgbReserved3","type":"bytes","length":32,"color":"#bfff00"}
];

export default template;
