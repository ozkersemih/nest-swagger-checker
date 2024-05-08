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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigField = void 0;
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const R = __importStar(require("ramda"));
const externalConfigPath = `${path_1.default.resolve('./')}/.swautomaterc`;
const defaultConfigPath = `${__dirname}/config.json`;
const externalConfig = fs.existsSync(externalConfigPath) ? JSON.parse((0, fs_1.readFileSync)(externalConfigPath, 'utf-8')) : {};
const internalConfig = JSON.parse((0, fs_1.readFileSync)(defaultConfigPath, 'utf-8'));
const CONFIG = R.mergeDeepRight(internalConfig, externalConfig);
function getConfigField(configPath) {
    return getObjectOfJson(CONFIG, configPath, '');
}
exports.getConfigField = getConfigField;
function getObjectOfJson(jsonObj, path, defaultValue) {
    return R.path(path.split('.'), jsonObj) || defaultValue;
}
