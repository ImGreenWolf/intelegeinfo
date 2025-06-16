"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yauzl_1 = __importDefault(require("yauzl"));
const promises_1 = require("stream/promises");
async function update() {
    console.log("Starting");
    const firstValidYear = 2010;
    const currentYear = new Date().getFullYear();
    let startYear = firstValidYear;
    let lastYear = startYear;
    const outputDir = path_1.default.join(__dirname, '../../', 'server', 'data', 'subiecte');
    if (fs_1.default.existsSync(path_1.default.join(outputDir, '.data.json'))) {
        const json = JSON.parse(fs_1.default.readFileSync(path_1.default.join(outputDir, '.data.json')).toString());
        console.log(json);
        if (Date.now() - json.lastUpdate < 1000 * 60 * 10 && !json.manual)
            return { code: 1, dir: outputDir };
        startYear = json.lastYear;
        lastYear = currentYear;
    }
    // fs.rmSync(outputDir, {force: true, recursive: true})
    if (!fs_1.default.existsSync(outputDir))
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    fs_1.default.writeFile(path_1.default.join(outputDir, '.data.json'), JSON.stringify({ manual: false, startYear: firstValidYear, lastYear: lastYear, lastUpdate: Date.now() }), (err) => {
        if (err)
            console.error(err);
    });
    async function fetchSubiect(url) {
        const res = (await fetch(url));
        if (res.status != 200)
            return "fetch returned status " + res.status;
        if (res.headers.get('content-type') != "application/zip")
            return "file is not a zip. It's a(n) " + res.headers.get('content-type');
        const buffer = Buffer.from(await res.arrayBuffer());
        console.log(`Downloaded compressed file: Size ${Math.round(buffer.length / 1000)}Kb`);
        if (!hasEOCD(buffer))
            return "ZIP file is corrputed.";
        await downloadZip(buffer, outputDir);
        console.log("Finished extracting files.");
        return '';
    }
    for (let year = startYear; year <= lastYear; year++) {
        try {
            const links = [`http://subiecte${year}.edu.ro/${year}/bacalaureat/modeledesubiecte/probescrise/Bac_${year}_E_d_Informatica_modele.zip`,
                `http://subiecte${year}.edu.ro/${year}/bacalaureat/modeledesubiecte/probescrise/Bac_${year}_E_d_Informatica_${year}_modele.zip`];
            console.log("Starting download for year", year);
            for (const url of links) {
                let i = 1;
                const err = (await fetchSubiect(url));
                if (err == '')
                    break;
                else
                    console.log(`${err} Link index`, i++);
            }
            console.log("\n");
            // await extract(path.join(outputDir, fileName), {dir: path.join(outputDir, 'extracted')})
        }
        catch (err) {
            console.error(`ERROR: ${err}`);
        }
    }
    try {
        const links = [`https://subiecte.edu.ro/2025/bacalaureat/Subiecte_si_bareme/E_d_2025_ses_speciala.zip`,
            `http://subiecte2024.edu.ro/2024/bacalaureat/Subiecte_si_bareme/E_d_2024_ses_speciala.zip`,
            `http://subiecte2023.edu.ro/2023/bacalaureat/Subiecte_si_bareme/E_d_2023_ses_speciala.zip`,
            `http://subiecte2022.edu.ro/2022/bacalaureat/Subiecte_si_bareme/Ed_mai_2022_sesiune_speciala.zip`,
            `http://subiecte2021.edu.ro/2021/bacalaureat/Subiecte_si_bareme/speciala/E_d_scris_20_mai_2021`,
            `http://subiecte2020.edu.ro/2020/bacalaureat/Subiecte_si_bareme/iunie/2020/E_d_scris_25062020.zip`,
            `https://subiecte.edu.ro/2025/bacalaureat/Subiecte_si_bareme/E_d_2025_ses_iunie.zip`,
            `http://subiecte2024.edu.ro/2024/bacalaureat/Subiecte_si_bareme/E_d_04_iulie_2024.zip`,
            `http://subiecte2024.edu.ro/2024/bacalaureat/Subiecte_si_bareme/E_d_04-iul-2024_rezerva.zip`,
            `http://subiecte2023.edu.ro/2023/bacalaureat/Subiecte_si_bareme/E_d__2023_ses_iunie_iulie.zip`,
            `http://subiecte2023.edu.ro/2023/bacalaureat/Subiecte_si_bareme/E_d_2023_ses_iunie-iulie_rezerva.zip`,
            `http://subiecte2022.edu.ro/2022/bacalaureat/Subiecte_si_bareme/Ed_2022_22_iunie%20.zip`,
            `http://subiecte2022.edu.ro/2022/bacalaureat/Subiecte_si_bareme/E_d_2022_22_iunie_Rezerva.zip`,
            `http://subiecte2021.edu.ro/2021/bacalaureat/Subiecte_si_bareme/iunie-iulie/E_d_30_iunie_2021.zip`,
            `http://subiecte2020.edu.ro/2020/bacalaureat/Subiecte_si_bareme/speciala/2020/E_d_scris_08_iulie_2020.zip`
        ];
        const dateReg = /20\d*/g;
        console.log("Starting download for year");
        for (const url of links) {
            if (parseInt(url.match(dateReg)[0]) < startYear)
                await fetchSubiect(url);
        }
        console.log("\n");
        // await extract(path.join(outputDir, fileName), {dir: path.join(outputDir, 'extracted')})
    }
    catch (err) {
        console.error(`ERROR: ${err}`);
    }
    return { code: 0, dir: outputDir };
}
async function downloadZip(buffer, outputDir) {
    //     // Convert web ReadableStream to Node.js Readable
    //     const nodeStream = Readable.fromWeb(res.body as ReadableStream<any> );
    //     await finished(nodeStream.pipe(fileStream));
    yauzl_1.default.fromBuffer(buffer, { lazyEntries: true }, async (err, zipfile) => {
        if (err)
            throw "from buffer error: " + err;
        zipfile.readEntry();
        zipfile.on("entry", function (entry) {
            if (/\/$/.test(entry.fileName)) {
                // Directory file names end with '/'.
                // Note that entries for directories themselves are optional.
                // An entry's fileName implicitly requires its parent directories to exist.
                zipfile.readEntry();
            }
            else {
                // file entry
                const destination = path_1.default.resolve(outputDir, entry.fileName);
                if (fs_1.default.existsSync(destination) || !entry.fileName.toLocaleLowerCase().includes('info'))
                    zipfile.readEntry();
                else {
                    fs_1.default.mkdirSync(path_1.default.dirname(destination), { recursive: true });
                    const fileStream = fs_1.default.createWriteStream(destination, { flags: 'wx' });
                    zipfile.openReadStream(entry, async function (err, readStream) {
                        if (err)
                            throw "open read stream error: " + err;
                        readStream.on("end", function () {
                            zipfile.readEntry();
                        });
                        // readStream.pipe(somewhere);
                        await (0, promises_1.finished)(readStream.pipe(fileStream));
                    });
                }
            }
        });
    });
}
function hasEOCD(buffer) {
    // EOCD signature is 0x06054b50 (in little endian)
    const signature = Buffer.from([0x50, 0x4B, 0x05, 0x06]);
    // ZIP EOCD can be located anywhere in the last 64KB + 22 bytes
    const maxSearchLength = Math.min(buffer.length, 1024 * 64 + 22);
    const searchRegion = buffer.slice(buffer.length - maxSearchLength);
    return searchRegion.includes(signature);
}
