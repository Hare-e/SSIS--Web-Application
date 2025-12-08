import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from db_connection import get_db_connection
import bcrypt

def main():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, password FROM users")
    rows = cur.fetchall()

    updated = 0

    for user_id, pwd in rows:
        # Already hashed
        if pwd.startswith("$2b$"):
            continue
        
        hashed = bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        cur.execute(
            "UPDATE users SET password = %s WHERE id = %s",
            (hashed, user_id)
        )
        updated += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"Updated {updated} users.")

if __name__ == "__main__":
    main()
