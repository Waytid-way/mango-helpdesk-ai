from sqlmodel import SQLModel, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from .models import SystemConfig
from passlib.context import CryptContext
from loguru import logger
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://mango_user:mango_password@localhost:5432/mango_db")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        result = await session.exec(select(SystemConfig))
        config = result.first()
        if not config:
            logger.info("⚙️ Seeding default config...")
            # Pre-computed bcrypt hash for password "admin"
            default_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.vQZOpm"
            default_config = SystemConfig(
                openai_api_key="CHANGE_ME_IN_ADMIN_PANEL",
                model_name="gpt-4o-mini",
                system_prompt="You are a friendly IT Helpdesk AI for Mango Inc.",
                admin_password_hash=default_hash
            )
            session.add(default_config)
            await session.commit()