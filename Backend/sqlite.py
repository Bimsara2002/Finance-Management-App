import sqlite3
from sqlite3 import Connection, Cursor

conn = sqlite3.connect('Finance.db')
cursor = conn.cursor()

# Create Transactions table
cursor.execute('''
CREATE TABLE IF NOT EXISTS register (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
''')
cursor.execute('''
CREATE TABLE IF NOT EXISTS monthly_income (
    income_id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT,
    source TEXT,
    amount REAL,
    date_received TEXT,
    notes TEXT
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS savings (
    saving_id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT,
    amount REAL,
    category TEXT,
    method TEXT,
    date_saved TEXT,
    notes TEXT
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT,
    category TEXT,
    amount REAL,
    date_spent TEXT,
    payment_method TEXT,
    notes TEXT
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS budget (
    budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT,
    category TEXT,
    planned_amount REAL,
    actual_amount REAL,
    notes TEXT
)
''')


conn.commit()
conn.close()
def get_db_connection() -> Connection:
    return sqlite3.connect('Finance.db')
def get_db_cursor(connection: Connection) -> Cursor:
    return connection.cursor()
print("✅ Database and tables (including 'register') created successfully!")