/**
 * Parses a GDB/MI output string into a JSON object.
 * Handles nested structures, arrays, and quoted strings.
 * If the first argument doesn't have a name, adds "message" as the key.
 * Returns { json } on success, or { err, json: string } on failure.
 */
export function parseGDBString(gdbString: string) {
    // Remove escaped quotes and trim whitespace
    const input = gdbString.replace(/\\"/g, '"').trim();

    // Early return for simple error or message lines
    if (input.startsWith('~')) return { json: { message: input.slice(1).trim() } };
    if (input.startsWith('^error')) return { json: { error: input } };

    // Helper: parse a value (could be string, object, or array)
    function parseValue(str: string, idx: number): [any, number] {
        while (str[idx] === ' ' || str[idx] === ',') idx++; // skip whitespace/commas

        if (str[idx] === '"') {
            // Parse quoted string
            let end = idx + 1;
            let val = '';
            while (end < str.length) {
                if (str[end] === '"' && str[end - 1] !== '\\') break;
                val += str[end];
                end++;
            }
            return [val, end + 1];
        }
        if (str[idx] === '{') {
            // Parse object
            const [obj, next] = parseObject(str, idx + 1);
            return [obj, next];
        }
        if (str[idx] === '[') {
            // Parse array
            const [arr, next] = parseArray(str, idx + 1);
            return [arr, next];
        }
        // Parse unquoted value (until , or } or ])
        let end = idx;
        while (end < str.length && ![',', '}', ']'].includes(str[end])) end++;
        return [str.slice(idx, end).trim(), end];
    }

    // Helper: parse an object {key="value",...}
    function parseObject(str: string, idx: number): [any, number] {
        const obj: any = {};
        while (idx < str.length) {
            while (str[idx] === ' ' || str[idx] === ',') idx++;
            if (str[idx] === '}') return [obj, idx + 1];
            // Parse key
            let keyEnd = idx;
            while (keyEnd < str.length && str[keyEnd] !== '=') keyEnd++;
            const key = str.slice(idx, keyEnd).trim();
            idx = keyEnd + 1;
            // Parse value
            const [val, next] = parseValue(str, idx);
            obj[key] = val;
            idx = next;
            while (str[idx] === ' ' || str[idx] === ',') idx++;
            if (str[idx] === '}') return [obj, idx + 1];
        }
        return [obj, idx];
    }

    // Helper: parse an array [item1,item2,...]
    function parseArray(str: string, idx: number): [any[], number] {
        const arr: any[] = [];
        while (idx < str.length) {
            while (str[idx] === ' ' || str[idx] === ',') idx++;
            if (str[idx] === ']') return [arr, idx + 1];
            const [val, next] = parseValue(str, idx);
            arr.push(val);
            idx = next;
            while (str[idx] === ' ' || str[idx] === ',') idx++;
            if (str[idx] === ']') return [arr, idx + 1];
        }
        return [arr, idx];
    }

    // Main parse: GDB/MI output is usually key="value",key2={...},key3=[...]
    try {
        let idx = 0;
        let result: any = {};
        // If the string starts with { or [, parse as object/array
        if (input[0] === '{') {
            [result, idx] = parseObject(input, 1);
        } else if (input[0] === '[') {
            [result, idx] = parseArray(input, 1);
        } else {
            // Otherwise, parse as key-value pairs
            let firstKeyIsMessage = false;
            // Check if the first argument has a name
            let tempIdx = idx;
            while (input[tempIdx] === ' ' || input[tempIdx] === ',') tempIdx++;
            let keyEnd = tempIdx;
            while (keyEnd < input.length && input[keyEnd] !== '=' && input[keyEnd] !== ',' && input[keyEnd] !== '{' && input[keyEnd] !== '[') keyEnd++;
            // If the first token is not followed by '=', treat it as a message
            if (input[keyEnd] !== '=') {
                const message = input.slice(tempIdx, keyEnd).trim();
                result["message"] = message;
                idx = keyEnd;
                // Skip comma if present
                while (input[idx] === ' ' || input[idx] === ',') idx++;
                firstKeyIsMessage = true;
            }
            while (idx < input.length) {
                while (input[idx] === ' ' || input[idx] === ',') idx++;
                // Parse key
                let keyEnd = idx;
                while (keyEnd < input.length && input[keyEnd] !== '=') keyEnd++;
                if (keyEnd >= input.length) break;
                const key = input.slice(idx, keyEnd).trim();
                idx = keyEnd + 1;
                // Parse value
                const [val, next] = parseValue(input, idx);
                result[key] = val;
                idx = next;
                while (input[idx] === ' ' || input[idx] === ',') idx++;
            }
        }
        return { json: result };
    } catch (err) {
        return { err, json: input };
    }
}


/*

    export function parseGDBString(gdbString: string)
    {
        const string = gdbString.replaceAll('\\"','"')//.replaceAll(" ",'');
        let buffer: string = '';
        let jsonDepth: number = 0;
        let key: string = '';
        let k = 0;
        let jsonString:string ="{";
        let extraJson:string = '';
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

        for(let index = 0; index < string.length; index++) {
            const element = string[index];
                            
            if((element==',' || element==' '  || element=='=' || ['}', ']'].includes(element) || ['{', '['].includes(element) || index+1==string.length) && buffer!='')
            {
                key+=element
                if((!key.includes('=') || key[0]=='=') && jsonDepth==0)
                    buffer= `response": "` + buffer
                if(element=='=')
                    if(string[index+2]=='{' && string[index+1]!='[')    // handle edge case for when value is supposed to be an array,
                    {                                                   // but is defined as an object in the gdb string, so we
                        jsonString+='"'+buffer+'": ['                   // replace { with [, save the depth, and then replace the
                        k=jsonDepth+1;                                  // matching } with };
                    }
                    else
                        jsonString+='"'+buffer+'": ';
                else
                {
                    if(['}', ']'].includes(element))
                    {
                        if(k==jsonDepth)
                        {
                            if(buffer.includes('...')) // handle edge case for arrays where, if there are too many values, they get truncated and replaced with '...';
                            {
                                buffer = '"'+buffer.replace('...','"')
                                jsonString+=buffer+']'+', "truncated": "true"'; // add truncated key after value array
                                extraJsonDepth=k-1;
                            }
                            // if(buffer.includes('<repeats')) // handle edge case for arrays where, if there are too many values, they get truncated and replaced with '...';
                            // {
                            //     jsonString = '"'+buffer.replace('<repeats','", "<repeats')
                            //     buffer = buffer.replace('<repeats','')
                            //     // jsonString+=buffer+'"]'+', "truncated": "true"'; // add truncated key after value array
                            //     // extraJsonDepth=k-1;
                            // }
                            else
                                jsonString+=buffer+']';
                            } 
                        else
                            jsonString+='"'+buffer+'"'+element;
                        jsonDepth--;
                        
                    }
                        
                    else
                    {
                        
                        jsonString+='"'+buffer+'"';
                        if(index+1!=string.length)
                            jsonString+=', ';
                    }
                        

                    key='';
                }  

                buffer=''; // clear buffer after writing it to the output;  
            }
            else if(['}', ']'].includes(element) || index+1==string.length)
            {
                jsonDepth--;               //
                jsonString+=buffer+element // omit from buffer
                buffer='';                 //
            }else if(['{', '['].includes(element) || index+1==string.length)
            {
                jsonDepth++;
                if(!key.includes('value'))      //
                    jsonString+=buffer+element; // omit { from buffer to handle edge case for when value is supposed to be an array
                buffer='';                      //
            } else
            if(element==',' && buffer=='')
            {
                buffer=''
                jsonString+=', '+buffer;
            }
            else
            {
                if(element=='\\')
                    buffer += '/'; // replace \ with /
                else if(!['"', ' '].includes(element))
                    buffer += element;  // write chars to buffer and omit 
                key+=element;
            }
            
                

        }
        jsonString += extraJson? ',' + extraJson : '';
        jsonString += "}" // close json string
        jsonString = jsonString.trim()
        try {
            const json = JSON.parse(jsonString)
            return {json};
        }
        catch(err)
        {
            return {err, json: jsonString};
        }
    } 


    */