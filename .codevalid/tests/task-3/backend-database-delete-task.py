import pytest
import json
import os
from unittest import mock
from backend import database

tasks_file_path = os.path.join(os.path.dirname(__file__), '../../backend/tasks.json')

def setup_tasks_file(data):
    with open(tasks_file_path, 'w') as f:
        json.dump(data, f)

def read_tasks_file():
    with open(tasks_file_path, 'r') as f:
        return json.load(f)

def remove_tasks_file():
    if os.path.exists(tasks_file_path):
        os.remove(tasks_file_path)

@pytest.fixture(autouse=True)
def cleanup_tasks_file():
    remove_tasks_file()
    yield
    remove_tasks_file()

# Test Case 1: Delete existing task by valid ID
def test_delete_existing_task_by_valid_id():
    setup_tasks_file([
        {"id": "task-123", "name": "Test Task"},
        {"id": "task-456", "name": "Other Task"}
    ])
    result = database.delete_task("task-123")
    assert result is True
    tasks = read_tasks_file()
    assert all(task["id"] != "task-123" for task in tasks)
    assert len(tasks) == 1

# Test Case 2: Attempt to delete non-existent task
def test_attempt_to_delete_non_existent_task():
    setup_tasks_file([
        {"id": "task-123", "name": "Test Task"}
    ])
    result = database.delete_task("missing-task")
    assert result is False
    tasks = read_tasks_file()
    assert len(tasks) == 1
    assert tasks[0]["id"] == "task-123"

# Test Case 3: Attempt to delete from empty task store
def test_attempt_to_delete_from_empty_task_store():
    setup_tasks_file([])
    result = database.delete_task("any-task-id")
    assert result is False
    tasks = read_tasks_file()
    assert tasks == []

# Test Case 4: Delete with invalid task ID type
def test_delete_with_invalid_task_id_type():
    setup_tasks_file([
        {"id": "task-123", "name": "Test Task"}
    ])
    try:
        result = database.delete_task(123)
        assert result is False
        tasks = read_tasks_file()
        assert len(tasks) == 1
    except TypeError:
        tasks = read_tasks_file()
        assert len(tasks) == 1

# Test Case 5: Delete with empty string as task ID
def test_delete_with_empty_string_as_task_id():
    setup_tasks_file([
        {"id": "task-123", "name": "Test Task"}
    ])
    result = database.delete_task("")
    assert result is False
    tasks = read_tasks_file()
    assert len(tasks) == 1

# Test Case 6: Delete with null task ID
def test_delete_with_null_task_id():
    setup_tasks_file([
        {"id": "task-123", "name": "Test Task"}
    ])
    try:
        result = database.delete_task(None)
        assert result is False
        tasks = read_tasks_file()
        assert len(tasks) == 1
    except TypeError:
        tasks = read_tasks_file()
        assert len(tasks) == 1

# Test Case 7: Multiple tasks with same ID
def test_multiple_tasks_with_same_id():
    setup_tasks_file([
        {"id": "dup-id", "name": "Task 1"},
        {"id": "dup-id", "name": "Task 2"},
        {"id": "other-id", "name": "Task 3"}
    ])
    result = database.delete_task("dup-id")
    assert result is True
    tasks = read_tasks_file()
    # Depending on implementation, either one or all are removed
    assert all(task["id"] != "dup-id" for task in tasks) or sum(task["id"] == "dup-id" for task in tasks) < 2

# Test Case 8: Delete with case-sensitive ID
def test_delete_with_case_sensitive_id():
    setup_tasks_file([
        {"id": "Task-Case", "name": "Case Task"}
    ])
    result = database.delete_task("task-case")
    tasks = read_tasks_file()
    # If case-sensitive, should not delete
    if result:
        assert all(task["id"] != "Task-Case" for task in tasks)
    else:
        assert any(task["id"] == "Task-Case" for task in tasks)

# Test Case 9: Delete from large task store
def test_delete_from_large_task_store():
    large_tasks = [{"id": f"task-{i}", "name": f"Task {i}"} for i in range(10000)]
    large_tasks.append({"id": "large-task-id", "name": "Large Task"})
    setup_tasks_file(large_tasks)
    result = database.delete_task("large-task-id")
    assert result is True
    tasks = read_tasks_file()
    assert all(task["id"] != "large-task-id" for task in tasks)
    assert len(tasks) == 10000

# Test Case 10: Delete when tasks.json is corrupted
def test_delete_when_tasks_json_is_corrupted():
    with open(tasks_file_path, 'w') as f:
        f.write('{invalid json}')
    try:
        result = database.delete_task("any-id")
        assert result is False
    except json.JSONDecodeError:
        pass
    # File should remain unchanged
    with open(tasks_file_path, 'r') as f:
        content = f.read()
    assert content == '{invalid json}'
