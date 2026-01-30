import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskItem from '../../frontend/src/components/TaskItem';

// Helper: Minimal required task fields
const minimalTask = { id: '1', title: 'Test Task' };
const fullTask = { id: '2', title: 'Full Task', description: 'desc', completed: false };
const completedTask = { id: '3', title: 'Completed Task', completed: true };
const extraTask = { id: '4', title: 'Extra Task', foo: 'bar', baz: 123 };

// Test Case 1: Renders Task and Edit Button
test('Renders Task and Edit Button', () => {
  render(<TaskItem task={fullTask} onEdit={jest.fn()} />);
  expect(screen.getByText(fullTask.title)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
});

// Test Case 2: Edit Button Calls onEdit with Task
test('Edit Button Calls onEdit with Task', () => {
  const onEdit = jest.fn();
  render(<TaskItem task={fullTask} onEdit={onEdit} />);
  fireEvent.click(screen.getByRole('button', { name: /edit/i }));
  expect(onEdit).toHaveBeenCalledTimes(1);
  expect(onEdit).toHaveBeenCalledWith(fullTask);
});

// Test Case 3: Edit Button Not Rendered Without onEdit
test('Edit Button Not Rendered Without onEdit', () => {
  render(<TaskItem task={fullTask} />);
  expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
});

// Test Case 4: Handles Null Task Prop Gracefully
test('Handles Null Task Prop Gracefully', () => {
  expect(() => {
    render(<TaskItem task={null} onEdit={jest.fn()} />);
  }).not.toThrow();
  expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/.+/)).not.toBeInTheDocument();
});

test('Handles Undefined Task Prop Gracefully', () => {
  expect(() => {
    render(<TaskItem task={undefined} onEdit={jest.fn()} />);
  }).not.toThrow();
  expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/.+/)).not.toBeInTheDocument();
});

// Test Case 5: Multiple Edit Clicks Call onEdit Each Time
test('Multiple Edit Clicks Call onEdit Each Time', () => {
  const onEdit = jest.fn();
  render(<TaskItem task={fullTask} onEdit={onEdit} />);
  const editBtn = screen.getByRole('button', { name: /edit/i });
  fireEvent.click(editBtn);
  fireEvent.click(editBtn);
  fireEvent.click(editBtn);
  expect(onEdit).toHaveBeenCalledTimes(3);
  expect(onEdit).toHaveBeenNthCalledWith(1, fullTask);
  expect(onEdit).toHaveBeenNthCalledWith(2, fullTask);
  expect(onEdit).toHaveBeenNthCalledWith(3, fullTask);
});

// Test Case 6: Edit Button Disabled State
test('Edit Button Disabled State', () => {
  const onEdit = jest.fn();
  render(<TaskItem task={fullTask} onEdit={onEdit} disabled={true} />);
  const editBtn = screen.getByRole('button', { name: /edit/i });
  expect(editBtn).toBeDisabled();
  fireEvent.click(editBtn);
  expect(onEdit).not.toHaveBeenCalled();
});

// Test Case 7: onEdit Error Handling
test('onEdit Error Handling', () => {
  const errorFn = jest.fn(() => { throw new Error('Edit error'); });
  render(<TaskItem task={fullTask} onEdit={errorFn} />);
  const editBtn = screen.getByRole('button', { name: /edit/i });
  expect(() => fireEvent.click(editBtn)).not.toThrow();
});

// Test Case 8: No Edit Button For Completed Task
test('No Edit Button For Completed Task', () => {
  render(<TaskItem task={completedTask} onEdit={jest.fn()} />);
  expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
});

// Test Case 9: Render With Minimal Task Data
test('Render With Minimal Task Data', () => {
  render(<TaskItem task={minimalTask} onEdit={jest.fn()} />);
  expect(screen.getByText(minimalTask.title)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
});

// Test Case 10: Handles Extra Unexpected Task Fields
test('Handles Extra Unexpected Task Fields', () => {
  const onEdit = jest.fn();
  render(<TaskItem task={extraTask} onEdit={onEdit} />);
  expect(screen.getByText(extraTask.title)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /edit/i }));
  expect(onEdit).toHaveBeenCalledWith(extraTask);
});
