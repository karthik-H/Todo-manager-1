import api from '../../frontend/src/api';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('api.updateTask', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Test Case 1: Update task completed status to true with valid ID', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      status: 200,
      data: { completed: true, id: 101, title: 'Buy groceries' },
    });
    const result = await api.updateTask(101, { title: 'Buy groceries', completed: true });
    expect(result).toEqual({ completed: true, id: 101, title: 'Buy groceries' });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/101', { title: 'Buy groceries', completed: true });
  });

  it('Test Case 2: Update task completed status to false with valid ID', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      status: 200,
      data: { completed: false, id: 102, title: 'Read a book' },
    });
    const result = await api.updateTask(102, { title: 'Read a book', completed: false });
    expect(result).toEqual({ completed: false, id: 102, title: 'Read a book' });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/102', { title: 'Read a book', completed: false });
  });

  it('Test Case 3: Update task with invalid ID', async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: {
        status: 404,
        data: { error: 'Task not found' },
      },
    });
    await expect(api.updateTask(9999, { title: 'Non-existent task', completed: true })).rejects.toMatchObject({
      response_body_json: { error: 'Task not found' },
      response_status: 404,
    });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/9999', { title: 'Non-existent task', completed: true });
  });

  it('Test Case 4: Update task missing completed field', async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: 'Missing required field: completed' },
      },
    });
    await expect(api.updateTask(103, { title: 'Walk the dog' })).rejects.toMatchObject({
      response_body_json: { error: 'Missing required field: completed' },
      response_status: 400,
    });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/103', { title: 'Walk the dog' });
  });

  it('Test Case 5: Update task with completed field as null', async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: 'Invalid value for completed' },
      },
    });
    await expect(api.updateTask(104, { title: 'Cook dinner', completed: null })).rejects.toMatchObject({
      response_body_json: { error: 'Invalid value for completed' },
      response_status: 400,
    });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/104', { title: 'Cook dinner', completed: null });
  });

  it('Test Case 6: Update task with completed field as string', async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: 'Invalid value for completed' },
      },
    });
    await expect(api.updateTask(105, { title: 'Call mom', completed: 'yes' })).rejects.toMatchObject({
      response_body_json: { error: 'Invalid value for completed' },
      response_status: 400,
    });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/105', { title: 'Call mom', completed: 'yes' });
  });

  it('Test Case 7: Update task with ID as string', async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: 'Invalid ID' },
      },
    });
    await expect(api.updateTask('106' as any, { title: 'Clean the house', completed: true })).rejects.toMatchObject({
      response_body_json: { error: 'Invalid ID' },
      response_status: 400,
    });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/106', { title: 'Clean the house', completed: true });
  });

  it('Test Case 8: Update task with empty task object', async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: 'Missing required fields' },
      },
    });
    await expect(api.updateTask(107, {})).rejects.toMatchObject({
      response_body_json: { error: 'Missing required fields' },
      response_status: 400,
    });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/107', {});
  });

  it('Test Case 9: Update task with network error', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));
    await expect(api.updateTask(108, { title: 'Pay bills', completed: false })).rejects.toMatchObject({
      response_body_json: { error: 'Network error' },
      response_status: null,
    });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/108', { title: 'Pay bills', completed: false });
  });

  it('Test Case 10: Update task with ID zero', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      status: 200,
      data: { completed: true, id: 0, title: 'Root task' },
    });
    const result = await api.updateTask(0, { title: 'Root task', completed: true });
    expect(result).toEqual({ completed: true, id: 0, title: 'Root task' });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/0', { title: 'Root task', completed: true });
  });

  it('Test Case 11: Update task with large ID', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      status: 200,
      data: { completed: false, id: 2147483647, title: 'Large ID Task' },
    });
    const result = await api.updateTask(2147483647, { title: 'Large ID Task', completed: false });
    expect(result).toEqual({ completed: false, id: 2147483647, title: 'Large ID Task' });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/2147483647', { title: 'Large ID Task', completed: false });
  });

  it('Test Case 12: Update task with special characters in title', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      status: 200,
      data: { completed: true, id: 110, title: '@!#%$^&*()_+' },
    });
    const result = await api.updateTask(110, { title: '@!#%$^&*()_+', completed: true });
    expect(result).toEqual({ completed: true, id: 110, title: '@!#%$^&*()_+' });
    expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/110', { title: '@!#%$^&*()_+', completed: true });
  });
});
