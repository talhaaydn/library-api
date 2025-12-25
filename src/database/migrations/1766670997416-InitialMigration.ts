import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1766670997416 implements MigrationInterface {
    name = 'InitialMigration1766670997416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_51b8b26ac168fbe7d6f5653e6c\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`books\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`averageScore\` float NOT NULL DEFAULT '-1', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_daaf43033f8883943d0734e674\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_books\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`bookId\` int NOT NULL, \`score\` int NULL, \`borrowedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`returnedAt\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_books\` ADD CONSTRAINT \`FK_89eac0a6cb08bda7516c319c914\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_books\` ADD CONSTRAINT \`FK_daa39d872eb7e189a1fea05be7c\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_books\` DROP FOREIGN KEY \`FK_daa39d872eb7e189a1fea05be7c\``);
        await queryRunner.query(`ALTER TABLE \`user_books\` DROP FOREIGN KEY \`FK_89eac0a6cb08bda7516c319c914\``);
        await queryRunner.query(`DROP TABLE \`user_books\``);
        await queryRunner.query(`DROP INDEX \`IDX_daaf43033f8883943d0734e674\` ON \`books\``);
        await queryRunner.query(`DROP TABLE \`books\``);
        await queryRunner.query(`DROP INDEX \`IDX_51b8b26ac168fbe7d6f5653e6c\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
