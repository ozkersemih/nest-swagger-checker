"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectError = void 0;
const globals_1 = require("./globals");
function collectError(node, errorText) {
    const file = node.getSourceFile();
    const lineInfo = file.getLineAndColumnAtPos(node.getStart());
    if (globals_1.OPTIONS.interactive) {
        const annotatedPath = `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column}`;
        console.log(`${annotatedPath} ${errorText}`);
    }
    globals_1.STATE.push({
        file: file.getFilePath(),
        line: lineInfo.line,
        col: lineInfo.column,
        description: errorText,
        node,
    });
}
exports.collectError = collectError;
