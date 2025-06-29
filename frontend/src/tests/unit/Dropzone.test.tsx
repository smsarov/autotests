import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropzone } from '@components/Dropzone/Dropzone';
import { vi } from 'vitest';

describe('Dropzone', () => {
  const file = new File(['test'], 'test.csv', { type: 'text/csv' });
  const onFileSelect = vi.fn();
  const onClear = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('отображает кнопку загрузки когда файл не выбран', () => {
    render(<Dropzone file={null} status="idle" error={null} onFileSelect={onFileSelect} onClear={onClear} />);
    expect(screen.getAllByRole('button').some(btn => btn.textContent?.match(/загрузить файл/i))).toBe(true);
  });

  it('вызывает onFileSelect при изменении input файла', async () => {
    const { container } = render(<Dropzone file={null} status="idle" error={null} onFileSelect={onFileSelect} onClear={onClear} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLElement;
    await userEvent.upload(fileInput, file);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('показывает ошибку для не-csv файла', async () => {
    const { container } = render(<Dropzone file={null} status="idle" error={null} onFileSelect={onFileSelect} onClear={onClear} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const badFile = new File(['bad'], 'bad.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [badFile] } });
    expect(screen.getByText(/можно загружать только \*\.csv файлы/i)).toBeInTheDocument();
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('показывает лоадер при обработке', () => {
    const { container } = render(<Dropzone file={file} status="processing" error={null} onFileSelect={onFileSelect} onClear={onClear} />);
    expect(container.querySelector('div[class*="loader"]')).toBeInTheDocument();
    expect(screen.getByText(/идёт парсинг файла/i)).toBeInTheDocument();
  });

  it('показывает имя файла и кнопку очистки когда файл загружен', () => {
    const { container } = render(<Dropzone file={file} status="idle" error={null} onFileSelect={onFileSelect} onClear={onClear} />);
    expect(screen.getByText('test.csv')).toBeInTheDocument();
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('вызывает onClear при клике на кнопку очистки', async () => {
    const { container } = render(<Dropzone file={file} status="idle" error={null} onFileSelect={onFileSelect} onClear={onClear} />);
    const buttons = container.querySelectorAll('button');
    const clearBtn = buttons[buttons.length - 1];
    await userEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });

  it('показывает ошибку из пропсов', () => {
    render(<Dropzone file={null} status="idle" error="Ошибка!" onFileSelect={onFileSelect} onClear={onClear} />);
    expect(screen.getByText('Ошибка!')).toBeInTheDocument();
  });

  it('показывает статус завершения', () => {
    render(<Dropzone file={file} status="completed" error={null} onFileSelect={onFileSelect} onClear={onClear} />);
    expect(screen.getByText(/готово/i)).toBeInTheDocument();
  });

  it('показывает текст перетаскивания при drag enter', () => {
    render(<Dropzone file={null} status="idle" error={null} onFileSelect={onFileSelect} onClear={onClear} />);
    const dropzone = screen.getAllByRole('button')[0];
    fireEvent.dragEnter(dropzone);
    expect(screen.getByText(/отпустите для загрузки/i)).toBeInTheDocument();
  });
}); 