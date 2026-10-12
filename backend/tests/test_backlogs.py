"""
Integration Tests for Backlog Lifecycle and Clearance Verification.
Validates backlog list filtering, progress updates, and administrative clearance.
"""

import pytest
import sys
import os
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

import main

client = TestClient(main.app)


def test_list_all_backlogs():
    """Retrieve backlog records from seeded database."""
    response = client.get("/api/v1/backlogs/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_list_backlogs_filtered_by_status():
    """Filter backlogs by status 'Cleared'."""
    response = client.get("/api/v1/backlogs/?status=Cleared")
    assert response.status_code == 200
    data = response.json()
    assert all(item["status"] == "Cleared" for item in data)


def test_resolution_funnel_analytics():
    """Verify 5-milestone resolution funnel calculation."""
    response = client.get("/api/v1/analytics/funnel")
    assert response.status_code == 200
    data = response.json()
    assert "total_backlogs" in data
    assert "funnel" in data
    assert len(data["funnel"]) == 5


def test_faculty_overview_endpoint():
    """Verify faculty overview desk returns metrics."""
    response = client.get("/api/v1/faculty/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_faculty" in data
    assert "departments" in data
