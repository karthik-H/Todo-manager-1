import pytest
from fastapi.testclient import TestClient
from backend.main import app
import json
from datetime import datetime, timedelta

client = TestClient(app)

def get_future_date(days=1):
    return (datetime.utcnow() + timedelta(days=days)).strftime('%Y-%m-%d')

def get_past_date(days=1):
    return (datetime.utcnow() - timedelta(days=days)).strftime('%Y-%m-%d')

def repeat_str(length):
    return 'A' * length

# Test Case 1: Create Task - Valid Input
def test_create_task_valid_input():
    body = {
        'description': 'This is a test task.',
        'due_date': get_future_date(),
        'priority': 3,
        'title': 'Test Task'
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 201
    data = response.json()
    assert data['description'] == body['description']
    assert data['due_date'] == body['due_date']
    assert data['priority'] == body['priority']
    assert data['title'] == body['title']
    assert isinstance(data['id'], int)
    assert 'created_at' in data and 'updated_at' in data
    assert isinstance(data['created_at'], str)
    assert isinstance(data['updated_at'], str)

# Test Case 2: Create Task - Missing Required Field (title)
def test_create_task_missing_title():
    body = {
        'description': 'Missing title field.',
        'due_date': get_future_date(),
        'priority': 2
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 400
    data = response.json()
    assert {'loc': ['body', 'title'], 'msg': 'field required', 'type': 'value_error.missing'} in data['detail']

# Test Case 3: Create Task - Empty Title String
def test_create_task_empty_title():
    body = {
        'description': 'Empty title.',
        'due_date': get_future_date(),
        'priority': 2,
        'title': ''
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 400
    data = response.json()
    assert {'loc': ['body', 'title'], 'msg': 'Title must not be empty', 'type': 'value_error'} in data['detail']

# Test Case 4: Create Task - Title Maximum Length
def test_create_task_title_max_length():
    max_title = repeat_str(255)
    body = {
        'description': 'Max length title.',
        'due_date': get_future_date(),
        'priority': 2,
        'title': max_title
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 201
    data = response.json()
    assert data['title'] == max_title
    assert data['description'] == body['description']
    assert data['due_date'] == body['due_date']
    assert data['priority'] == body['priority']
    assert isinstance(data['id'], int)
    assert 'created_at' in data and 'updated_at' in data

# Test Case 5: Create Task - Title Exceeds Maximum Length
def test_create_task_title_exceeds_max_length():
    long_title = repeat_str(256)
    body = {
        'description': 'Title too long.',
        'due_date': get_future_date(),
        'priority': 2,
        'title': long_title
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 400
    data = response.json()
    assert {'loc': ['body', 'title'], 'msg': 'Title must be at most 255 characters', 'type': 'value_error'} in data['detail']

# Test Case 6: Create Task - Missing Optional Description
def test_create_task_missing_optional_description():
    body = {
        'due_date': get_future_date(),
        'priority': 1,
        'title': 'No Description Task'
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 201
    data = response.json()
    assert data['description'] is None
    assert data['title'] == body['title']
    assert data['due_date'] == body['due_date']
    assert data['priority'] == body['priority']
    assert isinstance(data['id'], int)
    assert 'created_at' in data and 'updated_at' in data

# Test Case 7: Create Task - Invalid Priority Type
def test_create_task_invalid_priority_type():
    body = {
        'description': 'priority is a string',
        'due_date': get_future_date(),
        'priority': 'high',
        'title': 'Bad Priority Type'
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 400
    data = response.json()
    assert {'loc': ['body', 'priority'], 'msg': 'value is not a valid integer', 'type': 'type_error.integer'} in data['detail']

# Test Case 8: Create Task - Priority Minimum Boundary
def test_create_task_priority_minimum_boundary():
    body = {
        'description': 'Minimum priority value.',
        'due_date': get_future_date(),
        'priority': 1,
        'title': 'Min Priority'
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 201
    data = response.json()
    assert data['priority'] == 1
    assert data['title'] == body['title']
    assert data['description'] == body['description']
    assert data['due_date'] == body['due_date']
    assert isinstance(data['id'], int)
    assert 'created_at' in data and 'updated_at' in data

# Test Case 9: Create Task - Priority Maximum Boundary
def test_create_task_priority_maximum_boundary():
    body = {
        'description': 'Maximum priority value.',
        'due_date': get_future_date(),
        'priority': 5,
        'title': 'Max Priority'
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 201
    data = response.json()
    assert data['priority'] == 5
    assert data['title'] == body['title']
    assert data['description'] == body['description']
    assert data['due_date'] == body['due_date']
    assert isinstance(data['id'], int)
    assert 'created_at' in data and 'updated_at' in data

# Test Case 10: Create Task - Priority Below Minimum
def test_create_task_priority_below_minimum():
    body = {
        'description': 'Priority is 0.',
        'due_date': get_future_date(),
        'priority': 0,
        'title': 'Priority Too Low'
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 400
    data = response.json()
    assert {'loc': ['body', 'priority'], 'msg': 'Priority must be between 1 and 5', 'type': 'value_error'} in data['detail']

# Test Case 11: Create Task - Priority Above Maximum
def test_create_task_priority_above_maximum():
    body = {
        'description': 'Priority is 6.',
        'due_date': get_future_date(),
        'priority': 6,
        'title': 'Priority Too High'
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 400
    data = response.json()
    assert {'loc': ['body', 'priority'], 'msg': 'Priority must be between 1 and 5', 'type': 'value_error'} in data['detail']

# Test Case 12: Create Task - Invalid Due Date Format
def test_create_task_invalid_due_date_format():
    body = {
        'description': 'due_date in wrong format',
        'due_date': '07/01/2024',
        'priority': 3,
        'title': 'Bad Due Date'
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 400
    data = response.json()
    assert {'loc': ['body', 'due_date'], 'msg': 'invalid date format', 'type': 'value_error.date'} in data['detail']

# Test Case 13: Create Task - Due Date in the Past
def test_create_task_due_date_in_past():
    body = {
        'description': 'Due date has already passed.',
        'due_date': get_past_date(365),
        'priority': 2,
        'title': 'Past Due Date'
    }
    response = client.post('/tasks', json=body)
    assert response.status_code == 400
    data = response.json()
    assert {'loc': ['body', 'due_date'], 'msg': 'Due date cannot be in the past', 'type': 'value_error'} in data['detail']

# Test Case 14: Create Task - Empty Request Body
def test_create_task_empty_request_body():
    body = {}
    response = client.post('/tasks', json=body)
    assert response.status_code == 400
    data = response.json()
    expected_errors = [
        {'loc': ['body', 'title'], 'msg': 'field required', 'type': 'value_error.missing'},
        {'loc': ['body', 'due_date'], 'msg': 'field required', 'type': 'value_error.missing'},
        {'loc': ['body', 'priority'], 'msg': 'field required', 'type': 'value_error.missing'}
    ]
    for err in expected_errors:
        assert err in data['detail']

# Test Case 15: Create Task - Invalid JSON Body
def test_create_task_invalid_json_body():
    invalid_json = '{title: Unquoted String, description: Missing Quotes}'
    response = client.post('/tasks', data=invalid_json, headers={"Content-Type": "application/json"})
    assert response.status_code == 400
    data = response.json()
    assert data['detail'] == 'Invalid JSON'
