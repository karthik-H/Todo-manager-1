import { deleteTask } from '../../frontend/src/api';

// Use jest for mocking fetch

global.fetch = jest.fn();

describe('api.deleteTask', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('delete_task_with_valid_id', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    await expect(deleteTask('123')).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith('/tasks/123', { method: 'DELETE' });
  });

  test('delete_task_with_non_existent_id', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });
    await expect(deleteTask('9999')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledWith('/tasks/9999', { method: 'DELETE' });
  });

  test('delete_task_with_invalid_id_type', async () => {
    await expect(deleteTask(null as any)).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('delete_task_with_empty_id', async () => {
    await expect(deleteTask('')).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('delete_task_with_special_characters_id', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 400 });
    await expect(deleteTask('!@#$')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledWith('/tasks/!@#$', { method: 'DELETE' });
  });

  test('delete_task_with_network_error', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network Error'));
    await expect(deleteTask('123')).rejects.toThrow('Network Error');
    expect(fetch).toHaveBeenCalledWith('/tasks/123', { method: 'DELETE' });
  });

  test('delete_task_when_backend_returns_500', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    await expect(deleteTask('123')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledWith('/tasks/123', { method: 'DELETE' });
  });

  test('delete_task_with_string_number_id', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    await expect(deleteTask('456')).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith('/tasks/456', { method: 'DELETE' });
  });

  test('delete_task_with_very_large_id', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });
    await expect(deleteTask('999999999999999999999999')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledWith('/tasks/999999999999999999999999', { method: 'DELETE' });
  });

  test('delete_task_with_id_zero', async () => {
    // Simulate both possible outcomes
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    await expect(deleteTask('0')).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith('/tasks/0', { method: 'DELETE' });

    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(deleteTask('0')).rejects.toThrow();
    expect(fetch).toHaveBeenCalledWith('/tasks/0', { method: 'DELETE' });
  });
});
