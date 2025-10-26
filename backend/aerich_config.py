import os

TORTOISE_ORM = {
    "connections": {
        "default": os.getenv(
            "DATABASE_URL",
            "postgres://lms_user:lms_password@postgres:5432/lms_db"
        )
    },
    "apps": {
        "models": {
            "models": ["models", "aerich.models"],
            "default_connection": "default",
        }
    },
}
