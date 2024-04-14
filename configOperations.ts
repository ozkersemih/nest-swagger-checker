import * as fs from 'fs';
import path from 'path';
import { readFileSync } from 'fs';

export function getConfig() {
  const externalConfigPath = `${path.resolve('./')}/.swautomaterc`;
  const defaultConfigPath = `${__dirname}/config.json`;
  if (fs.existsSync(externalConfigPath)) {
    return JSON.parse(readFileSync(externalConfigPath, 'utf-8'));
  }
  return JSON.parse(readFileSync(defaultConfigPath, 'utf-8'));
}

export function getConfigField(configPath:string) {
  const externalConfigPath = `${path.resolve('./')}/.swautomaterc`;
  const defaultConfigPath = `${__dirname}/config.json`;
  if (fs.existsSync(externalConfigPath)) {
    return getObjectOfJson(JSON.parse(readFileSync(externalConfigPath, 'utf-8')),configPath,undefined) ||
        getObjectOfJson(JSON.parse(readFileSync(defaultConfigPath, 'utf-8')),configPath,'');
  }
  return getObjectOfJson(JSON.parse(readFileSync(defaultConfigPath, 'utf-8')),configPath,'') ;
}

function getObjectOfJson (jsonObj, path:string, defaultValue: any) {
  path = path || '';
  jsonObj = jsonObj || {};
  defaultValue = typeof defaultValue === 'undefined' ? '' : defaultValue;
  var parts = path.split('.');
  if (parts.length > 1 && typeof jsonObj[parts[0]] === 'object') {
    return getObjectOfJson(jsonObj[parts[0]], parts.splice(1).join('.'), defaultValue);
  } else {
    return jsonObj[parts[0]] || defaultValue;
  }
}
