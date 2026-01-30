import pytest
from fastapi.testclient import TestClient
from backend.main import app
import backend.database as database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown(monkeypatch):
    # Setup: mock database.delete_task for each test
    monkeypatch.setattr(database, "delete_task", lambda task_id: task_id in {1, 123})
    yield
    # Teardown: nothing needed

# Test Case 1: Delete existing task with valid ID
def test_delete_existing_task_with_valid_id(monkeypatch):
    monkeypatch.setattr(database, "delete_task", lambda task_id: task_id == 123)
    response = client.delete("/tasks/123")
    assert response.status_code == 200
    assert response.json() == {'detail': 'Task deleted successfully'}

# Test Case 2: Delete non-existent task
def test_delete_non_existent_task(monkeypatch):
    monkeypatch.setattr(database, "delete_task", lambda task_id: False)
    response = client.delete("/tasks/99999")
    assert response.status_code == 404
    assert response.json() == {'detail': 'Task not found'}

# Test Case 3: Delete with invalid task_id (string)
def test_delete_with_invalid_task_id_string():
    response = client.delete("/tasks/invalid_id")
    assert response.status_code == 422
    # FastAPI returns a validation error structure
    assert any(
        err['msg'].startswith('value is not a valid integer')
        for err in response.json()['detail']
    )

# Test Case 4: Delete task with minimum valid ID (e.g., 1)
def test_delete_task_with_minimum_valid_id(monkeypatch):
    monkeypatch.setattr(database, "delete_task", lambda task_id: task_id == 1)
    response = client.delete("/tasks/1")
    assert response.status_code == 200
    assert response.json() == {'detail': 'Task deleted successfully'}

# Test Case 5: Delete with zero as task_id
def test_delete_with_zero_as_task_id(monkeypatch):
    monkeypatch.setattr(database, "delete_task", lambda task_id: False)
    response = client.delete("/tasks/0")
    assert response.status_code == 404
    assert response.json() == {'detail': 'Task not found'}

# Test Case 6: Delete task with very large task_id
def test_delete_task_with_very_large_task_id(monkeypatch):
    monkeypatch.setattr(database, "delete_task", lambda task_id: False)
    response = client.delete("/tasks/2147483647")
    assert response.status_code == 404
    assert response.json() == {'detail': 'Task not found'}

# Test Case 7: Delete with missing task_id in URL
def test_delete_with_missing_task_id_in_url():
    response = client.delete("/tasks/")
    assert response.status_code == 404
    assert response.json()['detail'] == 'Not Found'

# Test Case 8: Delete request with extra body
def test_delete_request_with_extra_body(monkeypatch):
    monkeypatch.setattr(database, "delete_task", lambda task_id: task_id == 123)
    response = client.delete("/tasks/123", json={'dummy': 'data'})
    assert response.status_code == 200
    assert response.json() == {'detail': 'Task deleted successfully'}

# Test Case 9: Send POST to DELETE endpoint
def test_send_post_to_delete_endpoint():
    response = client.post("/tasks/123")
    assert response.status_code == 405
    assert response.json()['detail'] == 'Method Not Allowed'
