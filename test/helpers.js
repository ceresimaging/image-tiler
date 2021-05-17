import fs from "fs-extra";
import supertest from "supertest";

import app from "../server";

export const request = supertest(app);

export const downloadSatellite = () => {
  const destPath = `${process.env.CACHE_PATH}/gdal`;
  const srcPath = `${process.cwd()}/test/fixtures/gdal`;

  fs.mkdirSync(destPath, { recursive: true });
  fs.copySync(srcPath, destPath);
};

export const uploadSatellite = () => {
  const srcPath = `${process.env.CACHE_PATH}/gdal`;
  const destPath = `${process.cwd()}/test/fixtures/gdal`;

  fs.mkdirSync(destPath, { recursive: true });
  fs.emptyDirSync(destPath);
  fs.copySync(srcPath, destPath);
};
