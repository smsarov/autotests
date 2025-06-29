import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { HistoryItem } from '@components/HistoryItem/HistoryItem';
import { Highlights } from '@app-types/common';

describe('HistoryItem', () => {
  const highlights: Highlights = {
    total_spend_galactic: 1000,
    rows_affected: 10,
    less_spent_at: 1,
    big_spent_at: 2,
    less_spent_value: 10,
    big_spent_value: 100,
    average_spend_galactic: 100,
    big_spent_civ: 'CivA',
    less_spent_civ: 'CivB',
  };
  const item = {
    id: '1',
    fileName: 'file1.csv',
    timestamp: Date.now(),
    highlights,
  };
  const onClick = vi.fn();
  const onDelete = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('отображает имя файла и дату', () => {
    render(<HistoryItem item={item} onClick={onClick} onDelete={onDelete} />);
    expect(screen.getByText('file1.csv')).toBeInTheDocument();
  });

  it('вызывает onClick при клике на элемент с хайлайтами', async () => {
    render(<HistoryItem item={item} onClick={onClick} onDelete={onDelete} />);
    const btn = screen.getByRole('button', { name: /открыть хайлайты/i });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledWith(item);
  });

  it('не вызывает onClick если нет хайлайтов', async () => {
    render(<HistoryItem item={{ ...item, highlights: undefined }} onClick={onClick} onDelete={onDelete} />);
    const btn = screen.getByRole('button', { name: /открыть хайлайты/i });
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('вызывает onDelete при клике на кнопку удаления', async () => {
    render(<HistoryItem item={item} onClick={onClick} onDelete={onDelete} />);
    const delBtn = screen.getByRole('button', { name: /удалить файл/i });
    await userEvent.click(delBtn);
    expect(onDelete).toHaveBeenCalledWith(item.id);
  });
}); 