# Zorgplanner

This is an Angular project with a backend written in TypeScript. It uses Nx for monorepo management and Jest for testing.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js version 20.10.0
- npm
- Angular CLI

### Installing

1. Clone the repository:

```
git clone https://github.com/ArtificiallySmart/zorgplanner.git
```

2. Navigate into the project directory:

```
cd zorgplanner
```

3. Install the dependencies:

```
npm install
```

4. Create a .env file in apps/backend, use .example.env as a template

5. Run the command `npm run build-datasource` to generate a data-source.ts, containing the typeORM DataSourceOptions.

6. Get your Postgres database running.

You now have two options:

7. Option 1:

- in the generated data-source.ts, set "synchronize" to `true`. Continue with step 9

8. Option 2:

- run the command `npm run compile-datasource` to compile the data-source.ts and all entity files to .js files in the dist folder.

- run the command `npm run generate-migrations -- <location for migration files>` to generate migrations for your database.

- Run these migrations to add the correct schemas to your database.

9. In one terminal run `nx serve backend`, and in the other terminal run `nx serve zorgplanner`

10. Go to localhost:4200 to see the Zorgplanner running.
