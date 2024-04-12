import { Project } from 'ts-morph';
import { getControllerFiles } from './fileOperations';
import { checkMethodParams } from './methodOperations';
import { getConfig } from './configOperations';
import { checkEndpointInformations } from './endpointOperations';
import * as path from "path";

const config = getConfig();
const FILE_PATH_PATTERN = process.argv[2] ? `${path.resolve('./')}/${process.argv[2]}` : `${path.resolve('./')}/${config.scopes.file.pathPattern}`;


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
