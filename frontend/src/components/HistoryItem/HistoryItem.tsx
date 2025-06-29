import { FC } from 'react';

import { HistoryItemType } from '@app-types/history';
import { Button } from '@ui/Button';
import { File } from '@ui/icons/File';
import { Trash } from '@ui/icons/Trash';
import { Typography } from '@ui/Typography';
import { formatDate } from '@utils/formateDate';
import cn from 'classnames';

import { FileStatus } from '../FileStatus';

import styles from './HistoryItem.module.css';

type Props = {
    item: HistoryItemType;
    onClick: (item: HistoryItemType) => void;
    onDelete: (id: string) => void;
};

// Универсальная функция для формирования data-testid по имени файла
function getSafeTestId(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9]/g, '-');
}

export const HistoryItem: FC<Props> = ({ item, onClick, onDelete }) => {
    const { timestamp, id, fileName, highlights } = item;

    const date = formatDate(timestamp);
    const hasHighlights = Boolean(highlights);
    const safeFileName = getSafeTestId(fileName);

    const handleDeleteButtonClick = () => {
        onDelete(id);
    };

    const handleItemClick = () => {
        if (!hasHighlights) {
            return;
        }

        onClick(item);
    };

    return (
        <div className={styles.root}>
            <Button
                type="button"
                variant="secondary"
                className={cn(styles.item, { [styles.disabled]: !hasHighlights })}
                aria-label={`Открыть хайлайты для ${fileName}`}
                onClick={handleItemClick}
                data-testid={`open-highlights-${safeFileName}`}
            >
                <div className={styles.fileName}>
                    <File size={40} className={styles.icon} />
                    <Typography maxRowsNumber={1} data-testid={`history-filename-${safeFileName}`}>{fileName}</Typography>
                </div>
                <Typography>{date}</Typography>
                <FileStatus type="success" isActive={hasHighlights} />
                <FileStatus type="error" isActive={!hasHighlights} />
            </Button>
            <Button
                type="button"
                variant="clear"
                className={styles.deleteButton}
                aria-label={`Удалить файл ${fileName}`}
                onClick={handleDeleteButtonClick}
                data-testid={`delete-history-file-${safeFileName}`}
            >
                <Trash size={33} />
            </Button>
        </div>
    );
};
