import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import path from 'node:path';
import fs from 'node:fs/promises';
import Listr from 'listr';
import generateName from './generateName.js';
import downloadSources from './downloadSources.js';

export default (url, savePath) => {
  const takeURL = new URL(url);

  const baseURLName = generateName(takeURL);
  const pathToSaveHTML = path.join(savePath, baseURLName);
  const filesDirName = baseURLName.replace('.html', '_files');
  const pathToFiles = path.join(savePath, filesDirName);

  new Listr([
    {
      title: 'download html',
      task: () => {
        // создание папки для файлов
        return fs.mkdir(pathToFiles)
          .then(() => axios.get(url))
          .then((response) => cheerio.load(response.data))
        // сохранение файлов
          .then(($) => downloadSources($, takeURL, pathToFiles, filesDirName))
        // сохранение разметки
          .then(($) => fs.writeFile(pathToSaveHTML, $.html()))
          .then(() => {
            console.log(pathToSaveHTML);
            return pathToSaveHTML;
          })
          .catch((e) => {
            if (e instanceof AxiosError) {
              console.error('ИНЕТ БЛЯ НЕ ГРУЗИТ ААААА');
              throw new Error(e);
            }
            console.error('НИХУЯ НЕ РАБОТАЕТ');
            throw new Error(e);
          });
      },
    },
  ]).run();
};
