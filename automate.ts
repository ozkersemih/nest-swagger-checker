import { Project } from 'ts-morph';
import { getControllerFiles } from './fileOperations';
import {getConfigField} from './configOperations';
import {checkEndpointInformations, checkEndpointParam, checkEndpointPayload} from './endpointOperations';
import * as path from "path";

const FILE_PATH_PATTERN = process.argv[2] ? `${path.resolve('./')}/${process.argv[2]}` : `${path.resolve('./')}/${getConfigField('scopes.file.pathPattern')}`;


const shouldCheckEndpointInformations = getConfigField('scopes.endpoint.description.check');
const shouldCheckEndpointPayload = getConfigField('scopes.endpoint.payload.check');
const shouldCheckEndpointApiParam = getConfigField('scopes.endpoint.params.check');

function main() {
  const project = new Project();
  project.addSourceFilesAtPaths(FILE_PATH_PATTERN);

  const controllerFiles = getControllerFiles(project);

  controllerFiles.forEach((file) => {
    file.getClasses().forEach((clazz) => {
      clazz.getMethods().forEach((method) => {

        if (shouldCheckEndpointInformations) {
          checkEndpointInformations(method);
        }

        if (shouldCheckEndpointPayload) {
            checkEndpointPayload(method);
        }

        if (shouldCheckEndpointApiParam){
          checkEndpointParam(method);
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
