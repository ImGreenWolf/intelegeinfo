import path from 'path';

// Editor files are flat names, never client-supplied filesystem paths.
export function editorFilePath(directory: string, name: string): string {
    if (typeof name !== 'string' || !name || name === '.' || name === '..' ||
        /[<>:"/\\|?*\x00-\x1f]/.test(name) || /[. ]$/.test(name) ||
        /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name))
        throw new Error('Invalid file name');
    return path.join(directory, name);
}
