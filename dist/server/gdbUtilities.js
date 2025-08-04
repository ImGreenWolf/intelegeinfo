"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGDBString = parseGDBString;
/**
 * Parses a GDB/MI output string into a JSON object.
 * Handles nested structures, arrays, and quoted strings.
 * Returns { json } on success, or { err, json: string } on failure.
 */
function parseGDBString(gdbString) {
    // Remove escaped quotes and trim whitespace
    const input = gdbString.replace(/\\"/g, '"').trim();
    // Early return for simple error or message lines
    if (input.startsWith('~'))
        return { json: { message: input.slice(1).trim() } };
    if (input.startsWith('^error'))
        return { json: { error: input } };
    // Helper: parse a value (could be string, object, or array)
    function parseValue(str, idx) {
        while (str[idx] === ' ' || str[idx] === ',')
            idx++; // skip whitespace/commas
        if (str[idx] === '"') {
            // Parse quoted string
            let end = idx + 1;
            let val = '';
            while (end < str.length) {
                if (str[end] === '"' && str[end - 1] !== '\\')
                    break;
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
        while (end < str.length && ![',', '}', ']'].includes(str[end]))
            end++;
        return [str.slice(idx, end).trim(), end];
    }
    // Helper: parse an object {key="value",...}
    function parseObject(str, idx) {
        const obj = {};
        while (idx < str.length) {
            while (str[idx] === ' ' || str[idx] === ',')
                idx++;
            if (str[idx] === '}')
                return [obj, idx + 1];
            // Parse key
            let keyEnd = idx;
            while (keyEnd < str.length && str[keyEnd] !== '=')
                keyEnd++;
            const key = str.slice(idx, keyEnd).trim();
            idx = keyEnd + 1;
            // Parse value
            const [val, next] = parseValue(str, idx);
            obj[key] = val;
            idx = next;
            while (str[idx] === ' ' || str[idx] === ',')
                idx++;
            if (str[idx] === '}')
                return [obj, idx + 1];
        }
        return [obj, idx];
    }
    // Helper: parse an array [item1,item2,...]
    function parseArray(str, idx) {
        const arr = [];
        while (idx < str.length) {
            while (str[idx] === ' ' || str[idx] === ',')
                idx++;
            if (str[idx] === ']')
                return [arr, idx + 1];
            const [val, next] = parseValue(str, idx);
            arr.push(val);
            idx = next;
            while (str[idx] === ' ' || str[idx] === ',')
                idx++;
            if (str[idx] === ']')
                return [arr, idx + 1];
        }
        return [arr, idx];
    }
    // Main parse: GDB/MI output is usually key="value",key2={...},key3=[...]
    try {
        let idx = 0;
        let result = {};
        // If the string starts with { or [, parse as object/array
        if (input[0] === '{') {
            [result, idx] = parseObject(input, 1);
        }
        else if (input[0] === '[') {
            [result, idx] = parseArray(input, 1);
        }
        else {
            // Otherwise, parse as key-value pairs
            while (idx < input.length) {
                while (input[idx] === ' ' || input[idx] === ',')
                    idx++;
                // Parse key
                let keyEnd = idx;
                while (keyEnd < input.length && input[keyEnd] !== '=')
                    keyEnd++;
                const key = input.slice(idx, keyEnd).trim();
                idx = keyEnd + 1;
                // Parse value
                const [val, next] = parseValue(input, idx);
                result[key] = val;
                idx = next;
                while (input[idx] === ' ' || input[idx] === ',')
                    idx++;
            }
        }
        return { json: result };
    }
    catch (err) {
        return { err, json: input };
    }
}
