import { MigrationInterface, QueryRunner } from 'typeorm';

export class Test1706648178986 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE token_blacklist_entity`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE token_blacklist_entity (
      token VARCHAR(255) NOT NULL,
      expires TIMESTAMP NOT NULL
    )`);
  }
}
