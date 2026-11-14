"""Ambiente do Alembic.

A conexão é lida da variável de ambiente DATABASE_URL, para que nenhuma
credencial fique versionada no git. Exemplos:

    postgresql+psycopg2://odonto:senha@localhost:5432/odonto
    mysql+pymysql://odonto:senha@localhost:3306/odonto
    sqlite:///odonto.db
"""
import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Carrega .env (opcional) sem exigir dependência extra
_env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(_env_file):
    with open(_env_file, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError(
        "Defina DATABASE_URL (copie database/.env.example para database/.env e ajuste)."
    )
config.set_main_option("sqlalchemy.url", database_url)

# Sem ORM Python: o back-end será em Java. As migrações são escritas à mão.
target_metadata = None


def run_migrations_offline() -> None:
    """Gera o SQL sem conectar no banco (alembic upgrade head --sql)."""
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Aplica as migrações conectando no banco."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
