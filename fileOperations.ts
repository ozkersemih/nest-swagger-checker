import { Project, SourceFile } from 'ts-morph';

function hasFileControllerDecorator(file: SourceFile): boolean {
  let hasFileController = false;
  const classes = file.getClasses();
  classes.forEach((clazz) => {
    const decorators = clazz.getDecorators();
    if (decorators.some((decorator) => decorator.getName() === 'Controller')) {
      hasFileController = true;
    }
  });
  return hasFileController;
}

export function getControllerFiles(project: Project): SourceFile[] {
  const allFiles = project.getSourceFiles();
  const controllerFiles = allFiles.filter((file) => {
    if (hasFileControllerDecorator(file)) {
      return file;
    }
  });
  return controllerFiles;
}
