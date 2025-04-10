-- CreateTable
CREATE TABLE `clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cnpj` VARCHAR(14) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `nomeFantasia` VARCHAR(100) NOT NULL,
    `cep` VARCHAR(8) NOT NULL,
    `logradouro` VARCHAR(100) NOT NULL,
    `bairro` VARCHAR(100) NOT NULL,
    `cidade` VARCHAR(100) NOT NULL,
    `uf` VARCHAR(2) NOT NULL,
    `complemento` VARCHAR(100) NULL,
    `email` VARCHAR(100) NOT NULL,
    `telefone` VARCHAR(15) NOT NULL,

    UNIQUE INDEX `clientes_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
