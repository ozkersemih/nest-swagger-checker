import { Project } from 'ts-morph';
import { getControllerFiles } from './fileOperations';
import {
  getPropertiesOfDecorator,
  methodHasInformationDecorator,
} from './decoratorOperations';
import { Node } from 'ts-morph';

import { checkMethodParams } from './methodOperations';
import { getConfig } from './configOperations';
import { checkEndpointInformations } from './endpointOperations';

const config = getConfig();

// const FILE_PATH_PATTERN = 'src/**/*.ts';
const FILE_PATH_PATTERN = config.scopes.file.pathPattern;

const shouldCheckEndpointInformations =
  config.scopes.endpoint.description.check;
const checkEndpointInformationsEmpty =
  config.scopes.endpoint.description.checkEmpty;
const endpointInformationPattern = config.scopes.endpoint.description.pattern;

const shouldCheckEndpointPayload = config.scopes.endpoint.payload.check;

function main() {
  const project = new Project();
  project.addSourceFilesAtPaths(FILE_PATH_PATTERN);

  const controllerFiles = getControllerFiles(project);

  controllerFiles.forEach((file) => {
    file.getClasses().forEach((clazz) => {
      clazz.getMethods().forEach((method) => {
        if (method.getName() !== 'create') return;

        if (shouldCheckEndpointPayload) {
          checkMethodParams(method);
        }

        if (shouldCheckEndpointInformations) {
          checkEndpointInformations(method);
        }

        // endpointHasBasicApiResponse();
        // does decorators include ApiResponse for at least
        // OK and Internal server error?

        // do ApiResponse decorators has correct title and desc
        // with given regex?
      });
    });
  });
}

main();
