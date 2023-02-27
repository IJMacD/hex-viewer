import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, "!BDN")) {
        return template;
    }
}

const template = [
    {"label":"Magic","type":"ASCII","start":0,"length":4},
    {"label":"CRC","type":"bytes","length":4},
    {"label":"Magic Client","type":"bytes","length":2},
    {"label":"wVer","type":"Uint16","littleEndian":true},
    {"label":"wVerClient","type":"Uint16","littleEndian":true},
    {"label":"bPlatformCreate","type":"bytes","length":1},
    {"label":"bPlatformAccess","type":"bytes","length":1},
    {"label":"dwReserved1","type":"bytes","length":4},
    {"label":"dwReserved2","type":"bytes","length":4},
    {"label":"bidUnused","type":"bytes","length":8},
    {"label":"bidNextP","type":"Uint64","littleEndian":true},
    {"label":"dwUnique","type":"Uint32","littleEndian":true},
    {"label":"rgnid[]","type":"repeater",count:32,children:[
        {
            "label":"rgnid[]",
            type:"Uint32",
            littleEndian: true
        }
    ]},
    {"label":"qwUnused","type":"bytes","length":8},
    {
        "label":"root",
        "type": "group",
        "children": [
            {"label":"dwReserved","type":"bytes","length":4},
            {"label":"ibFileEof","type":"Uint64","littleEndian":true,"display":"byteSize"},
            {"label":"ibAMapLast","type":"Uint64","littleEndian":true},
            {"label":"cbAMapFree","type":"Uint64","littleEndian":true},
            {"label":"cbPMapFree","type":"Uint64","littleEndian":true},
            {"label":"BREFNBT","type":"group",children:[{label:"bid",type:"Uint64",littleEndian:true},{label:"ib",type:"Uint64",littleEndian:true}]},
            {"label":"BREFBBT","type":"group",children:[{label:"bid",type:"Uint64",littleEndian:true},{label:"ib",type:"Uint64",littleEndian:true}]},
            {"label":"fAMapValid","type":"Uint8","length":1,display:"hex","enum":{0:"INVALID_AMAP",1:"VALID_AMAP1",2:"VALID_AMAP2"}},
            {"label":"bReserved","type":"bytes","length":1},
            {"label":"wReserved","type":"bytes","length":2}
        ],
    },
    {"label":"dwAlign","type":"bytes","length":4},
    {"label":"rgbFM","type":"bytes","length":128},
    {"label":"rgbFP","type":"bytes","length":128},
    {"label":"bSentinel","type":"bytes","length":1},
    {"label":"bCryptMethod","type":"Uint8","length":1,display:"hex","enum":{0:"NDB_CRYPT_NONE",1:"NDB_CRYPT_PERMUTE",2:"NDB_CRYPT_CYCLIC",3:"NDB_CRYPT_EDPCRYPTED"}},
    {"label":"rgbReserved","type":"bytes","length":2},
    {"label":"bidNextB","type":"Uint64","littleEndian":true},
    {"label":"dwCRCFull","type":"bytes","length":4},
    {"label":"rgbReserved","type":"bytes","length":3},
    {"label":"bReserved","type":"bytes","length":1},
    {"label":"rgbReserved3","type":"bytes","length":32}
];

export default template;
