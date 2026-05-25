import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import PasswordCard from './PasswordCard';
import { decryptPassword } from '../api/api';

// Mock the API module
vi.mock('../api/api', () => ({
  decryptPassword: vi.fn(),
}));

describe('PasswordCard Component', () => {
  const mockItem = {
    id: 'test-id-123',
    title: 'Google Account',
  };
  const mockOnDelete = vi.fn();
  const mockMasterKey = 'super-secret-key';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with title and hidden password', () => {
    render(<PasswordCard item={mockItem} onDelete={mockOnDelete} masterKey={mockMasterKey} />);

    expect(screen.getByText('Google Account')).toBeInTheDocument();
    expect(screen.getByText('••••••••••••')).toBeInTheDocument();
  });

  it('shows alert when trying to decrypt without a masterKey', async () => {
    render(<PasswordCard item={mockItem} onDelete={mockOnDelete} masterKey="" />);

    const decryptBtn = screen.getByTitle('Показать пароль');
    fireEvent.click(decryptBtn);

    expect(window.alert).toHaveBeenCalledWith('Кодовое слово отсутствует!');
    expect(decryptPassword).not.toHaveBeenCalled();
  });

  it('calls decryptPassword API and displays password when clicked and masterKey is present', async () => {
    decryptPassword.mockResolvedValueOnce({ decrypted_password: 'my-actual-decrypted-password' });

    render(<PasswordCard item={mockItem} onDelete={mockOnDelete} masterKey={mockMasterKey} />);

    const decryptBtn = screen.getByTitle('Показать пароль');
    fireEvent.click(decryptBtn);

    expect(decryptPassword).toHaveBeenCalledWith(mockItem.id, mockMasterKey);

    await waitFor(() => {
      expect(screen.getByText('my-actual-decrypted-password')).toBeInTheDocument();
    });
    expect(screen.queryByText('••••••••••••')).not.toBeInTheDocument();
  });

  it('shows alert on decryption API failure', async () => {
    decryptPassword.mockRejectedValueOnce(new Error('Network error'));

    render(<PasswordCard item={mockItem} onDelete={mockOnDelete} masterKey={mockMasterKey} />);

    const decryptBtn = screen.getByTitle('Показать пароль');
    fireEvent.click(decryptBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Ошибка: Network error');
    });
  });

  it('copies "Сначала расшифруйте" if password is not decrypted, and shows copy status', async () => {
    vi.useFakeTimers();
    try {
      render(<PasswordCard item={mockItem} onDelete={mockOnDelete} masterKey={mockMasterKey} />);

      const copyBtn = screen.getByTitle('Копировать');
      fireEvent.click(copyBtn);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Сначала расшифруйте');
      expect(screen.getByText('Скопировано!')).toBeInTheDocument();

      // Fast forward to reset copied status
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(screen.getByText('••••••••••••')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('copies decrypted password after successful decryption', async () => {
    decryptPassword.mockResolvedValueOnce({ decrypted_password: 'my-decrypted-password' });

    render(<PasswordCard item={mockItem} onDelete={mockOnDelete} masterKey={mockMasterKey} />);

    const decryptBtn = screen.getByTitle('Показать пароль');
    fireEvent.click(decryptBtn);

    await waitFor(() => {
      expect(screen.getByText('my-decrypted-password')).toBeInTheDocument();
    });

    const copyBtn = screen.getByTitle('Копировать');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('my-decrypted-password');
    expect(screen.getByText('Скопировано!')).toBeInTheDocument();
  });

  it('triggers onDelete callback when delete button is clicked', () => {
    render(<PasswordCard item={mockItem} onDelete={mockOnDelete} masterKey={mockMasterKey} />);

    // Since we don't have the full SVG path here, we can find the delete button by its tag or class.
    // In PasswordCard.jsx, it has: className="absolute top-2 right-2 text-neutral-400 hover:text-red-500"
    // Let's query it using a container selector or adding a role/testId if needed, but since it's the only button other than toggleVisibility and copy, or we can use container query.
    const buttons = screen.getAllByRole('button');
    // There are 3 buttons: Delete, Decrypt, Copy. Let's inspect their order or attributes.
    // The first button in the HTML is the Delete button:
    // <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="absolute top-2 right-2 ...">
    const deleteBtn = buttons[0];
    fireEvent.click(deleteBtn);

    expect(mockOnDelete).toHaveBeenCalledWith(mockItem.id);
  });
});
