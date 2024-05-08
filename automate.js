"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const ts_morph_1 = require("ts-morph");
const fileOperations_1 = require("./fileOperations");
const configOperations_1 = require("./configOperations");
const endpointOperations_1 = require("./endpointOperations");
const path = __importStar(require("path"));
const globals_1 = require("./globals");
const shouldCheckEndpointInformations = (0, configOperations_1.getConfigField)('scopes.endpoint.description.check');
const shouldCheckEndpointPayload = (0, configOperations_1.getConfigField)('scopes.endpoint.payload.check');
const shouldCheckEndpointApiParam = (0, configOperations_1.getConfigField)('scopes.endpoint.params.check');
function main(opts) {
    globals_1.OPTIONS.interactive = opts.interactive;
    if (!opts.fileIncludePattern) {
        globals_1.OPTIONS.fileIncludePattern = `${path.resolve('./')}/${(0, configOperations_1.getConfigField)('scopes.file.pathPattern')}`;
    }
    const project = new ts_morph_1.Project();
    project.addSourceFilesAtPaths(opts.fileIncludePattern ?? globals_1.OPTIONS.fileIncludePattern);
    const controllerFiles = (0, fileOperations_1.getControllerFiles)(project);
    console.log('OPTIONS.fileIncludePattern', globals_1.OPTIONS.fileIncludePattern);
    controllerFiles.forEach((file) => {
        file.getClasses().forEach((clazz) => {
            clazz.getMethods().forEach((method) => {
                if (shouldCheckEndpointInformations) {
                    (0, endpointOperations_1.checkEndpointInformations)(method);
                }
                if (shouldCheckEndpointPayload) {
                    (0, endpointOperations_1.checkEndpointPayload)(method);
                }
                if (shouldCheckEndpointApiParam) {
                    (0, endpointOperations_1.checkEndpointParam)(method);
                }
                // endpointHasBasicApiResponse();
                // does decorators include ApiResponse for at least
                // OK and Internal server error?
                // do ApiResponse decorators has correct title and desc
                // with given regex?
            });
        });
    });
    return globals_1.STATE;
}
exports.main = main;
