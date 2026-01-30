import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskItem from '../../../frontend/src/components/TaskItem';

// Mock window.confirm globally
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn();
});

afterEach(() => {
  window.confirm = originalConfirm;
  jest.clearAllMocks();
});

describe('TaskItem.handleDelete', () => {
  // Test Case 1: Delete confirmed calls onDelete with correct ID
  it('Delete confirmed calls onDelete with correct ID', () => {
    const onDelete = jest.fn();
    window.confirm = jest.fn(() => true);
    render(<TaskItem task={{ id: 42, name: 'Test Task' }} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(42);
  });

  // Test Case 2: Delete cancelled does not call onDelete
  it('Delete cancelled does not call onDelete', () => {
    const onDelete = jest.fn();
    window.confirm = jest.fn(() => false);
    render(<TaskItem task={{ id: 1, name: 'Test Task' }} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  // Test Case 3: Delete button is rendered
  it('Delete button is rendered', () => {
    render(<TaskItem task={{ id: 2, name: 'Test Task' }} onDelete={jest.fn()} />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  // Test Case 4: Multiple clicks only trigger handler once per confirmation
  it('Multiple clicks only trigger handler once per confirmation', () => {
    const onDelete = jest.fn();
    window.confirm = jest.fn(() => true);
    render(<TaskItem task={{ id: 3, name: 'Test Task' }} onDelete={onDelete} />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    fireEvent.click(deleteBtn);
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledTimes(3);
    expect(onDelete).toHaveBeenNthCalledWith(1, 3);
    expect(onDelete).toHaveBeenNthCalledWith(2, 3);
    expect(onDelete).toHaveBeenNthCalledWith(3, 3);
  });

  // Test Case 5: Handles missing onDelete handler gracefully
  it('Handles missing onDelete handler gracefully', () => {
    window.confirm = jest.fn(() => true);
    render(<TaskItem task={{ id: 4, name: 'Test Task' }} />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    expect(() => fireEvent.click(deleteBtn)).not.toThrow();
  });

  // Test Case 6: Handles invalid task ID
  it('Handles invalid task ID', () => {
    const onDelete = jest.fn();
    window.confirm = jest.fn(() => true);
    render(<TaskItem task={{ id: null, name: 'Test Task' }} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(null);
  });

  // Test Case 7: Confirmation dialog appears on Delete
  it('Confirmation dialog appears on Delete', () => {
    window.confirm = jest.fn(() => true);
    render(<TaskItem task={{ id: 5, name: 'Test Task' }} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(window.confirm).toHaveBeenCalled();
  });

  // Test Case 8: Delete button is disabled when loading
  it('Delete button is disabled when loading', () => {
    render(<TaskItem task={{ id: 6, name: 'Test Task' }} onDelete={jest.fn()} loading={true} />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    expect(deleteBtn).toBeDisabled();
  });

  // Test Case 9: Delete button is accessible
  it('Delete button is accessible', () => {
    render(<TaskItem task={{ id: 7, name: 'Test Task' }} onDelete={jest.fn()} />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    expect(deleteBtn).toHaveAttribute('aria-label');
    expect(deleteBtn.getAttribute('aria-label')?.toLowerCase()).toContain('delete');
  });

  // Test Case 10: Delete button not rendered for unauthorized user
  it('Delete button not rendered for unauthorized user', () => {
    render(<TaskItem task={{ id: 8, name: 'Test Task' }} onDelete={jest.fn()} canDelete={false} />);
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});
