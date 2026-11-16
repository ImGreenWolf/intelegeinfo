const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const moduleRef = {exports: {}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('server/src/editorOperations.ts', 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS}
}).outputText, {module: moduleRef, exports: moduleRef.exports});
const {editOffset, rebaseOperations, applyOperations} = moduleRef.exports;

test('edit coordinates handle empty text, newlines and invalid rows', () => {
    assert.equal(editOffset('', 0, 0), 0);
    assert.equal(editOffset('one\ntwo', 1, 2), 6);
    assert.throws(() => editOffset('a', 0, 2));
    assert.throws(() => editOffset('a', -1, 0));
});

test('concurrent inserts preserve both changes without modifying committed history', () => {
    const committed = {type: 'insert', start: 1, text: 'X'};
    const pending = [{type: 'insert', start: 2, text: 'Y'}];
    const transformed = rebaseOperations(pending, committed);
    assert.equal(applyOperations('aXbc', transformed), 'aXbYc');
    assert.equal(committed.start, 1);
    assert.equal(pending[0].start, 2);
});

test('deletion preserves concurrent inserted text and overlapping deletes converge', () => {
    const remove = [{type: 'remove', start: 0, end: 3}];
    const committed = {type: 'insert', start: 1, text: 'X'};
    assert.equal(applyOperations('aXbc', rebaseOperations(remove, committed)), 'X');
    const overlap = rebaseOperations([{type: 'remove', start: 1, end: 4}], {type: 'remove', start: 0, end: 2});
    assert.equal(applyOperations('cde', overlap), 'e');
});
