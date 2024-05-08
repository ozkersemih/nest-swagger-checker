import { Project } from 'ts-morph';
import { getControllerFiles } from './fileOperations';
import {getConfigField} from './configOperations';
import {checkEndpointInformations, checkEndpointParam, checkEndpointPayload} from './endpointOperations';
import * as path from "path";
import { OPTIONS, STATE } from './globals';

const shouldCheckEndpointInformations = getConfigField('scopes.endpoint.description.check');
const shouldCheckEndpointPayload = getConfigField('scopes.endpoint.payload.check');
const shouldCheckEndpointApiParam = getConfigField('scopes.endpoint.params.check');

export function main(opts: typeof OPTIONS) {
  OPTIONS.interactive = opts.interactive;
  if (!opts.fileIncludePattern) {
    OPTIONS.fileIncludePattern = `${path.resolve('./')}/${getConfigField('scopes.file.pathPattern')}`
  }

  const project = new Project();
  project.addSourceFilesAtPaths(opts.fileIncludePattern ?? OPTIONS.fileIncludePattern);

  const controllerFiles = getControllerFiles(project);
  console.log('OPTIONS.fileIncludePattern',OPTIONS.fileIncludePattern);
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

  return STATE;
}
