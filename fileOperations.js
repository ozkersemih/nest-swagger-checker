"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getControllerFiles = void 0;
function hasFileControllerDecorator(file) {
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
function getControllerFiles(project) {
    const allFiles = project.getSourceFiles();
    const controllerFiles = allFiles.filter((file) => {
        if (hasFileControllerDecorator(file)) {
            return file;
        }
    });
    return controllerFiles;
}
exports.getControllerFiles = getControllerFiles;
