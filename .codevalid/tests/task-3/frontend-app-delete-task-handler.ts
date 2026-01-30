import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../frontend/src/App';
import * as api from '../../frontend/src/api';

// Helper to update state in App
function getAppInstance() {
  // Render App and return instance
  let appInstance: any = null;
  function Wrapper() {
    appInstance = React.useRef<any>(null);
    return <App ref={appInstance} />;
  }
  render(<Wrapper />);
  return appInstance.current;
}

describe('App.handleDeleteTask', () => {
  let appInstance: any;
  let setTasksSpy: jest.SpyInstance;
  let showErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock App instance methods
    appInstance = getAppInstance();
    setTasksSpy = jest.spyOn(appInstance, 'setTasks');
    showErrorSpy = jest.spyOn(appInstance, 'showError');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Delete Task Successfully', async () => {
    const tasks = [{ id: '1', title: 'Task 1' }];
    appInstance.state = { tasks };
    jest.spyOn(api, 'deleteTask').mockResolvedValueOnce({ success: true });

    await act(async () => {
      await appInstance.handleDeleteTask('1');
    });

    expect(api.deleteTask).toHaveBeenCalledWith('1');
    expect(setTasksSpy).toHaveBeenCalledWith([]);
    expect(showErrorSpy).not.toHaveBeenCalled();
  });

  test('Delete Task Not Present in Local State', async () => {
    const tasks = [{ id: '2', title: 'Task 2' }];
    appInstance.state = { tasks };
    jest.spyOn(api, 'deleteTask').mockResolvedValueOnce({ success: true });

    await act(async () => {
      await appInstance.handleDeleteTask('99');
    });

    expect(api.deleteTask).toHaveBeenCalledWith('99');
    expect(setTasksSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).not.toHaveBeenCalled();
  });

  test('Delete Task API Failure', async () => {
    const tasks = [{ id: '2', title: 'Task 2' }];
    appInstance.state = { tasks };
    jest.spyOn(api, 'deleteTask').mockRejectedValueOnce(new Error('API error'));

    await act(async () => {
      await appInstance.handleDeleteTask('2');
    });

    expect(api.deleteTask).toHaveBeenCalledWith('2');
    expect(setTasksSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).toHaveBeenCalledWith('Failed to delete task');
  });

  test('Delete Task with Invalid ID', async () => {
    const tasks = [{ id: '3', title: 'Task 3' }];
    appInstance.state = { tasks };
    const deleteTaskSpy = jest.spyOn(api, 'deleteTask');

    await act(async () => {
      await appInstance.handleDeleteTask(null);
    });

    expect(deleteTaskSpy).not.toHaveBeenCalled();
    expect(setTasksSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).toHaveBeenCalledWith('Invalid task ID');
  });

  test('Delete Task API Timeout', async () => {
    const tasks = [{ id: '3', title: 'Task 3' }];
    appInstance.state = { tasks };
    jest.spyOn(api, 'deleteTask').mockImplementationOnce(() => new Promise((_resolve, reject) => setTimeout(() => reject(new Error('Timeout')), 1000)));

    await act(async () => {
      await appInstance.handleDeleteTask('3');
    });

    expect(api.deleteTask).toHaveBeenCalledWith('3');
    expect(setTasksSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).toHaveBeenCalledWith('Failed to delete task');
  });

  test('Delete Task with Empty Local State', async () => {
    appInstance.state = { tasks: [] };
    jest.spyOn(api, 'deleteTask').mockResolvedValueOnce({ success: true });

    await act(async () => {
      await appInstance.handleDeleteTask('4');
    });

    expect(api.deleteTask).toHaveBeenCalledWith('4');
    expect(setTasksSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).not.toHaveBeenCalled();
  });

  test('Delete Task Multiple Times', async () => {
    const tasks = [{ id: '5', title: 'Task 5' }];
    appInstance.state = { tasks };
    const deleteTaskMock = jest.spyOn(api, 'deleteTask');
    deleteTaskMock.mockResolvedValueOnce({ success: true });
    deleteTaskMock.mockRejectedValueOnce(new Error('API error'));

    await act(async () => {
      await appInstance.handleDeleteTask('5');
    });
    expect(deleteTaskMock).toHaveBeenCalledWith('5');
    expect(setTasksSpy).toHaveBeenCalledWith([]);
    expect(showErrorSpy).not.toHaveBeenCalled();

    await act(async () => {
      await appInstance.handleDeleteTask('5');
    });
    expect(deleteTaskMock).toHaveBeenCalledWith('5');
    expect(showErrorSpy).toHaveBeenCalledWith('Failed to delete task');
  });

  test('Delete Task API Returns Unexpected Response', async () => {
    const tasks = [{ id: '6', title: 'Task 6' }];
    appInstance.state = { tasks };
    jest.spyOn(api, 'deleteTask').mockResolvedValueOnce({ foo: 'bar' }); // Malformed response

    await act(async () => {
      await appInstance.handleDeleteTask('6');
    });

    expect(api.deleteTask).toHaveBeenCalledWith('6');
    expect(setTasksSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).toHaveBeenCalledWith('Failed to delete task');
  });
});
