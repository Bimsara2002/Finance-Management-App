import sqlite3

conn = sqlite3.connect("Finance.db")
cur = conn.cursor()

# Drop old table
cur.execute("DROP TABLE IF EXISTS savings")

# Recreate new table with user_id column
cur.execute('''
CREATE TABLE IF NOT EXISTS savings (
    saving_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    month TEXT,
    amount REAL,
    category TEXT,
    method TEXT,
    date_saved TEXT,
    notes TEXT
)
''')


conn.commit()
conn.close()
print("✅ savings table recreated with user_id column.")
