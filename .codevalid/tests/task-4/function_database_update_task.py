import pytest
from backend.database import update_task
from backend.models import Task

# Helper to patch tasks and save
import types

def setup_tasks(monkeypatch, initial_tasks):
    # Patch the tasks list in backend.database
    import backend.database
    backend.database.tasks = initial_tasks.copy()
    # Patch the SAVE tasks function (simulate persistence)
    backend.database.SAVE = lambda tasks=None: None

class DummyTask(Task):
    def __eq__(self, other):
        return isinstance(other, Task) and self.id == other.id and self.title == getattr(other, 'title', None) and self.completed == getattr(other, 'completed', None)

# Test Case 1: update_existing_task_success
def test_update_existing_task_success(monkeypatch):
    tasks = [Task(id=1, title='A', completed=False)]
    setup_tasks(monkeypatch, tasks)
    result = update_task(1, {'completed': True})
    assert result is not None
    assert result.id == 1
    assert result.completed is True
    assert result.title == 'A'
    # Ensure the tasks list is updated
    import backend.database
    assert backend.database.tasks[0].completed is True

# Test Case 2: update_nonexistent_task_returns_none
def test_update_nonexistent_task_returns_none(monkeypatch):
    tasks = [Task(id=1, title='A', completed=False), Task(id=2, title='B', completed=True), Task(id=3, title='C', completed=False)]
    setup_tasks(monkeypatch, tasks)
    result = update_task(999, {'completed': False})
    assert result is None
    # Ensure no tasks are modified
    import backend.database
    assert backend.database.tasks == tasks

# Test Case 3: update_task_with_partial_fields
def test_update_task_with_partial_fields(monkeypatch):
    tasks = [Task(id=2, title='Test', completed=False)]
    setup_tasks(monkeypatch, tasks)
    result = update_task(2, {'completed': True})
    assert result is not None
    assert result.id == 2
    assert result.completed is True
    assert result.title == 'Test'

# Test Case 4: update_task_with_extra_fields_ignored
def test_update_task_with_extra_fields_ignored(monkeypatch):
    tasks = [Task(id=3, title='Sample', completed=False)]
    setup_tasks(monkeypatch, tasks)
    try:
        result = update_task(3, {'completed': True, 'unexpected': 'field'})
    except TypeError:
        # If error is raised, that's acceptable
        return
    # If not, ensure extra field is ignored
    assert result is not None
    assert result.id == 3
    assert result.completed is True
    assert result.title == 'Sample'
    assert not hasattr(result, 'unexpected')

# Test Case 5: update_task_empty_task_list
def test_update_task_empty_task_list(monkeypatch):
    tasks = []
    setup_tasks(monkeypatch, tasks)
    result = update_task(1, {'completed': True})
    assert result is None

# Test Case 6: update_task_invalid_task_id_type
def test_update_task_invalid_task_id_type(monkeypatch):
    tasks = [Task(id=1, title='A', completed=False)]
    setup_tasks(monkeypatch, tasks)
    result = None
    try:
        result = update_task('one', {'completed': False})
    except Exception:
        return
    assert result is None

# Test Case 7: update_task_invalid_task_update_type
def test_update_task_invalid_task_update_type(monkeypatch):
    tasks = [Task(id=1, title='A', completed=False)]
    setup_tasks(monkeypatch, tasks)
    with pytest.raises(TypeError):
        update_task(1, 'completed')

# Test Case 8: update_task_no_fields_in_update
def test_update_task_no_fields_in_update(monkeypatch):
    tasks = [Task(id=5, title='Edge', completed=False)]
    setup_tasks(monkeypatch, tasks)
    result = update_task(5, {})
    assert result is not None
    assert result.id == 5
    assert result.title == 'Edge'
    assert result.completed is False

# Test Case 9: update_task_multiple_tasks_same_id
def test_update_task_multiple_tasks_same_id(monkeypatch):
    tasks = [Task(id=6, title='First', completed=False), Task(id=6, title='Second', completed=False)]
    setup_tasks(monkeypatch, tasks)
    result = update_task(6, {'completed': True})
    assert result is not None
    assert result.id == 6
    assert result.completed is True
    assert result.title == 'First'
    import backend.database
    assert backend.database.tasks[0].completed is True
    assert backend.database.tasks[1].completed is False

# Test Case 10: update_task_completed_status_false
def test_update_task_completed_status_false(monkeypatch):
    tasks = [Task(id=7, title='Done', completed=True)]
    setup_tasks(monkeypatch, tasks)
    result = update_task(7, {'completed': False})
    assert result is not None
    assert result.id == 7
    assert result.completed is False
    assert result.title == 'Done'
