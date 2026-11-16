const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

test('editor cleanup tolerates an empty window and repeated or reentrant cleanup', () => {
    const file = ts.createSourceFile('windowManager.ts', fs.readFileSync('public/src/windowManager.ts', 'utf8'), ts.ScriptTarget.Latest, true);
    const editorClass = file.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'EditorWindow');
    const method = editorClass.members.find(node => node.name?.getText(file) === 'destroyEditor');
    const code = ts.transpileModule(`class EditorWindow { ${method.getText(file)} }; module.exports = EditorWindow;`, {
        compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS}
    }).outputText;
    const module = {exports: {}};
    vm.runInNewContext(code, {module});
    const window = new module.exports();
    assert.doesNotThrow(() => window.destroyEditor());
    let destroyed = 0, removed = 0;
    window.editor = {destroy() {destroyed++; window.destroyEditor();}, container: {remove() {removed++;}}};
    window.destroyEditor();
    window.destroyEditor();
    assert.equal(destroyed, 1);
    assert.equal(removed, 1);
    assert.equal(window.editor, undefined);
});
