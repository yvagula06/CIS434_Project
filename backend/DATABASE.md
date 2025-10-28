# Database Documentation

This document describes the database schema, models, and migration setup for the Open Chat application.

## Overview

The application uses **SQLAlchemy** as the ORM and **Alembic** for database migrations. By default, it uses **SQLite** for development, but can be configured to use PostgreSQL, MySQL, or other databases in production.

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (PK)         │
│ username        │◄──────┐
│ email           │       │
│ hashed_password │       │
│ full_name       │       │
│ is_active       │       │
│ created_at      │       │
│ updated_at      │       │
└─────────────────┘       │
                          │
                          │ user_id (FK)
                          │
┌─────────────────────────┼────────────┐
│     Conversations       │            │
├─────────────────────────┘            │
│ id (PK)                              │
│ uuid (unique)                        │
│ title                                │
│ default_model  ← Default AI model    │
│ user_id (FK) ────────────────────────┘
│ created_at
│ updated_at
└────────────┬──────────────┘
             │
             │ conversation_id (FK)
             │
┌────────────┼──────────────┐
│     Messages              │
├───────────────────────────┤
│ id (PK)                   │
│ uuid (unique)             │
│ conversation_id (FK) ─────┘
│ role (user/assistant)
│ content
│ model ← Optional override
│ created_at
└────────────┬──────────────┘
             │
             │ message_id (FK, unique)
             │
┌────────────┼──────────────┐
│     Responses             │
├───────────────────────────┤
│ id (PK)                   │
│ message_id (FK) ──────────┘
│ model_used
│ tokens_prompt
│ tokens_completion
│ tokens_total
│ completion_time_ms
│ created_at
└───────────────────────────┘
```

## Models

### User

Represents application users (for future authentication).

```python
class User(Base):
    id: int                    # Primary key
    username: str              # Unique username
    email: str                 # Unique email
    hashed_password: str       # Hashed password
    full_name: str | None      # Optional full name
    is_active: bool            # Active status
    created_at: datetime       # Creation timestamp
    updated_at: datetime       # Last update timestamp
    
    # Relationships
    conversations: List[Conversation]
```

### Conversation

Represents a chat conversation with a default model.

```python
class Conversation(Base):
    id: int                    # Primary key
    uuid: str                  # Public UUID identifier
    title: str | None          # Optional conversation title
    default_model: str         # Default AI model (e.g., "openai/gpt-3.5-turbo")
    user_id: int | None        # Foreign key to users (nullable for anonymous)
    created_at: datetime       # Creation timestamp
    updated_at: datetime       # Last update timestamp
    
    # Relationships
    user: User
    messages: List[Message]
```

**Key Features:**
- `default_model`: Sets the default AI model for the conversation
- Can be updated via PATCH endpoint
- Messages can override this model individually

### Message

Represents a single message in a conversation (user or assistant).

```python
class Message(Base):
    id: int                    # Primary key
    uuid: str                  # Public UUID identifier
    conversation_id: int       # Foreign key to conversations
    role: str                  # "user" or "assistant"
    content: str               # Message text
    model: str | None          # Optional model override
    created_at: datetime       # Creation timestamp
    
    # Relationships
    conversation: Conversation
    response: Response | None   # Only for assistant messages
```

**Key Features:**
- `model`: Optional override of conversation's default model
- User messages can specify which model to use for the response
- Assistant messages store which model was actually used

### Response

Stores metadata about AI-generated responses.

```python
class Response(Base):
    id: int                       # Primary key
    message_id: int               # Foreign key to messages (unique)
    model_used: str               # Actual model used
    tokens_prompt: int | None     # Prompt tokens
    tokens_completion: int | None # Completion tokens
    tokens_total: int | None      # Total tokens
    completion_time_ms: int | None # Generation time in ms
    created_at: datetime          # Creation timestamp
    
    # Relationships
    message: Message
```

**Key Features:**
- Tracks actual model used (in case of fallback/routing)
- Token usage for billing/analytics
- Performance metrics (completion time)

## Database Configuration

### Connection String

Set in `.env` file:

```env
# SQLite (default for development)
DATABASE_URL=sqlite:///./chat_app.db

# PostgreSQL (production)
# DATABASE_URL=postgresql://user:password@localhost/chat_app

# MySQL
# DATABASE_URL=mysql://user:password@localhost/chat_app
```

### Database File

- **Location**: `backend/chat_app.db`
- **Format**: SQLite database
- **Git**: Add to `.gitignore` (already configured)

## Alembic Migrations

### Initial Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run initial migration**:
   ```bash
   cd backend
   alembic upgrade head
   ```

This creates all tables in the database.

### Migration Commands

```bash
# Check current migration version
alembic current

# View migration history
alembic history

# Upgrade to latest
alembic upgrade head

# Downgrade one version
alembic downgrade -1

# Downgrade to specific version
alembic downgrade 001_initial

# Create new migration (after model changes)
alembic revision --autogenerate -m "description"
```

### Migration Files

Located in `backend/alembic/versions/`:

- `001_initial.py` - Creates users, conversations, messages, responses tables

### Creating New Migrations

When you modify models:

```bash
# 1. Edit models.py
# 2. Generate migration
alembic revision --autogenerate -m "add new field"

