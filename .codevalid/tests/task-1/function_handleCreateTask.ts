import { handleCreateTask } from '../../frontend/src/App';
import * as api from '../../frontend/src/api';
import { act } from 'react-dom/test-utils';

// Mocks for UI control functions
const reloadTasks = jest.fn();
const closeForm = jest.fn();
const showError = jest.fn();
const showValidationError = jest.fn();

// Helper: minimal valid/invalid taskData
const validTaskData = { title: 'Test', description: 'Desc' };
const invalidTaskData = { title: '', description: '' };
const minTaskData = { title: 'T', description: 'D' };
const maxTaskData = { title: 'T'.repeat(100), description: 'D'.repeat(500) };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('handleCreateTask', () => {
  // Test Case 1: Successful task creation
  it('Successful task creation', async () => {
    jest.spyOn(api, 'createTask').mockResolvedValueOnce({ id: 1, ...validTaskData });
    await act(async () => {
      await handleCreateTask(validTaskData, { reloadTasks, closeForm, showError, showValidationError });
    });
    expect(api.createTask).toHaveBeenCalledWith(validTaskData);
    expect(reloadTasks).toHaveBeenCalled();
    expect(closeForm).toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
    expect(showValidationError).not.toHaveBeenCalled();
  });

  // Test Case 2: API failure during task creation
  it('API failure during task creation', async () => {
    jest.spyOn(api, 'createTask').mockRejectedValueOnce(new Error('API Error'));
    await act(async () => {
      await handleCreateTask(validTaskData, { reloadTasks, closeForm, showError, showValidationError });
    });
    expect(api.createTask).toHaveBeenCalledWith(validTaskData);
    expect(reloadTasks).not.toHaveBeenCalled();
    expect(closeForm).not.toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith('API Error');
  });

  // Test Case 3: Submission with invalid task data
  it('Submission with invalid task data', async () => {
    await act(async () => {
      await handleCreateTask(invalidTaskData, { reloadTasks, closeForm, showError, showValidationError });
    });
    expect(api.createTask).not.toHaveBeenCalled();
    expect(reloadTasks).not.toHaveBeenCalled();
    expect(closeForm).not.toHaveBeenCalled();
    expect(showValidationError).toHaveBeenCalled();
  });

  // Test Case 4: Failure during task list reload
  it('Failure during task list reload', async () => {
    jest.spyOn(api, 'createTask').mockResolvedValueOnce({ id: 2, ...validTaskData });
    reloadTasks.mockImplementationOnce(() => { throw new Error('Reload Error'); });
    await act(async () => {
      await handleCreateTask(validTaskData, { reloadTasks, closeForm, showError, showValidationError });
    });
    expect(api.createTask).toHaveBeenCalledWith(validTaskData);
    expect(reloadTasks).toHaveBeenCalled();
    expect(closeForm).toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith('Reload Error');
  });

  // Test Case 5: Failure to close the form after task creation
  it('Failure to close the form after task creation', async () => {
    jest.spyOn(api, 'createTask').mockResolvedValueOnce({ id: 3, ...validTaskData });
    reloadTasks.mockResolvedValueOnce(undefined);
    closeForm.mockImplementationOnce(() => { throw new Error('Close Error'); });
    await act(async () => {
      await handleCreateTask(validTaskData, { reloadTasks, closeForm, showError, showValidationError });
    });
    expect(api.createTask).toHaveBeenCalledWith(validTaskData);
    expect(reloadTasks).toHaveBeenCalled();
    expect(closeForm).toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith('Close Error');
  });

  // Test Case 6: Submission with empty input
  it('Submission with empty input', async () => {
    await act(async () => {
      await handleCreateTask({}, { reloadTasks, closeForm, showError, showValidationError });
    });
    expect(api.createTask).not.toHaveBeenCalled();
    expect(reloadTasks).not.toHaveBeenCalled();
    expect(closeForm).not.toHaveBeenCalled();
    expect(showValidationError).toHaveBeenCalled();
  });

  // Test Case 7: Submission with minimum valid input lengths
  it('Submission with minimum valid input lengths', async () => {
    jest.spyOn(api, 'createTask').mockResolvedValueOnce({ id: 4, ...minTaskData });
    await act(async () => {
      await handleCreateTask(minTaskData, { reloadTasks, closeForm, showError, showValidationError });
    });
    expect(api.createTask).toHaveBeenCalledWith(minTaskData);
    expect(reloadTasks).toHaveBeenCalled();
    expect(closeForm).toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
    expect(showValidationError).not.toHaveBeenCalled();
  });

  // Test Case 8: Submission with maximum valid input lengths
  it('Submission with maximum valid input lengths', async () => {
    jest.spyOn(api, 'createTask').mockResolvedValueOnce({ id: 5, ...maxTaskData });
    await act(async () => {
      await handleCreateTask(maxTaskData, { reloadTasks, closeForm, showError, showValidationError });
    });
    expect(api.createTask).toHaveBeenCalledWith(maxTaskData);
    expect(reloadTasks).toHaveBeenCalled();
    expect(closeForm).toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
    expect(showValidationError).not.toHaveBeenCalled();
  });

  // Test Case 9: Duplicate task creation submission
  it('Duplicate task creation submission', async () => {
    jest.spyOn(api, 'createTask').mockResolvedValue({ id: 6, ...validTaskData });
    await act(async () => {
      await handleCreateTask(validTaskData, { reloadTasks, closeForm, showError, showValidationError });
      await handleCreateTask(validTaskData, { reloadTasks, closeForm, showError, showValidationError });
    });
    // Business logic: Only one task should be created, or duplicates handled
    // Here, we check if createTask is called twice, but you may want to check for deduplication logic if present
    expect(api.createTask).toHaveBeenCalledTimes(2);
    // If deduplication is implemented, change this assertion accordingly
  });
});
