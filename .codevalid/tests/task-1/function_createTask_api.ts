import { createTask } from '../../frontend/src/api';
import fetchMock from 'jest-fetch-mock';

describe('api.createTask', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // Helper to auto-generate ID in response
  const withAutoId = (body: any) => ({ ...body, id: 'auto_generated_id' });

  it('Create Task with Valid Data', async () => {
    const requestBody = {
      category: 'Shopping',
      completed: false,
      description: 'Get milk, eggs, and bread',
      due_date: '2024-06-30',
      priority: 'high',
      title: 'Buy groceries',
    };
    const responseBody = withAutoId(requestBody);
    fetchMock.mockResponseOnce(JSON.stringify(responseBody), { status: 200 });
    const result = await createTask(requestBody);
    expect(result).toEqual(responseBody);
  });

  it('Create Task with Missing Required Title', async () => {
    const requestBody = {
      category: 'Work',
      completed: false,
      description: 'Prepare slides for meeting',
      due_date: '2024-07-01',
      priority: 'medium',
    };
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: 'Title is required' }),
      { status: 400, statusText: 'Bad Request' }
    );
    await expect(createTask(requestBody)).rejects.toThrow('400 Bad Request');
  });

  it('Create Task with Empty Title', async () => {
    const requestBody = {
      category: 'Misc',
      completed: false,
      description: 'Empty title test',
      due_date: '2024-07-02',
      priority: 'low',
      title: '',
    };
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: 'Title must not be empty' }),
      { status: 400, statusText: 'Bad Request' }
    );
    await expect(createTask(requestBody)).rejects.toThrow('400 Bad Request');
  });

  it('Create Task with Invalid Priority Value', async () => {
    const requestBody = {
      category: 'Work',
      completed: false,
      description: 'Priority value is not allowed',
      due_date: '2024-07-03',
      priority: 'urgent',
      title: 'Test invalid priority',
    };
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: 'Priority must be one of: low, medium, high' }),
      { status: 400, statusText: 'Bad Request' }
    );
    await expect(createTask(requestBody)).rejects.toThrow('400 Bad Request');
  });

  it('Create Task with Invalid Due Date Format', async () => {
    const requestBody = {
      category: 'Personal',
      completed: false,
      description: 'Date format should be YYYY-MM-DD',
      due_date: '30-06-2024',
      priority: 'medium',
      title: 'Test invalid date format',
    };
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: 'due_date must be in YYYY-MM-DD format' }),
      { status: 400, statusText: 'Bad Request' }
    );
    await expect(createTask(requestBody)).rejects.toThrow('400 Bad Request');
  });

  it('Create Task Omitting Optional Fields', async () => {
    const requestBody = {
      completed: false,
      due_date: '2024-07-04',
      priority: 'low',
      title: 'Read book',
    };
    const responseBody = withAutoId({
      category: '',
      completed: false,
      description: '',
      due_date: '2024-07-04',
      priority: 'low',
      title: 'Read book',
    });
    fetchMock.mockResponseOnce(JSON.stringify(responseBody), { status: 200 });
    const result = await createTask(requestBody);
    expect(result).toEqual(responseBody);
  });

  it('Create Task with Completed True', async () => {
    const requestBody = {
      category: 'School',
      completed: true,
      description: 'Assignment finished',
      due_date: '2024-07-05',
      priority: 'high',
      title: 'Finish assignment',
    };
    const responseBody = withAutoId(requestBody);
    fetchMock.mockResponseOnce(JSON.stringify(responseBody), { status: 200 });
    const result = await createTask(requestBody);
    expect(result).toEqual(responseBody);
  });

  it('Create Task with Boundary Title Length', async () => {
    const longTitle = 'T'.repeat(255);
    const requestBody = {
      category: 'Testing',
      completed: false,
      description: 'Boundary test for title length',
      due_date: '2024-07-06',
      priority: 'medium',
      title: longTitle,
    };
    const responseBody = withAutoId(requestBody);
    fetchMock.mockResponseOnce(JSON.stringify(responseBody), { status: 200 });
    const result = await createTask(requestBody);
    expect(result).toEqual(responseBody);
  });

  it('Create Task with Exceeding Title Length', async () => {
    const tooLongTitle = 'T'.repeat(256);
    const requestBody = {
      category: 'Edge',
      completed: false,
      description: 'Test exceeding title length',
      due_date: '2024-07-07',
      priority: 'low',
      title: tooLongTitle,
    };
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: 'Title must not exceed 255 characters' }),
      { status: 400, statusText: 'Bad Request' }
    );
    await expect(createTask(requestBody)).rejects.toThrow('400 Bad Request');
  });

  it('Create Task with Invalid Completed Type', async () => {
    const requestBody = {
      category: 'Testing',
      completed: 'yes',
      description: 'Completed is string',
      due_date: '2024-07-08',
      priority: 'medium',
      title: 'Invalid completed type',
    };
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: 'Completed must be a boolean' }),
      { status: 400, statusText: 'Bad Request' }
    );
    await expect(createTask(requestBody)).rejects.toThrow('400 Bad Request');
  });

  it('Create Task Server Error', async () => {
    const requestBody = {
      category: 'Server',
      completed: false,
      description: 'Simulate server failure',
      due_date: '2024-07-09',
      priority: 'high',
      title: 'Trigger server error',
    };
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, statusText: 'Internal Server Error' }
    );
    await expect(createTask(requestBody)).rejects.toThrow('500 Internal Server Error');
  });

  it('Create Task with Unexpected Field', async () => {
    const requestBody = {
      category: 'Testing',
      completed: false,
      description: 'Has unexpected field',
      due_date: '2024-07-10',
      priority: 'medium',
      title: 'Unexpected field test',
      unexpected_field: 'unexpected',
    };
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: 'Unexpected field: unexpected_field' }),
      { status: 400, statusText: 'Bad Request' }
    );
    await expect(createTask(requestBody)).rejects.toThrow('400 Bad Request');
  });

  it('Create Task with Null Values in Optional Fields', async () => {
    const requestBody = {
      category: null,
      completed: false,
      description: null,
      due_date: '2024-07-11',
      priority: 'medium',
      title: 'Task with nulls',
    };
    const responseBody = withAutoId({
      category: '',
      completed: false,
      description: '',
      due_date: '2024-07-11',
      priority: 'medium',
      title: 'Task with nulls',
    });
    fetchMock.mockResponseOnce(JSON.stringify(responseBody), { status: 200 });
    const result = await createTask(requestBody);
    expect(result).toEqual(responseBody);
  });

  it('Create Task with Future Due Date', async () => {
    const requestBody = {
      category: 'Future',
      completed: false,
      description: 'Year 2100',
      due_date: '2100-01-01',
      priority: 'low',
      title: 'Far future task',
    };
    const responseBody = withAutoId(requestBody);
    fetchMock.mockResponseOnce(JSON.stringify(responseBody), { status: 200 });
    const result = await createTask(requestBody);
    expect(result).toEqual(responseBody);
  });

  it('Create Task with Past Due Date', async () => {
    const requestBody = {
      category: 'Testing',
      completed: false,
      description: 'Due in the past',
      due_date: '2000-01-01',
      priority: 'medium',
      title: 'Past due date task',
    };
    const responseBody = withAutoId(requestBody);
    fetchMock.mockResponseOnce(JSON.stringify(responseBody), { status: 200 });
    const result = await createTask(requestBody);
    expect(result).toEqual(responseBody);
  });
});
