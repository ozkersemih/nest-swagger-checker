import { Decorator } from 'ts-morph';

export class NoDescriptionLog {
  constructor(decorator: Decorator, field: symbol) {
    const lineInfo = decorator
      .getSourceFile()
      .getLineAndColumnAtPos(decorator.getStartLinePos());
    return (
      `file://${decorator.getSourceFile().getFilePath()}:${lineInfo.line}:${
        lineInfo.column
      }`,
      `The '${field.getName()}' field does not have description`
    );
  }
}
