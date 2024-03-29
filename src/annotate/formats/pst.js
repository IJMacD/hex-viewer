import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, "!BDN")) {
        return template;
    }
}

const pageEnum = {
    0x80: "ptypeBBT",
    0x81: "ptypeNBT",
    0x82: "ptypeFMap",
    0x83: "ptypePMap",
    0x84: "ptypeAMap",
    0x85: "ptypeFPMap",
    0x86: "ptypeDL",
};

function pageTrailer (id) {
    return [
        {"label":"ptype","id":`${id}_ptype`,"type":"Uint8","display":"hex","color":"#efff00","enum":pageEnum},
        {"label":"ptypeRepeat","type":"Uint8","display":"hex","color":"#cfff00","enum":pageEnum},
        {"label":"wSig","type":"Uint16","littleEndian":true,"color":"#afff00"},
        {"label":"dwCRC","type":"bytes","length":4,"color":"#8fff00"},
        {"label":"bid","type":"Uint64","littleEndian":true,"color":"#70ff00"}
    ];
}

/**
 * @param {string} id
 */
function BTPage (id) {
    return [
        {"label":"rgentries","type":"repeater","length":488,"color":"#ff5000",count:`${id}_cEnt`,children:[
            {
                type: "switch",
                value: `${id}_cLevel`,
                cases: {
                    0: [
                        {
                            type: "switch",
                            value: `${id}_ptype`,
                            cases: {
                                0x80: [
                                    ...BREF(id),
                                    {label:"cb",id:`${id}_rgentries[]_cb`,type:"Uint16",littleEndian:true,display:"byteSize"},
                                    {label:"cRef",type:"Uint16",littleEndian:true},
                                    {label:"dwPadding",type:"bytes",length:4},
                                ],
                                0x81: [
                                    {label:"nid",type:"Uint64",littleEndian:true},
                                    {label:"bidData",type:"Uint64",littleEndian:true},
                                    {label:"bidSub",type:"Uint64",littleEndian:true},
                                    {label:"nidParent",type:"Uint32",littleEndian:true},
                                    {label:"dwPadding",type:"bytes",length:4},
                                ]
                            }
                        }
                    ],
                    "default": [
                        {label:"btkey",type:"Uint64",littleEndian:true},
                        ...BREF(id + "_rgentries[]"),
                    ]
                }
            }
        ]},
        {"label":"cEnt","id":`${id}_cEnt`,"type":"Uint8","color":"#ff7000"},
        {"label":"cEntMax","type":"Uint8","color":"#ff8f00"},
        {"label":"cbEnt","type":"Uint8","color":"#ffaf00"},
        {"label":"cLevel","id":`${id}_cLevel`,"type":"Uint8","color":"#ffcf00"},
        {"label":"dwPadding","type":"bytes","length":4,"color":"#ffef00"},
        ...pageTrailer(id)
    ];
}

/**
 * @param {string} [id]
 */
function BREF(id) {
    return [
        {"label":"bid","type":"Uint64","littleEndian":true,"color":"#ff00bf"},
        {"label":"ib","id":`${id}_ib`,"type":"Uint64","littleEndian":true,"color":"#ff0020",display:"fileOffset"}
    ];
}

