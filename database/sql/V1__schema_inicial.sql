-- Gerado a partir da migração Alembic 0001 (PostgreSQL).
-- Pode ser usado pelo Flyway no back-end Java: src/main/resources/db/migration/V1__schema_inicial.sql



CREATE TABLE usuarios (
    id BIGSERIAL NOT NULL, 
    nome VARCHAR(120) NOT NULL, 
    email VARCHAR(160) NOT NULL, 
    senha_hash VARCHAR(255) NOT NULL, 
    cargo VARCHAR(40) DEFAULT 'RECEPCAO' NOT NULL, 
    ativo BOOLEAN DEFAULT true NOT NULL, 
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    atualizado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT uq_usuarios_email UNIQUE (email)
);

CREATE TABLE pacientes (
    id BIGSERIAL NOT NULL, 
    nome VARCHAR(150) NOT NULL, 
    cpf VARCHAR(14) NOT NULL, 
    telefone VARCHAR(20) NOT NULL, 
    email VARCHAR(160), 
    data_nascimento DATE, 
    convenio VARCHAR(60) DEFAULT 'Particular' NOT NULL, 
    observacoes TEXT, 
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    atualizado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT uq_pacientes_cpf UNIQUE (cpf)
);

CREATE INDEX ix_pacientes_nome ON pacientes (nome);

CREATE TABLE dentistas (
    id BIGSERIAL NOT NULL, 
    nome VARCHAR(150) NOT NULL, 
    cro VARCHAR(30) NOT NULL, 
    especialidade VARCHAR(80) NOT NULL, 
    telefone VARCHAR(20), 
    cor VARCHAR(7) DEFAULT '#0ea5e9' NOT NULL, 
    ativo BOOLEAN DEFAULT true NOT NULL, 
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    atualizado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT uq_dentistas_cro UNIQUE (cro)
);

CREATE TABLE procedimentos (
    id BIGSERIAL NOT NULL, 
    nome VARCHAR(120) NOT NULL, 
    duracao_min INTEGER NOT NULL, 
    valor NUMERIC(10, 2) NOT NULL, 
    ativo BOOLEAN DEFAULT true NOT NULL, 
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    atualizado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT ck_procedimentos_duracao CHECK (duracao_min >= 10), 
    CONSTRAINT ck_procedimentos_valor CHECK (valor >= 0)
);

CREATE TABLE agendamentos (
    id BIGSERIAL NOT NULL, 
    paciente_id BIGINT NOT NULL, 
    dentista_id BIGINT NOT NULL, 
    procedimento_id BIGINT NOT NULL, 
    data DATE NOT NULL, 
    hora_inicio TIME WITHOUT TIME ZONE NOT NULL, 
    hora_fim TIME WITHOUT TIME ZONE NOT NULL, 
    status VARCHAR(20) DEFAULT 'agendado' NOT NULL, 
    valor NUMERIC(10, 2), 
    observacoes TEXT, 
    criado_por BIGINT, 
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    atualizado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT ck_agendamentos_status CHECK (status IN ('agendado','confirmado','concluido','cancelado','faltou')), 
    CONSTRAINT ck_agendamentos_horario CHECK (hora_fim > hora_inicio), 
    FOREIGN KEY(paciente_id) REFERENCES pacientes (id) ON DELETE CASCADE, 
    FOREIGN KEY(dentista_id) REFERENCES dentistas (id) ON DELETE CASCADE, 
    FOREIGN KEY(procedimento_id) REFERENCES procedimentos (id) ON DELETE RESTRICT, 
    FOREIGN KEY(criado_por) REFERENCES usuarios (id) ON DELETE SET NULL
);

CREATE INDEX ix_agendamentos_data_dentista ON agendamentos (data, dentista_id);

CREATE INDEX ix_agendamentos_data_paciente ON agendamentos (data, paciente_id);

CREATE INDEX ix_agendamentos_status ON agendamentos (status);

CREATE TABLE configuracoes (
    id SERIAL NOT NULL, 
    nome_clinica VARCHAR(120) DEFAULT 'OdontoCare' NOT NULL, 
    abertura TIME WITHOUT TIME ZONE NOT NULL, 
    fechamento TIME WITHOUT TIME ZONE NOT NULL, 
    intervalo_min INTEGER DEFAULT '30' NOT NULL, 
    atende_sabado BOOLEAN DEFAULT false NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT ck_configuracoes_unica CHECK (id = 1), 
    CONSTRAINT ck_configuracoes_intervalo CHECK (intervalo_min IN (15, 30, 60))
);

INSERT INTO configuracoes (id, nome_clinica, abertura, fechamento, intervalo_min, atende_sabado) VALUES (1, 'OdontoCare', '08:00:00', '18:00:00', 30, false);

INSERT INTO procedimentos (nome, duracao_min, valor) VALUES ('Avaliação', 30, 120);

INSERT INTO procedimentos (nome, duracao_min, valor) VALUES ('Limpeza (Profilaxia)', 45, 180);

INSERT INTO procedimentos (nome, duracao_min, valor) VALUES ('Restauração', 60, 250);

INSERT INTO procedimentos (nome, duracao_min, valor) VALUES ('Canal (Endodontia)', 90, 900);

INSERT INTO procedimentos (nome, duracao_min, valor) VALUES ('Clareamento', 60, 700);

INSERT INTO procedimentos (nome, duracao_min, valor) VALUES ('Manutenção Aparelho', 30, 150);

INSERT INTO procedimentos (nome, duracao_min, valor) VALUES ('Extração', 60, 350);


