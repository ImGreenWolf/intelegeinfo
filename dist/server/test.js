"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//    let gdbBuffer = '^done,variables=[{name="i",value="2"}]';
let gdbBuffer = `^done,variables=[{name="i",value="2"},{name="ciur",value="{8, 0, 7253280, 0, 4, 0, 1, 0, 8, 0, -1423489206, 32760, 7209704, 0, 6287961, 0, 7208960, 0, 201588744, 32760, 8, 0, 7253280, 0, 7253296, 0, -1423507780, 32760, 7208960, 0, 6287961, 0, 7252864, 0, 34, 0, 8, 0, 8, 0, 7264512, 0, 7252874, 0, 7208964, 0, 7252880, 0, 0, 0, 0, 0, 580016, 0, 26, 0, 0, 34, 1, 0, 416, 0, 7263744, 0, 7252864, 0, 8, 0, 7264688, 0, 112, 0, 0, 0, 7252864, 0, 26, 0, 24, 0, 0, 0, 7209764, 0, 7209296, 0, -1423156319, 32760, 512, 0, 7208960, 0, 7253312, 0, 112, 0, 1073741922, 0, -1423171759, 32760, 7208960, 0, -1422992676, 32760, 7208960, 0, 1342177379, 0, 7253264, 0, 7252992, 0, 6287912, 0, 6287904, 0, 4112384, 0, -1423647450, 32760, 327680, 0, 2, 0, 0, 0, -1423648572, 32760, -1423335936, 32760, 1342177379, 0, 1997766656, 0, 6289920, 0, 2, 0, 1996493549, 32760, 1078419223, 29076, 1996537312, 32760, 4108288, 0, 6287904, 0, 6226177, 1, 327680, 0, 2, 0, 1204, 0, 6288072, 0, 6288112, 0, 0, 0, 1996488704, 32760, 360, 0, 1078419255, 29076, 1204, 0, 3, 0, 6288488, 0, 6288072, 0, 6288112, 0, 333692, 0, 0, 0, -1423649615, 32760, 2, 0, 6287952, 0, 6287952, 0, 0, 0, 6287900, 0, 6287896, 0, 7263744, 0, 7263760, 0...}"}]`;
const resMap = new Map();
//     if(gdbBuffer.includes("frame="))
// {
// gdbBuffer.toString().split('\n')[0].split(',').forEach((pair) => {
//     if(pair.includes("="))
//         resMap.set(pair.split('=')[0].replace("{", ""),
//      pair.split('=')[1].replace("}", "").replace("{", "").replaceAll('"', ""))
// })
const keys = gdbBuffer.toString().split('\n')[0];
function parseGDBString(gdbString) {
    const string = gdbString; //.replaceAll(" ",'');
    let buffer = '';
    let jsonDepth = 0;
    let key = '';
    let k = 0;
    let jsonString = "{";
    let extraJson = '';
    let extraJsonDepth = 0;
    // for(let index = 0; index < string.length; index++) {
    //     const element = string[index];
    //     if(element == "[" || element == "{")
    //         jsonDepth++;
    //     else if(element == ']' || element == "}")
    //         jsonDepth--;
    //     else 
    //     if((element==',' || index+1==string.length))
    //     {
    //         // console.log(map.get(buffer.split('=')[0]))
    //         if(jsonDepth==0)
    //         {
    //             if(buffer.includes('='))
    //             {
    //                 if(map.has(buffer.split('=')[0]))
    //                     map.set((++k)+buffer.split('=')[0],buffer.replace(buffer.split('=')[0]+"=", ""))
    //                 else
    //                     map.set(buffer.split('=')[0],buffer.replace(buffer.split('=')[0]+"=", ""))
    //             }   
    //             else
    //                 map.set((k++).toString(), buffer) // fallback method to map by a counter.
    //         // TODO Add support for arrays. ^done,variables=[{name="j",value="106"},{name="i",value="2"}] will only output one pair. make it so its 0name 0value 1name 1 value etc etc maybe.
    //         }
    //         else
    //         {
    //              if(map.has(buffer.split('=')[0]))
    //                     map.set((jsonDepth)+buffer.split('=')[0],buffer.replace(buffer.split('=')[0]+"=", ""))
    //                 else
    //                     map.set(buffer.split('=')[0],buffer.replace(buffer.split('=')[0]+"=", ""))
    //         }
    //         buffer='';
    //     }
    //     else
    //         //jsonDepth==0 && 
    //         if(element=="=" && (string[index+1] == "[" || string[index+1] == "{"))
    //         {
    //             keyInArray=jsonDepth
    //             key=buffer;
    //                     buffer='';
    //         }
    //         else
    //         {
    //             buffer += element;
    //         }
    // }
    // buffer='';
    // jsonDepth = 0;
    // key=''
    for (let index = 0; index < string.length; index++) {
        const element = string[index];
        if ((element == ',' || element == '=' || ['}', ']'].includes(element) || ['{', '['].includes(element) || index + 1 == string.length) && buffer != '') {
            key += element;
            if (!key.includes('=') && jsonDepth == 0)
                buffer = `response": "` + buffer;
            if (element == '=')
                if (keys[index + 2] == '{' && keys[index + 1] != '[') // handle edge case for when value is supposed to be an array,
                 { // but is defined as an object in the gdb string, so we
                    jsonString += '"' + buffer + '": ['; // replace { with [, save the depth, and then replace the
                    k = jsonDepth + 1; // matching } with };
                }
                else
                    jsonString += '"' + buffer + '": ';
            else {
                if (['}', ']'].includes(element)) {
                    if (k == jsonDepth) {
                        if (buffer.includes('...')) // handle edge case for arrays where, if there are too many values, they get truncated and replaced with '...';
                         {
                            buffer = '"' + buffer.replace('...', '"');
                            jsonString += buffer + ']' + ', "truncated": "true"'; // add truncated key after value array
                            extraJsonDepth = k - 1;
                        }
                        else
                            jsonString += buffer + ']';
                    }
                    else
                        jsonString += '"' + buffer + '"' + element;
                    jsonDepth--;
                }
                else {
                    jsonString += '"' + buffer + '"';
                    if (index + 1 != string.length)
                        jsonString += ', ';
                }
                key = '';
            }
            buffer = ''; // clear buffer after writing it to the output;  
        }
        else if (['}', ']'].includes(element) || index + 1 == string.length) {
            jsonDepth--; //
            jsonString += buffer + element; // omit from buffer
            buffer = ''; //
        }
        else if (['{', '['].includes(element) || index + 1 == string.length) {
            jsonDepth++;
            if (!key.includes('value')) //
                jsonString += buffer + element; // omit { from buffer to handle edge case for when value is supposed to be an array
            buffer = ''; //
        }
        else if (element == ',' && buffer == '') {
            buffer = '';
            jsonString += ', ' + buffer;
        }
        else {
            if (element == '\\')
                buffer += '/'; // replace \ with /
            else if (!['"', ' '].includes(element))
                buffer += element; // write chars to buffer and omit 
            key += element;
        }
    }
    jsonString += extraJson ? ',' + extraJson : '';
    jsonString += "}"; // close json string
    jsonString = jsonString.trim();
    try {
        const json = JSON.parse(jsonString);
        return { json };
    }
    catch (err) {
        return { err };
    }
}
console.log(parseGDBString(keys).json);
