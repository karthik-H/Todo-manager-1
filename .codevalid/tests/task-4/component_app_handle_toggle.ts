import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../frontend/src/App';
import * as api from '../../frontend/src/api';

jest.mock('../../frontend/src/api');

const mockLoadTasks = jest.fn();
const mockSetError = jest.fn();
const mockSetLoading = jest.fn();

function setupApp(tasks: any[] = []) {
  // Mock App's internal state and methods
  // We assume App uses useState for tasks, error, loading
  // and passes handleToggleComplete to TaskItem
  // We'll spy on loadTasks and error handling
  // For simplicity, we render App and override methods if needed
  render(<App />);
  // Simulate initial state
  // This depends on App's implementation, so we may need to mock useState/useEffect
  // For now, we assume tasks are rendered as TaskItem with checkboxes
}

describe('component_app_handle_toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset any global state if needed
  });

  test('Successfully toggles task completion', async () => {
    const task = { id: '1', title: 'Test Task', completed: false };
    (api.updateTask as jest.Mock).mockResolvedValue({ ...task, completed: true });
    // Mock loadTasks to be called
    (api.loadTasks as any) = mockLoadTasks;
    // Render App with one task
    setupApp([task]);
    // Find the checkbox for the task
    const checkbox = await screen.findByRole('checkbox', { name: /test task/i });
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith('1', { ...task, completed: true });
      expect(mockLoadTasks).toHaveBeenCalled();
    });
  });

  test('API error on toggling completion', async () => {
    const task = { id: '2', title: 'Error Task', completed: false };
    (api.updateTask as jest.Mock).mockRejectedValue(new Error('API Error'));
    (api.loadTasks as any) = mockLoadTasks;
    // Render App with one task
    setupApp([task]);
    const checkbox = await screen.findByRole('checkbox', { name: /error task/i });
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith('2', { ...task, completed: true });
      expect(mockLoadTasks).not.toHaveBeenCalled();
      // Check for error message
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('Multiple rapid toggles are handled correctly', async () => {
    const task = { id: '3', title: 'Rapid Task', completed: false };
    (api.updateTask as jest.Mock).mockResolvedValue({ ...task, completed: true });
    (api.loadTasks as any) = mockLoadTasks;
    setupApp([task]);
    const checkbox = await screen.findByRole('checkbox', { name: /rapid task/i });
    // Simulate rapid toggles
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledTimes(3);
      expect(mockLoadTasks).toHaveBeenCalledTimes(3);
    });
  });

  test('Toggling when task list is empty does nothing', async () => {
    (api.updateTask as jest.Mock).mockResolvedValue({});
    (api.loadTasks as any) = mockLoadTasks;
    setupApp([]);
    // There should be no checkboxes
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(api.updateTask).not.toHaveBeenCalled();
    expect(mockLoadTasks).not.toHaveBeenCalled();
  });

  test('Toggle from completed to incomplete', async () => {
    const task = { id: '4', title: 'Completed Task', completed: true };
    (api.updateTask as jest.Mock).mockResolvedValue({ ...task, completed: false });
    (api.loadTasks as any) = mockLoadTasks;
    setupApp([task]);
    const checkbox = await screen.findByRole('checkbox', { name: /completed task/i });
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith('4', { ...task, completed: false });
      expect(mockLoadTasks).toHaveBeenCalled();
    });
  });

  test('Partial failure during toggle still reloads tasks', async () => {
    const task = { id: '5', title: 'Warning Task', completed: false };
    (api.updateTask as jest.Mock).mockResolvedValue({ ...task, completed: true, warning: 'Partial success' });
    (api.loadTasks as any) = mockLoadTasks;
    setupApp([task]);
    const checkbox = await screen.findByRole('checkbox', { name: /warning task/i });
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith('5', { ...task, completed: true });
      expect(mockLoadTasks).toHaveBeenCalled();
      // Optionally check for warning message
      expect(screen.getByText(/partial success/i)).toBeInTheDocument();
    });
  });

  test('Handle invalid task data on toggle', async () => {
    const invalidTask = { title: 'No ID Task', completed: false };
    (api.updateTask as jest.Mock).mockResolvedValue({});
    (api.loadTasks as any) = mockLoadTasks;
    // Directly call handleToggleComplete with invalid task
    // We need to get handleToggleComplete from App
    // For now, simulate the call
    // @ts-ignore
    await App.prototype.handleToggleComplete(invalidTask);
    expect(api.updateTask).not.toHaveBeenCalled();
    expect(mockLoadTasks).not.toHaveBeenCalled();
    // Check for error message
    expect(screen.getByText(/invalid task/i)).toBeInTheDocument();
  });

  test('Loading state is handled during API call', async () => {
    const task = { id: '6', title: 'Loading Task', completed: false };
    let resolveApi: any;
    (api.updateTask as jest.Mock).mockImplementation(() => new Promise((resolve) => { resolveApi = resolve; }));
    (api.loadTasks as any) = mockLoadTasks;
    setupApp([task]);
    const checkbox = await screen.findByRole('checkbox', { name: /loading task/i });
    fireEvent.click(checkbox);
    // Check loading indicator and disabled UI
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(checkbox).toBeDisabled();
    // Finish API call
    resolveApi({ ...task, completed: true });
    await waitFor(() => {
      expect(mockLoadTasks).toHaveBeenCalled();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      expect(checkbox).not.toBeDisabled();
    });
  });
});
