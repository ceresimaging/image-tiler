import fs, { existsSync } from 'fs-extra';
import path from 'path';
import { v4 as uuid } from 'uuid';

export const fixture = fs.readFileSync;

export const createFile = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.closeSync(fs.openSync(filePath, 'w'));
};

export const createImagery = (imagery) => {
  const path = `${process.env.CACHE_PATH}/imagery/${process.env.IMAGERY_REGION}/${process.env.IMAGERY_BUCKET}/${imagery}.tif`;
  createFile(path);
  return path;
};

export const createCustom = (custom) => {
  const path = `${process.env.CACHE_PATH}/custom/${process.env.CUSTOM_LAYERS_REGION}/${process.env.CUSTOM_LAYERS_BUCKET}/${custom}`;
  createFile(path);
  return path;
};

export const createFiles = (count = 10, age = 0, factory = createImagery) => {
  const time = Date.now() - age * 86400000;

  for (let i = 0; i < count; i++) {
    const path = factory(uuid());
    fs.utimesSync(path, new Date(time), new Date(time));
  }
};

export const downloadImagery = (imagery) => {
  const dirPath = `${process.env.CACHE_PATH}/imagery/${process.env.IMAGERY_REGION}/${process.env.IMAGERY_BUCKET}`;
  const destPath = `${dirPath}/${imagery}.tif`;
  const srcPath = `${__dirname}/fixtures/imagery/${imagery}.tif`;

  fs.mkdirSync(dirPath, { recursive: true });
  fs.copySync(srcPath, destPath);
};

export const downloadCustom = (custom) => {
  const dirPath = `${process.env.CACHE_PATH}/custom/${process.env.CUSTOM_LAYERS_REGION}/${process.env.CUSTOM_LAYERS_BUCKET}`;
  const destPath = `${dirPath}/${custom}`;
  const srcPath = `${__dirname}/fixtures/custom/${custom}`;

  fs.mkdirSync(dirPath, { recursive: true });
  fs.copySync(srcPath, destPath);
};

export const downloadSatellite = () => {
  const destPath = `${process.env.CACHE_PATH}/gdal`;
  const srcPath = `${__dirname}/fixtures/gdal`;

  fs.mkdirSync(destPath, { recursive: true });
  fs.copySync(srcPath, destPath);
};

export const uploadSatellite = () => {
  const srcPath = `${process.env.CACHE_PATH}/gdal`;
  const destPath = `${__dirname}/fixtures/gdal`;

  fs.mkdirSync(destPath, { recursive: true });
  fs.emptyDirSync(destPath);
  fs.copySync(srcPath, destPath);
};

export const wipeCache = () => {
  fs.emptyDirSync(`${process.env.CACHE_PATH}/imagery`, { recursive: true });
  fs.emptyDirSync(`${process.env.CACHE_PATH}/custom`, { recursive: true });
};
