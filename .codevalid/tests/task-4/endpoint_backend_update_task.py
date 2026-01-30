import pytest
from backend.main import app
from fastapi.testclient import TestClient
from unittest.mock import patch

client = TestClient(app)

# Helper: Sample tasks for mocking
task_123 = {'name': 'Sample Task', 'status': 'pending', 'task_id': 123}
task_1 = {'name': 'First Task', 'status': 'pending', 'task_id': 1}

# Test Case 1: Update Task with Valid ID and Status
def test_update_task_with_valid_id_and_status():
    updated_task = {'name': 'Sample Task', 'status': 'completed', 'task_id': 123}
    with patch('backend.database.update_task', return_value=updated_task):
        response = client.put('/tasks/123', json={'status': 'completed'})
        assert response.status_code == 200
        assert response.json() == updated_task

# Test Case 2: Update Non-existent Task
def test_update_non_existent_task():
    with patch('backend.database.update_task', return_value=None):
        response = client.put('/tasks/99999', json={'status': 'completed'})
        assert response.status_code == 404
        assert response.json() == {'detail': 'Task not found'}

# Test Case 3: Update Task with Invalid Task ID Format
def test_update_task_with_invalid_task_id_format():
    response = client.put('/tasks/abc', json={'status': 'completed'})
    assert response.status_code == 422
    assert response.json() == {'detail': 'Invalid task_id format'}

# Test Case 4: Update Task with Invalid Status Value
def test_update_task_with_invalid_status_value():
    with patch('backend.database.update_task', return_value=None):
        response = client.put('/tasks/123', json={'status': 'archived'})
        assert response.status_code == 400
        assert response.json() == {'detail': 'Invalid status value'}

# Test Case 5: Update Task with Empty Request Body
def test_update_task_with_empty_request_body():
    response = client.put('/tasks/123', json={})
    assert response.status_code == 400
    assert response.json() == {'detail': 'Request body is empty or missing required fields'}

# Test Case 6: Update Task with Very Long Status Value
def test_update_task_with_very_long_status_value():
    long_status = 'T' * 255
    response = client.put('/tasks/123', json={'status': long_status})
    assert response.status_code == 400
    assert response.json() == {'detail': 'Status value too long'}

# Test Case 7: Update Task with Minimal Task ID
def test_update_task_with_minimal_task_id():
    updated_task = {'name': 'First Task', 'status': 'in_progress', 'task_id': 1}
    with patch('backend.database.update_task', return_value=updated_task):
        response = client.put('/tasks/1', json={'status': 'in_progress'})
        assert response.status_code == 200
        assert response.json() == updated_task

# Test Case 8: Update Task Missing Content-Type Header
def test_update_task_missing_content_type_header():
    # Send data as plain text, not JSON, so Content-Type is not set to application/json
    response = client.put('/tasks/123', data="{'status': 'completed'}")
    assert response.status_code == 415
    assert response.json() == {'detail': 'Content-Type header missing or unsupported'}

# Test Case 9: Update Task with Null Status Value
def test_update_task_with_null_status_value():
    response = client.put('/tasks/123', json={'status': None})
    assert response.status_code == 400
    assert response.json() == {'detail': 'Status value cannot be null'}
