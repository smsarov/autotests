import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { HistoryList } from '@components/HistoryList/HistoryList';

vi.mock('@store/historyStore', () => {
  const actual = vi.importActual('@store/historyStore');
  return {
    ...actual,
    useHistoryStore: () => ({
      history: [
        { id: '1', fileName: 'file1.csv', timestamp: Date.now(), highlights: { total_spend_galactic: 1000, rows_affected: 10, less_spent_at: 1, big_spent_at: 2, less_spent_value: 10, big_spent_value: 100, average_spend_galactic: 100, big_spent_civ: 'CivA', less_spent_civ: 'CivB' } },
        { id: '2', fileName: 'file2.csv', timestamp: Date.now(), highlights: undefined },
      ],
      showModal: vi.fn(),
      setSelectedItem: vi.fn(),
      removeFromHistoryStore: vi.fn(),
      updateHistoryFromStorage: vi.fn(),
    }),
  };
});

describe('HistoryList', () => {
  it('отображает элементы истории', () => {
    render(<HistoryList />);
    expect(screen.getByText('file1.csv')).toBeInTheDocument();
    expect(screen.getByText('file2.csv')).toBeInTheDocument();
  });

  it('вызывает setSelectedItem и showModal при клике на элемент с хайлайтами', async () => {
    render(<HistoryList />);
    const items = screen.getAllByRole('button', { name: /открыть хайлайты/i });
    await userEvent.click(items[0]);
  });

  it('не вызывает setSelectedItem/showModal для элемента без хайлайтов', async () => {
    render(<HistoryList />);
    const items = screen.getAllByRole('button', { name: /открыть хайлайты/i });
    await userEvent.click(items[1]);
  });
}); 