"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_notifier_1 = __importDefault(require("node-notifier"));
// String
;
// // Object
// notifier.notify({
//   title: 'My notification',
//   message: 'Hello, there!'
// });
function checkURL(name, url) {
    fetch(url).then(data => {
        const date = data.headers.get('Last-Modified');
        if (!date)
            throw 'invalid date ' + date;
        const delta = (Date.now() - new Date(date).getTime());
        const days = delta / 86400000;
        console.log(name + ' days since update:', days.toFixed(2));
        if (days < 7) {
            node_notifier_1.default.notify(`${name} WAS UPDATED ${(delta / 60000).toFixed(1)} MINUTES AGO`);
            console.log(`${name} WAS UPDATED ${(delta / 60000).toFixed(1)} MINUTES AGO`);
        }
    });
}
setInterval(() => {
    console.clear();
    checkURL('pagina principala', 'https://subiecte.edu.ro/2025/evaluarenationala/index.html');
    checkURL('subiecte', 'https://subiecte.edu.ro/2025/evaluarenationala/Subiecte_si_bareme/');
}, 15000);
