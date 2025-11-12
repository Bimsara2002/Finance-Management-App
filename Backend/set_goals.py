import sqlite3
conn = sqlite3.connect("Finance.db")
cur = conn.cursor()

# Drop old table
cur.execute("DROP TABLE IF EXISTS financial_goals")
# Recreate new table with user_id column
cur.execute("""
CREATE TABLE IF NOT EXISTS financial_goals (
    goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    goal_name TEXT,
    target_amount REAL,
    current_amount REAL,
    target_date TEXT,
    notes TEXT
);
""")

conn.commit()
conn.close()    
print("✅ financial_goals table recreated with user_id column.")

