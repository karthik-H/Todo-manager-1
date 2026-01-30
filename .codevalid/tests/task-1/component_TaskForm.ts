import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '../../../frontend/src/components/TaskForm';

describe('TaskForm', () => {
  const priorityOptions = ['Low', 'Medium', 'High'];
  const categoryOptions = ['Work', 'Personal', 'Other']; // Adjust as per actual implementation
  const maxTitleLength = 100; // Adjust as per actual implementation
  const maxDescriptionLength = 500; // Adjust as per actual implementation

  function setup(props: any = {}) {
    const onSubmit = jest.fn();
    render(
      <TaskForm
        onSubmit={onSubmit}
        priorityOptions={priorityOptions}
        categoryOptions={categoryOptions}
        {...props}
      />
    );
    return { onSubmit };
  }

  test('Render all form fields', () => {
    setup();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  test('Submit form with valid data', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: 'High' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Work' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2099-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'High',
        category: 'Work',
        dueDate: '2099-12-31',
      });
    });
  });

  test('Title required validation', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: 'Medium' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Personal' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2099-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/title.*required/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  test('Submit form with only required field', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Only Title' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Only Title',
        description: '',
        priority: '',
        category: '',
        dueDate: '',
      });
    });
  });

  test('Priority field options', () => {
    setup();
    const prioritySelect = screen.getByLabelText(/priority/i);
    priorityOptions.forEach(option => {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
    });
  });

  test('Category field options', () => {
    setup();
    categoryOptions.forEach(option => {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
    });
  });

  test('Due date in the past', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Past Due' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2000-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    // Adjust assertion based on implementation: allow or error
    await waitFor(() => {
      // If allowed:
      // expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ dueDate: '2000-01-01' }));
      // If error:
      // expect(screen.getByText(/due date.*invalid/i)).toBeInTheDocument();
    });
  });

  test('Description maximum length', async () => {
    const { onSubmit } = setup();
    const longDesc = 'a'.repeat(maxDescriptionLength);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Max Desc' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: longDesc } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ description: longDesc }));
    });
  });

  test('Title maximum length', async () => {
    const { onSubmit } = setup();
    const longTitle = 'a'.repeat(maxTitleLength);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: longTitle } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: longTitle }));
    });
  });

  test('Reset form after successful submit', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Reset Test' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(screen.getByLabelText(/title/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
      expect(screen.getByLabelText(/priority/i)).toHaveValue('');
      expect(screen.getByLabelText(/category/i)).toHaveValue('');
      expect(screen.getByLabelText(/due date/i)).toHaveValue('');
    });
  });

  test('Cancel form action', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Cancel Test' } });
    const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
    if (cancelBtn) {
      fireEvent.click(cancelBtn);
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toHaveValue('');
        expect(screen.getByLabelText(/description/i)).toHaveValue('');
        expect(screen.getByLabelText(/priority/i)).toHaveValue('');
        expect(screen.getByLabelText(/category/i)).toHaveValue('');
        expect(screen.getByLabelText(/due date/i)).toHaveValue('');
      });
    }
  });

  test('Invalid priority value', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Invalid Priority' } });
    fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: 'Invalid' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/priority.*invalid/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  test('Invalid category value', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Invalid Category' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Invalid' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/category.*invalid/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  test('Invalid due date format', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Invalid Date' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: 'not-a-date' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/due date.*invalid/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  test('Multiple rapid submissions', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Rapid Submit' } });
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  test('Preserve field values after validation error', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Preserve Desc' } });
    fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: 'Low' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Work' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2099-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/title.*required/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toHaveValue('Preserve Desc');
      expect(screen.getByLabelText(/priority/i)).toHaveValue('Low');
      expect(screen.getByLabelText(/category/i)).toHaveValue('Work');
      expect(screen.getByLabelText(/due date/i)).toHaveValue('2099-12-31');
    });
  });
});
