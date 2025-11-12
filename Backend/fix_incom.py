import sqlite3

conn = sqlite3.connect("Finance.db")
cur = conn.cursor()

# Drop old table
cur.execute("DROP TABLE IF EXISTS monthly_income")

# Recreate new table with user_id column
cur.execute("""
CREATE TABLE IF NOT EXISTS monthly_income (
    income_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    month TEXT,
    source TEXT,
    amount REAL,
    date_received TEXT,
    notes TEXT
)
""")

conn.commit()
conn.close()
print("✅ monthly_income table recreated with user_id column.")
