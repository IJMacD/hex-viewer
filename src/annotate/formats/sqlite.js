import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, "SQLite")) {
        return template;
    }
}

const template = [{"label":"Marker","type":"ASCII","length":16,"color":"#ff0000"},{"label":"Page Size","type":"Uint16","color":"#00ff00"},{"label":"Write Version","type":"Uint8","color":"#0000ff"},{"label":"Read Version","type":"Uint8","color":"#ffff00"},{"label":"Reserved Space","type":"Uint8","color":"#00ffff"},{"label":"Max Payload Fraction","type":"Uint8","color":"#ff00ff"},{"label":"Min Payload Fraction","type":"Uint8","color":"#ff8000"},{"label":"Leaf Payload Fraction","type":"Uint8","color":"#80ff00"},{"label":"File Change Counter","type":"Uint32","color":"#00ff80"},{"label":"Size in Pages","type":"Uint32","color":"#007fff"},{"label":"First Free Page","type":"Uint32","color":"#7f00ff"},{"label":"Free Page Count","type":"Uint32","color":"#ff0080"},{"label":"Schema Cookie","type":"Uint32","color":"#00ff40"},{"label":"Schema Format","type":"Uint32","color":"#00ffbf"},{"label":"Default Page Cache Size","type":"Uint32","color":"#00bfff"},{"label":"Largest Root B-Tree Page","type":"Uint32","color":"#0040ff"},{"label":"Text Encoding","type":"Uint32","color":"#4000ff"},{"label":"User Version","type":"Uint32","color":"#bf00ff"},{"label":"Incremental Vacuum Mode","type":"Uint32","color":"#ff00bf"},{"label":"Application ID","type":"Uint32","color":"#ff0040"},{"label":"Padding","type":"bytes","length":20,"color":"#ff2000"},{"label":"Version Valid For","type":"Uint32","color":"#ff6000"},{"label":"SQLite Version Number","type":"Uint32","color":"#ff9f00"}];

export default template;
