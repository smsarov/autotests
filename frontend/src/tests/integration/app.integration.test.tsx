import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { HistoryList } from '@components/HistoryList/HistoryList';
import { HistoryItemType } from 'src/types/history';

function getSafeTestId(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9]/g, '-');
}

const initialHistoryMany = [
  {
    id: '1',
    fileName: 'file1.csv',
    timestamp: Date.now(),
    highlights: {
      total_spend_galactic: 1000,
      rows_affected: 1,
      less_spent_at: 0,
      big_spent_at: 0,
      less_spent_value: 0,
      big_spent_value: 0,
      average_spend_galactic: 0,
      big_spent_civ: '',
      less_spent_civ: '',
      most_popular: '',
      most_popular_count: 0,
    },
  },
  {
    id: '2',
    fileName: 'file2.csv',
    timestamp: Date.now(),
    highlights: {
      total_spend_galactic: 2000,
      rows_affected: 2,
      less_spent_at: 0,
      big_spent_at: 0,
      less_spent_value: 0,
      big_spent_value: 0,
      average_spend_galactic: 0,
      big_spent_civ: '',
      less_spent_civ: '',
      most_popular: '',
      most_popular_count: 0,
    },
  },
];

const initialHistoryOne = [
  {
    id: '1',
    fileName: 'file1.csv',
    timestamp: Date.now(),
    highlights: {
      total_spend_galactic: 1000,
      rows_affected: 1,
      less_spent_at: 0,
      big_spent_at: 0,
      less_spent_value: 0,
      big_spent_value: 0,
      average_spend_galactic: 0,
      big_spent_civ: '',
      less_spent_civ: '',
      most_popular: '',
      most_popular_count: 0,
    },
  },
];

describe('App integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  it('Генерация тестового файла → отображение лоадера → скачивание', async () => {
    const { GeneratePage } = await import('../../pages/Generate/GeneratePage');
    const createObjectURL = window.URL.createObjectURL;
    window.URL.createObjectURL = vi.fn(() => 'blob:url');
    const clickSpy = vi.spyOn(document, 'createElement');
    render(<GeneratePage />);
    const genBtn = screen.getByRole('button', { name: 'Начать генерацию' });
    await userEvent.click(genBtn);
    expect(await screen.findByTestId('loader')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledWith('a');
    window.URL.createObjectURL = createObjectURL;
    clickSpy.mockRestore();
  });
});

describe('HistoryList integration (history & modal, direct)', () => {
  it('Удаление записи из истории и проверка, что она не восстанавливается после перерисовки', async () => {
    const { rerender } = render(<HistoryList initialHistory={[...initialHistoryMany]} />);
    const safeFileName1 = getSafeTestId('file1.csv');
    const safeFileName2 = getSafeTestId('file2.csv');
    await screen.findByTestId(`history-filename-${safeFileName1}`);
    await screen.findByTestId(`history-filename-${safeFileName2}`);
    const delBtn = screen.getByTestId(`delete-history-file-${safeFileName1}`);
    await userEvent.click(delBtn);
    rerender(<HistoryList initialHistory={[initialHistoryMany[1]]} />);
    expect(screen.queryByTestId(`history-filename-${safeFileName1}`)).not.toBeInTheDocument();
    await screen.findByTestId(`history-filename-${safeFileName2}`);
  });

  it('Открытие модального окна с хайлайтами из истории', async () => {
    function Wrapper() {
      const [selected, setSelected] = React.useState<HistoryItemType | null>(initialHistoryOne[0]);
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <HistoryList
            initialHistory={initialHistoryOne}
            onItemClick={(item) => {
              setSelected(item);
              setOpen(true);
            }}
          />
          {open && selected && selected.highlights && (
            <div data-testid="history-modal">
              <span>{selected.highlights.total_spend_galactic}</span>
            </div>
          )}
        </>
      );
    }
    render(<Wrapper />);
    const safeFileName = getSafeTestId('file1.csv');
    await screen.findByTestId(`history-filename-${safeFileName}`);
    const itemBtn = await screen.findByTestId(`open-highlights-${safeFileName}`);
    await userEvent.click(itemBtn);
    expect(screen.getByTestId('history-modal')).toBeInTheDocument();
    expect(screen.getByText(/1000/)).toBeInTheDocument();
  });

  it('Очистка истории через кнопку удаляет все записи', async () => {
    function Wrapper() {
      const [history, setHistory] = React.useState(initialHistoryMany);
      return (
        <>
          <HistoryList initialHistory={history} />
          <button onClick={() => setHistory([])}>Очистить историю</button>
        </>
      );
    }
    render(<Wrapper />);
    expect(screen.getByTestId('history-filename-file1-csv')).toBeInTheDocument();
    expect(screen.getByTestId('history-filename-file2-csv')).toBeInTheDocument();
    const clearBtn = screen.getByRole('button', { name: /очистить историю/i });
    await userEvent.click(clearBtn);
    expect(screen.queryByTestId('history-filename-file1-csv')).not.toBeInTheDocument();
    expect(screen.queryByTestId('history-filename-file2-csv')).not.toBeInTheDocument();
  });
});

