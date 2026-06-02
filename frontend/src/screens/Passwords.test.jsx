import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Passwords from './Passwords';
import { getPasswords, deletePassword } from '../api/api';

// Mock the API module
vi.mock('../api/api', () => ({
  getPasswords: vi.fn(),
  deletePassword: vi.fn(),
}));

// Mock the PasswordCard component to isolate screen testing
vi.mock('../components/PasswordCard', () => ({
  default: ({ item, onDelete, masterKey }) => (
    <div data-testid="mock-password-card">
      <span>MockCard: {item.title}</span>
      <button onClick={() => onDelete(item.id)}>Delete {item.id}</button>
      <span>Key: {masterKey}</span>
    </div>
  ),
}));

describe('Passwords Screen Component', () => {
  const mockSetScreen = vi.fn();
  const mockSetMasterKey = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the master key prompt modal when masterKey is not provided', () => {
    render(
      <Passwords
        setScreen={mockSetScreen}
        masterKey=""
        setMasterKey={mockSetMasterKey}
      />
    );

    expect(screen.getByText('Доступ к паролям')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Кодовое слово')).toBeInTheDocument();
  });

  it('alerts if user tries to submit empty master key in modal', () => {
    render(
      <Passwords
        setScreen={mockSetScreen}
        masterKey=""
        setMasterKey={mockSetMasterKey}
      />
    );

    const submitBtn = screen.getByText('Войти');
    fireEvent.click(submitBtn);

    expect(window.alert).toHaveBeenCalledWith('Пожалуйста, введите кодовое слово');
    expect(mockSetMasterKey).not.toHaveBeenCalled();
  });

  it('submits tempMasterKey and calls setMasterKey when valid word is entered', () => {
    render(
      <Passwords
        setScreen={mockSetScreen}
        masterKey=""
        setMasterKey={mockSetMasterKey}
      />
    );

    const input = screen.getByPlaceholderText('Кодовое слово');
    fireEvent.change(input, { target: { value: 'user-master-key' } });

    const submitBtn = screen.getByText('Войти');
    fireEvent.click(submitBtn);

    expect(mockSetMasterKey).toHaveBeenCalledWith('user-master-key');
  });

  it('navigates back to generator when click back button in modal', () => {
    render(
      <Passwords
        setScreen={mockSetScreen}
        masterKey=""
        setMasterKey={mockSetMasterKey}
      />
    );

    const backBtn = screen.getAllByText('Назад')[0];
    fireEvent.click(backBtn);

    expect(mockSetScreen).toHaveBeenCalledWith('generator');
  });

  it('fetches and displays passwords when masterKey is present', async () => {
    const mockPasswords = [
      { id: '1', title: 'Work Gmail' },
      { id: '2', title: 'Personal Github' },
    ];
    getPasswords.mockResolvedValueOnce({ passwords: mockPasswords });

    render(
      <Passwords
        setScreen={mockSetScreen}
        masterKey="valid-key"
        setMasterKey={mockSetMasterKey}
      />
    );

    // Shows loading state initially
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();

    // Eventually renders cards
    await waitFor(() => {
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
    });

    expect(screen.getAllByTestId('mock-password-card')).toHaveLength(2);
    expect(screen.getByText('MockCard: Work Gmail')).toBeInTheDocument();
    expect(screen.getByText('MockCard: Personal Github')).toBeInTheDocument();
  });

  it('shows empty state when no passwords returned', async () => {
    getPasswords.mockResolvedValueOnce({ passwords: [] });

    render(
      <Passwords
        setScreen={mockSetScreen}
        masterKey="valid-key"
        setMasterKey={mockSetMasterKey}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Список пуст')).toBeInTheDocument();
  });

  it('handles password delete workflow when confirmed', async () => {
    const mockPasswords = [{ id: '1', title: 'Work Gmail' }];
    getPasswords.mockResolvedValueOnce({ passwords: mockPasswords });
    deletePassword.mockResolvedValueOnce();

    render(
      <Passwords
        setScreen={mockSetScreen}
        masterKey="valid-key"
        setMasterKey={mockSetMasterKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('MockCard: Work Gmail')).toBeInTheDocument();
    });

    // Click delete on the card
    const deleteBtn = screen.getByText('Delete 1');
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('Удалить этот пароль?');
    expect(deletePassword).toHaveBeenCalledWith('1');

    // Password card should be removed from view
    await waitFor(() => {
      expect(screen.queryByText('MockCard: Work Gmail')).not.toBeInTheDocument();
      expect(screen.getByText('Список пуст')).toBeInTheDocument();
    });
  });

  it('does not delete password if user cancels confirmation', async () => {
    const mockPasswords = [{ id: '1', title: 'Work Gmail' }];
    getPasswords.mockResolvedValueOnce({ passwords: mockPasswords });
    window.confirm.mockImplementationOnce(() => false);

    render(
      <Passwords
        setScreen={mockSetScreen}
        masterKey="valid-key"
        setMasterKey={mockSetMasterKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('MockCard: Work Gmail')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByText('Delete 1');
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('Удалить этот пароль?');
    expect(deletePassword).not.toHaveBeenCalled();
    expect(screen.getByText('MockCard: Work Gmail')).toBeInTheDocument();
  });
});