# 3. Review the generated migration file in alembic/versions/

# 4. Apply migration
alembic upgrade head
```

## Usage in Code

### Getting Database Session

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

@app.get("/items")
def get_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return items
```

### Creating Records

```python
from models import Conversation, Message
from uuid import uuid4

# Create conversation
conversation = Conversation(
    uuid=str(uuid4()),
    default_model="openai/gpt-3.5-turbo",
    title="My Chat"
)
db.add(conversation)
db.commit()
db.refresh(conversation)

# Create message
message = Message(
    uuid=str(uuid4()),
    conversation_id=conversation.id,
    role="user",
    content="Hello!",
    model="openai/gpt-4"  # Optional override
)
db.add(message)
db.commit()
```

### Querying Records

```python
# Get conversation by UUID
conversation = db.query(Conversation).filter(
    Conversation.uuid == conv_uuid
).first()

# Get all messages in conversation
messages = db.query(Message).filter(
    Message.conversation_id == conversation.id
).order_by(Message.created_at).all()

# Get conversation with messages (using relationship)
conversation = db.query(Conversation).filter(
    Conversation.uuid == conv_uuid
).first()
messages = conversation.messages  # Uses relationship
```

### Updating Records

```python
# Update conversation model
conversation = db.query(Conversation).filter(
    Conversation.uuid == conv_uuid
).first()
conversation.default_model = "openai/gpt-4"
db.commit()
```

### Deleting Records

```python
# Delete conversation (cascades to messages and responses)
conversation = db.query(Conversation).filter(
    Conversation.uuid == conv_uuid
).first()
db.delete(conversation)
db.commit()
```

## Model Features

### UUIDs for Public Identifiers

- Integer `id` for internal database references
- String `uuid` for public API exposure
- UUIDs prevent ID enumeration attacks

```python
# Create with UUID
import uuid
conversation = Conversation(
    uuid=str(uuid.uuid4()),
    ...
)
```

### Timestamps

All models have automatic timestamps:

```python
created_at = Column(DateTime, default=datetime.utcnow)
updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Cascading Deletes

Deleting a conversation automatically deletes:
- All associated messages
- All associated responses

```python
conversations = relationship("Conversation", cascade="all, delete-orphan")
```

### Nullable User (Anonymous Access)

Conversations can exist without a user:

```python
user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
```

## Indexes

For optimal query performance:

```python
# Users
ix_users_username (unique)
ix_users_email (unique)

# Conversations
ix_conversations_uuid (unique)

# Messages
ix_messages_uuid (unique)
```

## Database Initialization

### Option 1: Using Alembic (Recommended)

```bash
alembic upgrade head
```

### Option 2: Direct Creation (Development/Testing)

```python
from database import init_db

init_db()  # Creates all tables
```

## Testing with Database

### In-Memory SQLite

For tests, use in-memory database:

```python
# conftest.py
from sqlalchemy import create_engine
from database import Base

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    # ... setup session
    yield session
    # ... cleanup
```

### Test Data

```python
@pytest.fixture
def sample_conversation(db):
    conv = Conversation(
        uuid=str(uuid4()),
        default_model="openai/gpt-3.5-turbo"
    )
    db.add(conv)
    db.commit()
    return conv
```

## Migration from In-Memory to Database

### Before (In-Memory)

```python
conversations = {}
messages_store = {}
```

### After (Database)

```python
from sqlalchemy.orm import Session
from database import get_db
from models import Conversation, Message

@app.post("/conversations")
def create_conversation(db: Session = Depends(get_db)):
    conversation = Conversation(
        uuid=str(uuid4()),
        default_model="openai/gpt-3.5-turbo"
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation
```

## Production Considerations

### PostgreSQL Setup

```bash
# Install psycopg2
pip install psycopg2-binary

# Update .env
DATABASE_URL=postgresql://user:password@localhost/chat_app

# Run migrations
alembic upgrade head
```

### Connection Pooling

```python
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True
)
```

### Read Replicas

For high-traffic applications:

```python
# Write to primary
write_engine = create_engine(PRIMARY_DB_URL)

# Read from replica
read_engine = create_engine(REPLICA_DB_URL)
```

## Backup and Recovery

### SQLite Backup

```bash
# Backup
cp chat_app.db chat_app.db.backup

# Restore
cp chat_app.db.backup chat_app.db
```

### PostgreSQL Backup

```bash
# Backup
pg_dump chat_app > backup.sql

# Restore
psql chat_app < backup.sql
```

## Troubleshooting

### Migration Conflicts

```bash
# Reset to clean state
alembic downgrade base
alembic upgrade head
```

### Database Locked (SQLite)

Close all connections:
```python
db.close()
```

### Foreign Key Violations

Ensure cascade deletes are configured:
```python
relationship("Model", cascade="all, delete-orphan")
```

## See Also

- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [FastAPI Database Guide](https://fastapi.tiangolo.com/tutorial/sql-databases/)