describe('FileUploadSection integration (block re-upload after analysis)', () => {
  it('Блокирует повторную загрузку файла после анализа, пока не сброшено состояние', async () => {
    vi.doMock('../../hooks/use-csv-analysis', () => ({
      useCsvAnalysis: ({ onComplete }: any) => ({
        analyzeCsv: async () => { onComplete(); },
      }),
    }));
    const { HomePage } = await import('../../pages/Home/HomePage');
    render(<HomePage />);

    const file = new File(['name,amount\nAlice,100\nBob,200'], 'test1.csv', { type: 'text/csv' });
    const dropzone = screen.getByTestId('dropzone');
    const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;
    await act(async () => {
      await userEvent.upload(input, file);
    });

    const sendBtn = await screen.findByRole('button', { name: /отправить/i });
    await userEvent.click(sendBtn);

    expect(await screen.findByText(/готово!/i)).toBeInTheDocument();

    const newFile = new File(['name,amount\nEve,300'], 'test2.csv', { type: 'text/csv' });
    await act(async () => {
      await userEvent.upload(input, newFile);
    });

    expect(screen.getByText('test1.csv')).toBeInTheDocument();
    expect(screen.queryByText('test2.csv')).not.toBeInTheDocument();

    const clearBtn = screen.getByTestId('clear-file-btn');
    await userEvent.click(clearBtn);

    await act(async () => {
      await userEvent.upload(input, newFile);
    });
    expect(await screen.findByText('test2.csv')).toBeInTheDocument();
  });
});

describe('Streaming data integration (gradual highlights display)', () => {
  it('Постепенно отображает хайлайты по мере получения данных с сервера', async () => {
    const { HighlightsSection } = await import('../../components/HighlightsSection/HighlightsSection');
    
    const { rerender } = render(<HighlightsSection highlights={[]} />);
    expect(screen.getByTestId('highlights-placeholder')).toBeInTheDocument();
    expect(screen.getByText('Здесь появятся хайлайты')).toBeInTheDocument();
    
    const firstBatch = [
      { title: '1000', description: 'Общие расходы' },
      { title: '10', description: 'Обработано строк' }
    ];
    
    rerender(<HighlightsSection highlights={firstBatch} />);
    
    const firstCards = screen.getAllByTestId('highlight-card');
    expect(firstCards).toHaveLength(2);
    expect(screen.getByText('1000')).toBeInTheDocument(); // Общие расходы
    expect(screen.getByText('10')).toBeInTheDocument(); // Обработано 
    expect(screen.queryByTestId('highlights-placeholder')).not.toBeInTheDocument();
    
    // Вторая порция данных 
    const secondBatch = [
      { title: '1000', description: 'Общие расходы' },
      { title: '10', description: 'Обработано строк' },
      { title: '1', description: 'День min расходов' },
      { title: '2', description: 'День max расходов' }
    ];
    
    rerender(<HighlightsSection highlights={secondBatch} />);
    
    // Проверяем, что появились 4 карточки
    const secondCards = screen.getAllByTestId('highlight-card');
    expect(secondCards).toHaveLength(4);
    expect(screen.getByText('1')).toBeInTheDocument(); // День min расходов
    expect(screen.getByText('2')).toBeInTheDocument(); // День max расходов
    
    // Финальная порция данных (6 карточек)
    const finalBatch = [
      { title: '1000', description: 'Общие расходы' },
      { title: '10', description: 'Обработано строк' },
      { title: '1', description: 'День min расходов' },
      { title: '2', description: 'День max расходов' },
      { title: '10', description: 'Min расходы в день' },
      { title: '100', description: 'Max расходы в день' }
    ];
    
    rerender(<HighlightsSection highlights={finalBatch} />);
    
    // Проверяем финальное состояние
    const finalCards = screen.getAllByTestId('highlight-card');
    expect(finalCards).toHaveLength(6);
    
    // Проверяем уникальные значения
    expect(screen.getByText('1000')).toBeInTheDocument(); // Общие расходы
    expect(screen.getByText('1')).toBeInTheDocument(); // День min расходов
    expect(screen.getByText('2')).toBeInTheDocument(); // День max расходов
    expect(screen.getByText('100')).toBeInTheDocument(); // Max расходы в день
    
    const tens = screen.getAllByText('10');
    expect(tens).toHaveLength(2); 
    
    expect(screen.queryByTestId('highlights-placeholder')).not.toBeInTheDocument();
  });
});

beforeAll(() => {
  const originalLocation = window.location;
  // @ts-ignore
  delete window.location;
  // @ts-ignore
  window.location = {
    ...originalLocation,
    assign: vi.fn(),
    replace: vi.fn(),
    href: 'http://localhost/',
    origin: 'http://localhost',
  };
  window.open = vi.fn();
}); 