import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskItem from '../../../frontend/src/components/TaskItem';

describe('TaskItem Component', () => {
  // Utility for long text
  const longText = 'A'.repeat(500);

  // Test Case 1: Render Pending Task - Default State
  it('Render Pending Task - Default State', () => {
    const task = { id: 1, title: 'Test Task', description: 'Details', completed: false };
    const onToggleComplete = jest.fn();
    render(<TaskItem task={task} onToggleComplete={onToggleComplete} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Done');
    expect(screen.getByText('Test Task')).not.toHaveStyle('text-decoration: line-through');
    expect(screen.getByTestId('task-card')).not.toHaveClass('faded');
  });

  // Test Case 2: Render Completed Task - Visual Indication
  it('Render Completed Task - Visual Indication', () => {
    const task = { id: 2, title: 'Completed Task', description: 'Done', completed: true };
    const onToggleComplete = jest.fn();
    render(<TaskItem task={task} onToggleComplete={onToggleComplete} />);
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Undo');
    expect(screen.getByText('Completed Task')).toHaveStyle('text-decoration: line-through');
    expect(screen.getByTestId('task-card')).toHaveClass('faded');
  });

  // Test Case 3: Toggle Pending Task to Complete
  it('Toggle Pending Task to Complete', () => {
    const task = { id: 3, title: 'Toggle Task', description: 'Pending', completed: false };
    const onToggleComplete = jest.fn();
    render(<TaskItem task={task} onToggleComplete={onToggleComplete} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggleComplete).toHaveBeenCalledTimes(1);
    expect(onToggleComplete).toHaveBeenCalledWith(task);
  });

  // Test Case 4: Toggle Completed Task to Pending
  it('Toggle Completed Task to Pending', () => {
    const task = { id: 4, title: 'Toggle Back', description: 'Completed', completed: true };
    const onToggleComplete = jest.fn();
    render(<TaskItem task={task} onToggleComplete={onToggleComplete} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggleComplete).toHaveBeenCalledTimes(1);
    expect(onToggleComplete).toHaveBeenCalledWith(task);
  });

  // Test Case 5: No Task Prop Provided
  it('No Task Prop Provided', () => {
    expect(() => {
      render(<TaskItem task={null as any} onToggleComplete={jest.fn()} />);
    }).not.toThrow();
    expect(() => {
      render(<TaskItem task={undefined as any} onToggleComplete={jest.fn()} />);
    }).not.toThrow();
    // Optionally check for fallback UI
    // expect(screen.queryByTestId('task-card')).not.toBeInTheDocument();
  });

  // Test Case 6: No onToggleComplete Handler Provided
  it('No onToggleComplete Handler Provided', () => {
    const task = { id: 5, title: 'No Handler', description: 'No handler', completed: false };
    render(<TaskItem task={task} />);
    const button = screen.getByRole('button');
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
  });

  // Test Case 7: Task With Long Text Details
  it('Task With Long Text Details', () => {
    const task = { id: 6, title: longText, description: longText, completed: false };
    render(<TaskItem task={task} onToggleComplete={jest.fn()} />);
    expect(screen.getByText(longText)).toBeInTheDocument();
    // Optionally check for overflow or layout issues if component exposes testable styles
  });

  // Test Case 8: Multiple Toggle Button Clicks
  it('Multiple Toggle Button Clicks', () => {
    const task = { id: 7, title: 'Multi Click', description: 'Click many', completed: false };
    const onToggleComplete = jest.fn();
    render(<TaskItem task={task} onToggleComplete={onToggleComplete} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onToggleComplete).toHaveBeenCalledTimes(3);
    expect(onToggleComplete).toHaveBeenCalledWith(task);
  });

  // Test Case 9: Button Disabled Prop (If Supported)
  it('Button Disabled Prop (If Supported)', () => {
    const task = { id: 8, title: 'Disabled', description: 'Should not toggle', completed: false };
    const onToggleComplete = jest.fn();
    render(<TaskItem task={task} onToggleComplete={onToggleComplete} buttonDisabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onToggleComplete).not.toHaveBeenCalled();
  });

  // Test Case 10: Task With Non-String Non-Numeric ID
  it('Task With Non-String Non-Numeric ID', () => {
    const ids = [null, undefined, {}, []];
    ids.forEach((id) => {
      const task = { id, title: 'Odd ID', description: 'Odd', completed: false };
      expect(() => {
        render(<TaskItem task={task} onToggleComplete={jest.fn()} />);
      }).not.toThrow();
      expect(screen.getByText('Odd ID')).toBeInTheDocument();
    });
  });
});
