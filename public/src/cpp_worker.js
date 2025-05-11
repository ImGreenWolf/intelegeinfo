ace.define("ace/mode/c_cpp_worker", ["require", "exports", "module", "ace/lib/oop", "ace/worker/mirror"], function (require, exports, module) {
    const oop = require("ace/lib/oop");
    const Mirror = require("ace/worker/mirror").Mirror;

    const CppWorker = function (sender) {
        Mirror.call(this, sender);
        this.setTimeout(500);
    };

    oop.inherits(CppWorker, Mirror);

    CppWorker.prototype.onUpdate = function () {
        const value = this.doc.getValue();
        const errors = [];

        // Very basic example: flag lines with TODO
        const lines = value.split("\n");
        lines.forEach((line, index) => {
            if (line.includes("TODO")) {
                errors.push({
                    row: index,
                    column: 0,
                    text: "TODO found",
                    type: "warning",
                });
            }
        });

        this.sender.emit("annotate", errors);
    };

    exports.CppWorker = CppWorker;
});
