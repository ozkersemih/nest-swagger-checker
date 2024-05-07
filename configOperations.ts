import * as fs from 'fs';
import path from 'path';
import { readFileSync } from 'fs';
import * as R from 'ramda';

const externalConfigPath = `${path.resolve('./')}/.swautomaterc`;
const defaultConfigPath = `${__dirname}/config.json`;
const externalConfig = fs.existsSync(externalConfigPath) ? JSON.parse(readFileSync(externalConfigPath, 'utf-8')) : {};
const internalConfig = JSON.parse(readFileSync(defaultConfigPath, 'utf-8'));
const CONFIG = R.mergeDeepRight(internalConfig, externalConfig);

export function getConfigField(configPath: string) {
  return getObjectOfJson(CONFIG, configPath, '') ;
}

function getObjectOfJson (jsonObj, path:string, defaultValue: any) {
  return R.path(path.split('.'), jsonObj) || defaultValue;
}
