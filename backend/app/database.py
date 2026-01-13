from sqlmodel import SQLModel, create_engine, Session, select
from .models import SystemConfig
from passlib.context import CryptContext
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sqlite_file_name = BASE_DIR / "rag_config.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        config = session.exec(select(SystemConfig)).first()
        if not config:
            print("⚙️ Seeding default config...")
            # Pre-computed bcrypt hash for password "admin"
            default_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.vQZOpm"
            default_config = SystemConfig(
                openai_api_key="CHANGE_ME_IN_ADMIN_PANEL",
                model_name="gpt-4o-mini",
                system_prompt="You are a friendly IT Helpdesk AI for Mango Inc.",
                admin_password_hash=default_hash
            )
            session.add(default_config)
            session.commit()