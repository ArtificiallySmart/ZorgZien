import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as glob from 'glob';

dotenv.config({
  path: 'apps/backend/.env',
});

const pattern = 'apps/backend/src/**/*.entity.ts';

const entityFiles = glob.sync(pattern, { nodir: true });

let importStatements = '';
let entitiesList = '';
entityFiles.forEach((file) => {
  const entities = fileExports(file);
  entitiesList += `${entities}`;
  importStatements += `import { ${entities}} from '${parseFileNames(file)}';\n`;
});

function fileExports(file: string): string {
  const fileContent = fs.readFileSync(file, 'utf8');
  const classRegex = /export class (\w+)/g;
  const matches = [...fileContent.matchAll(classRegex)];
  const classNames = matches.map((match) => match[1]);
  let classNamesString = '';
  classNames.forEach((className) => {
    classNamesString += `${className}, `;
  });
  return classNamesString;
}

function parseFileNames(file: string): string {
  return file.replace('apps/backend', '..').replace('.ts', '');
}

const typeOrmConfig = `
import { DataSource, DataSourceOptions } from 'typeorm';
${importStatements}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: '${process.env.DATABASE_URL}',
  entities: [${entitiesList}],
  synchronize: process.env.NODE_ENV !== 'production',
};

export const postgresDataSource = new DataSource(dataSourceOptions);

`;

console.log('Generating data source file...');
fs.writeFileSync('apps/backend/db/data-source.ts', typeOrmConfig);
//console.log(typeOrmConfig);
