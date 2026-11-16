const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');

test('bad JSON, oversized bodies and missing files return client errors without stack trace logs', () => {
    const module = {exports: {}};
    const logged = [];
    vm.runInNewContext(ts.transpileModule(fs.readFileSync('server/src/httpErrors.ts','utf8'), {
        compilerOptions: {module: ts.ModuleKind.CommonJS}
    }).outputText, {module, exports: module.exports, console: {error: (...args) => logged.push(args)}});
    for (const status of [400, 404, 413]) {
        const res = {status(code) {this.code=code;return this;}, json(body) {this.body=body;}};
        module.exports.handleHttpError({status, message: 'sensitive internal details'}, {}, res, () => assert.fail());
        assert.equal(res.code, status);
        assert.equal(JSON.stringify(res.body).includes('sensitive'), false);
    }
    assert.equal(logged.length,0);
    const res={status() {return this;},json() {}};
    module.exports.handleHttpError(new Error('real server failure'),{},res,()=>assert.fail());
    assert.equal(logged.length,1);
});
