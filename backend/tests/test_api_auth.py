"""
Integration Tests for Authentication API and User Access.
Tests password hashing, JWT bearer creation, and role authentication.
"""

import pytest
import sys
import os
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

import main
from app.utils.auth import hash_password, verify_password

client = TestClient(main.app)


def test_root_endpoint():
    """Root endpoint must report system status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "version" in data


def test_password_hashing():
    """Verify password hashing produces secure mismatch and valid verification."""
    pwd = "SecretPassword123"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_login_invalid_credentials():
    """Login with invalid user must return 401 Unauthorized."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "non_existent_user_999", "password": "WrongPassword!", "role": "student"}
    )
    assert response.status_code == 401


def test_login_seeded_student():
    """Login with seeded student Aarav Patel."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "1BT23BCA014", "password": "student123", "role": "student"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "1BT23BCA014"
    assert data["role"] == "student"


def test_login_seeded_admin():
    """Login with seeded Exam Controller Admin."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "admin123", "role": "admin"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"
