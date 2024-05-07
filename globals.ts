type Error = {
  file: string;
  line: number;
  col: number;
  description: string;
  node: Node;
}

export const STATE: Error[] = [];

export const OPTIONS = {
  interactive: false,
  fileIncludePattern:
};
