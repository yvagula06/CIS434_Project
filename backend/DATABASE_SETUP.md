# Database Setup Quick Guide

Step-by-step guide to set up the database for the Open Chat application.

## Prerequisites

- Virtual environment activated
- Dependencies installed (`pip install -r requirements.txt`)

## Quick Setup (3 Steps)

### 1. Install Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

This installs:
- SQLAlchemy 2.0.25
- Alembic 1.13.1

### 2. Run Migration

```powershell
alembic upgrade head
```

**Expected Output:**
```
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001_initial, Initial migration - create users, conversations, messages, responses tables
```

### 3. Verify Database Created

```powershell
ls chat_app.db
```

You should see `chat_app.db` in the backend directory!

## What Was Created?

The migration created 4 tables:

1. **users** - User accounts
2. **conversations** - Chat conversations with default_model
3. **messages** - Individual messages with optional model override
4. **responses** - Metadata about AI responses

## Database File

- **Location**: `backend/chat_app.db`
- **Type**: SQLite database
- **Size**: ~20 KB (empty)

## Testing the Setup

### Using Python

```python
# test_db.py
from database import SessionLocal
from models import Conversation, Message
from uuid import uuid4

db = SessionLocal()

# Create a conversation
conv = Conversation(
    uuid=str(uuid4()),
    default_model="openai/gpt-3.5-turbo",
    title="Test Chat"
)
db.add(conv)
db.commit()

# Create a message
msg = Message(
    uuid=str(uuid4()),
    conversation_id=conv.id,
    role="user",
    content="Hello!"
)
db.add(msg)
db.commit()

print(f"✅ Created conversation {conv.uuid}")
print(f"✅ Created message {msg.uuid}")

db.close()
```

Run it:
```powershell
python test_db.py
```

### Using SQLite CLI

```powershell
# Open database
sqlite3 chat_app.db

# List tables
.tables

# View schema
.schema conversations

# Query data
SELECT * FROM conversations;

# Exit
.exit
```

## Migration Commands

### Check Status

```powershell
# Show current version
alembic current

# Show migration history
alembic history --verbose
```

### Upgrade/Downgrade

```powershell
# Upgrade to latest
alembic upgrade head

# Downgrade one version
alembic downgrade -1

# Reset database (WARNING: deletes all data)
alembic downgrade base
alembic upgrade head
```

## Common Issues

### Issue: "No such table"

**Solution**: Run migrations
```powershell
alembic upgrade head
```

### Issue: "Database is locked"

**Solution**: Close all connections
```python
db.close()
```

Or restart the application.

### Issue: "Can't locate revision"

**Solution**: Check alembic version table
```powershell
sqlite3 chat_app.db "SELECT * FROM alembic_version"
```

If corrupted:
```powershell
alembic downgrade base
alembic upgrade head
```

## Configuration

### Change Database Location

Edit `backend/alembic.ini`:
```ini
sqlalchemy.url = sqlite:///./my_custom_db.db
```

And `backend/database.py`:
```python
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./my_custom_db.db")
```

### Use PostgreSQL

1. Install psycopg2:
   ```powershell
   pip install psycopg2-binary
   ```

2. Update `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost/chat_app
   ```

3. Run migrations:
   ```powershell
   alembic upgrade head
   ```

## Schema Overview

```
users
├── id (PK)
├── username (unique)
├── email (unique)
├── hashed_password
└── ...

conversations
├── id (PK)
├── uuid (unique, public ID)
├── default_model ← AI model for this chat
├── user_id (FK to users)
└── ...

messages
├── id (PK)
├── uuid (unique, public ID)
├── conversation_id (FK to conversations)
├── role (user/assistant)
├── content
├── model ← Optional override
└── ...

responses
├── id (PK)
├── message_id (FK to messages)
├── model_used
├── tokens_total
└── ...
```

## Next Steps

1. ✅ Database set up
2. 📝 Update API endpoints to use database
3. 🔒 Add user authentication
4. 📊 Track token usage
5. 🚀 Deploy to production

## See Also

- `DATABASE.md` - Full database documentation
- `models.py` - Model definitions
- `database.py` - Database configuration
- `alembic/versions/001_initial.py` - Initial migration
