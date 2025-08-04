"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGDBString = parseGDBString;
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
    // if(string.includes('~'))
    //     return {json: '"message: "' + string}
    // if(string.includes('^error'))
    //     return {json: '"errror: "' + string}
    for (let index = 0; index < string.length; index++) {
        const element = string[index];
        if ((element == ',' || element == ' ' || element == '=' || ['}', ']'].includes(element) || ['{', '['].includes(element) || index + 1 == string.length) && buffer != '') {
            key += element;
            if ((!key.includes('=') || key[0] == '=') && jsonDepth == 0)
                buffer = `response": "` + buffer;
            if (element == '=')
                if (string[index + 2] == '{' && string[index + 1] != '[') // handle edge case for when value is supposed to be an array,
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
                        // if(buffer.includes('<repeats')) // handle edge case for arrays where, if there are too many values, they get truncated and replaced with '...';
                        // {
                        //     jsonString = '"'+buffer.replace('<repeats','", "<repeats')
                        //     buffer = buffer.replace('<repeats','')
                        //     // jsonString+=buffer+'"]'+', "truncated": "true"'; // add truncated key after value array
                        //     // extraJsonDepth=k-1;
                        // }
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
        return { err, json: jsonString };
    }
}
