import {
  Node,
} from 'ts-morph';

import { OPTIONS, STATE } from './globals';

export function collectError(node: Node, errorText: string) {
  const file = node.getSourceFile();
  const lineInfo = file.getLineAndColumnAtPos(node.getStart());

  if (OPTIONS.interactive) {
    const annotatedPath = `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column}`;
    console.log(`${annotatedPath} ${errorText}`)
  }

  STATE.push({
    file: file.getFilePath(),
    line: lineInfo.line,
    col: lineInfo.column,
    description: errorText,
    node,
  })
}