const template = [
    {"label":"Magic","type":"ASCII","start":0,"length":4,"color":"#ff0000"},
    {"label":"CRC","type":"bytes","length":4,"color":"#00ff00"},
    {"label":"Magic Client","type":"bytes","length":2,"color":"#0000ff"},
    {"label":"wVer","type":"Uint16","littleEndian":true,"color":"#ffff00"},
    {"label":"wVerClient","type":"Uint16","littleEndian":true,"color":"#00ffff"},
    {"label":"bPlatformCreate","type":"bytes","length":1,"color":"#ff00ff"},
    {"label":"bPlatformAccess","type":"bytes","length":1,"color":"#ff8000"},
    {"label":"dwReserved1","type":"bytes","length":4,"color":"#80ff00"},
    {"label":"dwReserved2","type":"bytes","length":4,"color":"#00ff80"},
    {"label":"bidUnused","type":"bytes","length":8,"color":"#007fff"},
    {"label":"bidNextP","type":"Uint64","littleEndian":true,"color":"#7f00ff"},
    {"label":"dwUnique","type":"Uint32","littleEndian":true,"color":"#ff0080"},
    {"label":"rgnid[]","type":"repeater","count":32,"children":[
        {"label":"rgnid[]","type":"Uint32","littleEndian":true,"color":"#ffbf00"}
    ],"color":"#ff4000"},
    {"label":"qwUnused","type":"bytes","length":8,"color":"#bfff00"},
    {"label":"root","type":"group","children":[
        {"label":"dwReserved","type":"bytes","length":4,"color":"#00ff40"},
        {"label":"ibFileEof","type":"Uint64","littleEndian":true,"display":"byteSize","color":"#00ffbf"},
        {"label":"ibAMapLast","type":"Uint64","littleEndian":true,"color":"#00bfff"},
        {"label":"cbAMapFree","type":"Uint64","littleEndian":true,"color":"#0040ff"},
        {"label":"cbPMapFree","type":"Uint64","littleEndian":true,"color":"#4000ff"},
        {"label":"BREFNBT","type":"group","children":BREF("brefnbt"),"color":"#bf00ff"},
        {"label":"BREFBBT","type":"group","children":BREF("brefbbt"),"color":"#ff2000"},
        {"label":"fAMapValid","type":"Uint8","length":1,"display":"hex","enum":{"0":"INVALID_AMAP","1":"VALID_AMAP1","2":"VALID_AMAP2"},"color":"#ffdf00"},
        {"label":"bReserved","type":"bytes","length":1,"color":"#dfff00"},
        {"label":"wReserved","type":"bytes","length":2,"color":"#9fff00"}
    ],"color":"#40ff00"},
    {"label":"dwAlign","type":"bytes","length":4,"color":"#60ff00"},
    {"label":"rgbFM","type":"bytes","length":128,"color":"#20ff00"},
    {"label":"rgbFP","type":"bytes","length":128,"color":"#00ff20"},
    {"label":"bSentinel","type":"bytes","length":1,"color":"#00ff60"},
    {"label":"bCryptMethod","type":"Uint8","length":1,"display":"hex","enum":{"0":"NDB_CRYPT_NONE","1":"NDB_CRYPT_PERMUTE","2":"NDB_CRYPT_CYCLIC","3":"NDB_CRYPT_EDPCRYPTED"},"color":"#00ff9f"},
    {"label":"rgbReserved","type":"bytes","length":2,"color":"#00ffdf"},
    {"label":"bidNextB","type":"Uint64","littleEndian":true,"color":"#00dfff"},
    {"label":"dwCRCFull","type":"bytes","length":4,"color":"#009fff"},
    {"label":"rgbReserved","type":"bytes","length":3,"color":"#0060ff"},
    {"label":"bReserved","type":"bytes","length":1,"color":"#0020ff"},
    {"label":"rgbReserved3","type":"bytes","length":32,"color":"#2000ff"},
    {"label":"NBT Root",type:"group","start":"brefnbt_ib",children:BTPage("nbt_root")},
    {"label":"BBT Root",type:"group","start":"brefbbt_ib",children:BTPage("bbt_root")},
    {"label":"NBT Page 0",type:"group","start":"nbt_root_rgentries[]_ib",children:BTPage("nbt_page0")},
    {"label":"NBT Page 0/Page 0",type:"group","start":"nbt_page0_rgentries[]_ib",children:BTPage("nbt_page0_page0")},
    {"label":"BBT Page 0",type:"group","start":"bbt_root_rgentries[]_ib",children:BTPage("bbt_page0")},
    {"label":"BBT Page 0/Page 0",type:"group","start":"bbt_page0_rgentries[]_ib",children:BTPage("bbt_page0_page0")},
    {"label":"BBT Page 0/Page 0/Block 0",type:"group","start":"bbt_page0_page0_ib",children:[
        {label:"data",type:"bytes",length:"bbt_page0_page0_rgentries[]_cb"},
        {label:"padding",type:"bytes",length:{operation:"subtract",left:{operation:"subtract",left:{operation:"nextMultiple",left:"bbt_page0_page0_rgentries[]_cb",right:64},right:"bbt_page0_page0_rgentries[]_cb"},right:16}},
        {label:"cb",type:"Uint16",littleEndian:true,display:"byteSize"},
        {label:"wSig",type:"Uint16",littleEndian:true},
        {label:"dwCRC",type:"bytes",length:4},
        {label:"bid",type:"Uint64",littleEndian:true},
    ]},
];

export default template;
