import sqlite3

conn = sqlite3.connect("Finance.db")
cur = conn.cursor()

# Drop old table
cur.execute("DROP TABLE IF EXISTS budget")

# Recreate new table with user_id column
cur.execute('''
CREATE TABLE IF NOT EXISTS budget (
    budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id INTEGER,
    month TEXT,
    category TEXT,
    planned_amount REAL,
    actual_amount REAL,
    notes TEXT
)
''')


conn.commit()
conn.close()
print("✅ budget table recreated with user_id column.")
