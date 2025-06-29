import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUploadSection } from '@components/FileUploadSection/FileUploadSection';
import { vi } from 'vitest';

describe('FileUploadSection', () => {
  const file = new File(['test'], 'test.csv', { type: 'text/csv' });
  const onFileSelect = vi.fn();
  const onSend = vi.fn();
  const onClear = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('отображает Dropzone', () => {
    render(
      <FileUploadSection file={null} status="idle" error={null} onFileSelect={onFileSelect} onSend={onSend} onClear={onClear} />
    );
    expect(screen.getAllByRole('button').some(btn => btn.textContent?.match(/загрузить файл/i))).toBe(true);
  });

  it('отображает кнопку отправки когда файл выбран', () => {
    render(
      <FileUploadSection file={file} status="idle" error={null} onFileSelect={onFileSelect} onSend={onSend} onClear={onClear} />
    );
    expect(screen.getByRole('button', { name: /отправить/i })).toBeInTheDocument();
  });

  it('не отображает кнопку отправки при обработке', () => {
    render(
      <FileUploadSection file={file} status="processing" error={null} onFileSelect={onFileSelect} onSend={onSend} onClear={onClear} />
    );
    expect(screen.queryByRole('button', { name: /отправить/i })).not.toBeInTheDocument();
  });

  it('вызывает onSend при клике на кнопку отправки', async () => {
    render(
      <FileUploadSection file={file} status="idle" error={null} onFileSelect={onFileSelect} onSend={onSend} onClear={onClear} />
    );
    const sendBtn = screen.getByRole('button', { name: /отправить/i });
    await userEvent.click(sendBtn);
    expect(onSend).toHaveBeenCalled();
  });
}); 