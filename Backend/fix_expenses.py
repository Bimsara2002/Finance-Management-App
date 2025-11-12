import sqlite3

conn = sqlite3.connect("Finance.db")
cur = conn.cursor()

# Drop old table
cur.execute("DROP TABLE IF EXISTS expenses")

# Recreate new table with user_id column
cur.execute('''
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    month TEXT,
    category TEXT,
    amount REAL,
    date_spent TEXT,
    payment_method TEXT,
    notes TEXT
)
''')


conn.commit()
conn.close()
print("✅ expenses table recreated with user_id column.")
