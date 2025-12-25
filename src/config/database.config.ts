import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './app.config';

export const dataSourceOptions: DataSourceOptions = {
  type: config.database.type as 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  entities: ['src/modules/**/entities/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  migrationsRun: false
};

export const AppDataSource = new DataSource(dataSourceOptions);
