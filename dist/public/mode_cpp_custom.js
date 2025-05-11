ace.define("ace/mode/c_cpp_custom", [
    "require", "exports", "module",
    "ace/lib/oop", "ace/mode/c_cpp",
    "ace/mode/c_cpp_worker"
], function (require, exports, module) {
    const oop = require("ace/lib/oop");
    const BaseMode = require("ace/mode/c_cpp").Mode;

    const CustomMode = function () {
        BaseMode.call(this);
    };
    oop.inherits(CustomMode, BaseMode);

    (function () {
        this.createWorker = function (session) {
            const WorkerClient = require("ace/worker/worker_client").WorkerClient;
            const worker = new WorkerClient(["ace"], "ace/mode/c_cpp_worker", "CppWorker");
            worker.attachToDocument(session.getDocument());
            worker.on("annotate", function (annotations) {
                session.setAnnotations(annotations);
            });
            return worker;
        };
    }).call(CustomMode.prototype);

    exports.Mode = CustomMode;
});
