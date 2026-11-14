"""schema inicial da clínica odontológica

Tabelas espelham o modelo usado no front-end (src/context/DataContext.jsx):
usuarios, pacientes, dentistas, procedimentos, agendamentos e configuracoes.

Revision ID: 0001
Revises:
Create Date: 2026-11-14
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

STATUS = ("agendado", "confirmado", "concluido", "cancelado", "faltou")


def _timestamps():
    return [
        sa.Column("criado_em", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("atualizado_em", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    ]


def upgrade() -> None:
    # ---------- usuários (login do sistema) ----------
    op.create_table(
        "usuarios",
        sa.Column("id", sa.BigInteger().with_variant(sa.Integer(), "sqlite"), primary_key=True, autoincrement=True),
        sa.Column("nome", sa.String(120), nullable=False),
        sa.Column("email", sa.String(160), nullable=False),
        sa.Column("senha_hash", sa.String(255), nullable=False),  # BCrypt no back-end Java
        sa.Column("cargo", sa.String(40), nullable=False, server_default="RECEPCAO"),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
        sa.UniqueConstraint("email", name="uq_usuarios_email"),
    )

    # ---------- pacientes ----------
    op.create_table(
        "pacientes",
        sa.Column("id", sa.BigInteger().with_variant(sa.Integer(), "sqlite"), primary_key=True, autoincrement=True),
        sa.Column("nome", sa.String(150), nullable=False),
        sa.Column("cpf", sa.String(14), nullable=False),
        sa.Column("telefone", sa.String(20), nullable=False),
        sa.Column("email", sa.String(160)),
        sa.Column("data_nascimento", sa.Date()),
        sa.Column("convenio", sa.String(60), nullable=False, server_default="Particular"),
        sa.Column("observacoes", sa.Text()),
        *_timestamps(),
        sa.UniqueConstraint("cpf", name="uq_pacientes_cpf"),
    )
    op.create_index("ix_pacientes_nome", "pacientes", ["nome"])

    # ---------- dentistas ----------
    op.create_table(
        "dentistas",
        sa.Column("id", sa.BigInteger().with_variant(sa.Integer(), "sqlite"), primary_key=True, autoincrement=True),
        sa.Column("nome", sa.String(150), nullable=False),
        sa.Column("cro", sa.String(30), nullable=False),
        sa.Column("especialidade", sa.String(80), nullable=False),
        sa.Column("telefone", sa.String(20)),
        sa.Column("cor", sa.String(7), nullable=False, server_default="#0ea5e9"),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
        sa.UniqueConstraint("cro", name="uq_dentistas_cro"),
    )

    # ---------- procedimentos ----------
    op.create_table(
        "procedimentos",
        sa.Column("id", sa.BigInteger().with_variant(sa.Integer(), "sqlite"), primary_key=True, autoincrement=True),
        sa.Column("nome", sa.String(120), nullable=False),
        sa.Column("duracao_min", sa.Integer(), nullable=False),
        sa.Column("valor", sa.Numeric(10, 2), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
        sa.CheckConstraint("duracao_min >= 10", name="ck_procedimentos_duracao"),
        sa.CheckConstraint("valor >= 0", name="ck_procedimentos_valor"),
    )

    # ---------- agendamentos ----------
    op.create_table(
        "agendamentos",
        sa.Column("id", sa.BigInteger().with_variant(sa.Integer(), "sqlite"), primary_key=True, autoincrement=True),
        sa.Column("paciente_id", sa.BigInteger().with_variant(sa.Integer(), "sqlite"),
                  sa.ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("dentista_id", sa.BigInteger().with_variant(sa.Integer(), "sqlite"),
                  sa.ForeignKey("dentistas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("procedimento_id", sa.BigInteger().with_variant(sa.Integer(), "sqlite"),
                  sa.ForeignKey("procedimentos.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("data", sa.Date(), nullable=False),
        sa.Column("hora_inicio", sa.Time(), nullable=False),
        sa.Column("hora_fim", sa.Time(), nullable=False),  # início + duração do procedimento
        sa.Column("status", sa.String(20), nullable=False, server_default="agendado"),
        sa.Column("valor", sa.Numeric(10, 2)),  # valor cobrado (cópia do procedimento na data)
        sa.Column("observacoes", sa.Text()),
        sa.Column("criado_por", sa.BigInteger().with_variant(sa.Integer(), "sqlite"),
                  sa.ForeignKey("usuarios.id", ondelete="SET NULL")),
        *_timestamps(),
        sa.CheckConstraint("status IN ('" + "','".join(STATUS) + "')", name="ck_agendamentos_status"),
        sa.CheckConstraint("hora_fim > hora_inicio", name="ck_agendamentos_horario"),
    )
    op.create_index("ix_agendamentos_data_dentista", "agendamentos", ["data", "dentista_id"])
    op.create_index("ix_agendamentos_data_paciente", "agendamentos", ["data", "paciente_id"])
    op.create_index("ix_agendamentos_status", "agendamentos", ["status"])

    # ---------- configurações da clínica (linha única) ----------
    op.create_table(
        "configuracoes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome_clinica", sa.String(120), nullable=False, server_default="OdontoCare"),
        sa.Column("abertura", sa.Time(), nullable=False),
        sa.Column("fechamento", sa.Time(), nullable=False),
        sa.Column("intervalo_min", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("atende_sabado", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.CheckConstraint("id = 1", name="ck_configuracoes_unica"),
        sa.CheckConstraint("intervalo_min IN (15, 30, 60)", name="ck_configuracoes_intervalo"),
    )

    # ---------- dados iniciais ----------
    from datetime import time

    configuracoes = sa.table(
        "configuracoes",
        sa.column("id", sa.Integer), sa.column("nome_clinica", sa.String),
        sa.column("abertura", sa.Time), sa.column("fechamento", sa.Time),
        sa.column("intervalo_min", sa.Integer), sa.column("atende_sabado", sa.Boolean),
    )
    op.bulk_insert(configuracoes, [{
        "id": 1, "nome_clinica": "OdontoCare", "abertura": time(8, 0), "fechamento": time(18, 0),
        "intervalo_min": 30, "atende_sabado": False,
    }])

    procedimentos = sa.table(
        "procedimentos",
        sa.column("nome", sa.String), sa.column("duracao_min", sa.Integer), sa.column("valor", sa.Numeric),
    )
    op.bulk_insert(procedimentos, [
        {"nome": "Avaliação", "duracao_min": 30, "valor": 120},
        {"nome": "Limpeza (Profilaxia)", "duracao_min": 45, "valor": 180},
        {"nome": "Restauração", "duracao_min": 60, "valor": 250},
        {"nome": "Canal (Endodontia)", "duracao_min": 90, "valor": 900},
        {"nome": "Clareamento", "duracao_min": 60, "valor": 700},
        {"nome": "Manutenção Aparelho", "duracao_min": 30, "valor": 150},
        {"nome": "Extração", "duracao_min": 60, "valor": 350},
    ])
    # O usuário administrador NÃO é criado aqui: a senha precisa ser gerada
    # (BCrypt) pelo back-end Java ou por um script fora do git.


def downgrade() -> None:
    op.drop_table("configuracoes")
    op.drop_index("ix_agendamentos_status", table_name="agendamentos")
    op.drop_index("ix_agendamentos_data_paciente", table_name="agendamentos")
    op.drop_index("ix_agendamentos_data_dentista", table_name="agendamentos")
    op.drop_table("agendamentos")
    op.drop_table("procedimentos")
    op.drop_table("dentistas")
    op.drop_index("ix_pacientes_nome", table_name="pacientes")
    op.drop_table("pacientes")
    op.drop_table("usuarios")
