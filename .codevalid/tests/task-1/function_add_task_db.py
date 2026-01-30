import pytest
from backend import database
from backend.models import Task
from unittest import mock

# Helper to create a Task dict for comparison

def make_task_dict(**kwargs):
    return dict(kwargs)

# Test Case 1: Add Task with Valid Attributes
def test_add_task_with_valid_attributes():
    existing_tasks = []
    task_create = {
        'description': 'Complete the quarterly report',
        'due_date': '2024-07-01',
        'priority': 'high',
        'title': 'Write report'
    }
    with mock.patch('backend.database.get_tasks', return_value=existing_tasks), \
         mock.patch('backend.database.save_tasks') as mock_save:
        new_task = database.add_task(task_create)
        assert new_task.description == task_create['description']
        assert new_task.due_date == task_create['due_date']
        assert new_task.priority == task_create['priority']
        assert new_task.title == task_create['title']
        mock_save.assert_called_once()

# Test Case 2: Add Task With Optional Fields
def test_add_task_with_optional_fields():
    existing_tasks = []
    task_create = {
        'description': 'Schedule project kickoff',
        'due_date': '2024-07-03',
        'priority': 'medium',
        'status': 'open',
        'tags': ['meeting', 'kickoff'],
        'title': 'Setup meeting'
    }
    with mock.patch('backend.database.get_tasks', return_value=existing_tasks), \
         mock.patch('backend.database.save_tasks') as mock_save:
        new_task = database.add_task(task_create)
        assert new_task.description == task_create['description']
        assert new_task.due_date == task_create['due_date']
        assert new_task.priority == task_create['priority']
        assert new_task.status == task_create['status']
        assert new_task.tags == task_create['tags']
        assert new_task.title == task_create['title']
        mock_save.assert_called_once()

# Test Case 3: Add Task Missing Required Fields
def test_add_task_missing_required_fields():
    existing_tasks = []
    task_create = {
        'description': 'No title present',
        'due_date': '2024-07-01',
        'priority': 'low'
    }
    with mock.patch('backend.database.get_tasks', return_value=existing_tasks), \
         mock.patch('backend.database.save_tasks') as mock_save:
        with pytest.raises(ValueError) as excinfo:
            database.add_task(task_create)
        assert 'title' in str(excinfo.value)
        mock_save.assert_not_called()

# Test Case 4: Add Task with Invalid Due Date Format
def test_add_task_with_invalid_due_date_format():
    existing_tasks = []
    task_create = {
        'description': 'Send invoice to client',
        'due_date': '07/01/2024',
        'priority': 'medium',
        'title': 'Submit invoice'
    }
    with mock.patch('backend.database.get_tasks', return_value=existing_tasks), \
         mock.patch('backend.database.save_tasks') as mock_save:
        with pytest.raises(ValueError) as excinfo:
            database.add_task(task_create)
        assert 'date format' in str(excinfo.value)
        mock_save.assert_not_called()

# Test Case 5: Add Task with Invalid Priority Value
def test_add_task_with_invalid_priority_value():
    existing_tasks = []
    task_create = {
        'description': 'Organize birthday party',
        'due_date': '2024-07-04',
        'priority': 'urgent',
        'title': 'Plan party'
    }
    with mock.patch('backend.database.get_tasks', return_value=existing_tasks), \
         mock.patch('backend.database.save_tasks') as mock_save:
        with pytest.raises(ValueError) as excinfo:
            database.add_task(task_create)
        assert 'priority' in str(excinfo.value)
        mock_save.assert_not_called()

# Test Case 6: Add Task with Empty String Title
def test_add_task_with_empty_string_title():
    existing_tasks = []
    task_create = {
        'description': 'No title provided',
        'due_date': '2024-07-05',
        'priority': 'low',
        'title': ''
    }
    with mock.patch('backend.database.get_tasks', return_value=existing_tasks), \
         mock.patch('backend.database.save_tasks') as mock_save:
        with pytest.raises(ValueError) as excinfo:
            database.add_task(task_create)
        assert 'Title cannot be empty' in str(excinfo.value)
        mock_save.assert_not_called()

# Test Case 7: Add Task with Maximum Length Title
def test_add_task_with_maximum_length_title():
    existing_tasks = []
    max_title = 'T' * 255
    task_create = {
        'description': 'Max length title test',
        'due_date': '2024-07-06',
        'priority': 'medium',
        'title': max_title
    }
    with mock.patch('backend.database.get_tasks', return_value=existing_tasks), \
         mock.patch('backend.database.save_tasks') as mock_save:
        new_task = database.add_task(task_create)
        assert new_task.title == max_title
        mock_save.assert_called_once()

# Test Case 8: Add Duplicate Task
def test_add_duplicate_task():
    existing_tasks = [
        Task(description='Code review for PR #42', due_date='2024-07-02', priority='high', title='Review PR')
    ]
    task_create = {
        'description': 'Code review for PR #42',
        'due_date': '2024-07-02',
        'priority': 'high',
        'title': 'Review PR'
    }
    with mock.patch('backend.database.get_tasks', return_value=existing_tasks), \
         mock.patch('backend.database.save_tasks') as mock_save:
        new_task = database.add_task(task_create)
        assert new_task.description == task_create['description']
        assert new_task.due_date == task_create['due_date']
        assert new_task.priority == task_create['priority']
        assert new_task.title == task_create['title']
        mock_save.assert_called_once()

# Test Case 9: Add Task with Storage Failure
def test_add_task_with_storage_failure():
    existing_tasks = []
    task_create = {
        'description': 'Backup server files',
        'due_date': '2024-07-07',
        'priority': 'medium',
        'title': 'Backup files'
    }
    with mock.patch('backend.database.get_tasks', return_value=existing_tasks), \
         mock.patch('backend.database.save_tasks', side_effect=Exception('Failed to save tasks to persistent storage')) as mock_save:
        with pytest.raises(Exception) as excinfo:
            database.add_task(task_create)
        assert 'Failed to save tasks to persistent storage' in str(excinfo.value)
        mock_save.assert_called_once()

# Test Case 10: Add Task with Null Optional Fields
def test_add_task_with_null_optional_fields():
    existing_tasks = []
    task_create = {
        'description': 'Release v1.2',
        'due_date': '2024-07-08',
        'priority': 'high',
        'status': None,
        'tags': None,
        'title': 'Deploy update'
    }
    with mock.patch('backend.database.get_tasks', return_value=existing_tasks), \
         mock.patch('backend.database.save_tasks') as mock_save:
        new_task = database.add_task(task_create)
        assert new_task.description == task_create['description']
        assert new_task.due_date == task_create['due_date']
        assert new_task.priority == task_create['priority']
        assert new_task.status is None
        assert new_task.tags is None
        assert new_task.title == task_create['title']
        mock_save.assert_called_once()
