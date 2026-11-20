"""
MySQL database helper — Flask backend
Used to save weather analysis logs (optional).
Main app data (users, bookings) is handled by Node.js API on port 5000.
"""

import os

try:
    import mysql.connector
except ImportError:
    mysql = None


def get_db_config():
    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'smart_travel_planner'),
    }


def get_connection():
    """Return MySQL connection or None if mysql-connector is not installed."""
    if mysql is None:
        return None
    try:
        return mysql.connector.connect(**get_db_config())
    except Exception:
        return None


def save_weather_log(user_id, destination_id, travel_date, analysis):
    """Save weather risk result to weather_logs table."""
    conn = get_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        inp = analysis.get('input', {})
        cursor.execute(
            """
            INSERT INTO weather_logs
              (user_id, destination_id, travel_date, temperature, rain_mm,
               wind_speed_kmh, humidity, risk_level, recommendation)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                destination_id,
                travel_date,
                inp.get('temperature'),
                inp.get('rain_mm'),
                inp.get('wind_speed_kmh'),
                inp.get('humidity'),
                analysis.get('risk_level'),
                analysis.get('recommendation'),
            ),
        )
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()
