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
