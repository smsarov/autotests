import { useEffect } from 'react';
import React from 'react';

import { HistoryItemType } from '@app-types/history';
import { HistoryItem } from '@components/HistoryItem';
import { useHistoryStore } from '@store/historyStore';
import { removeFromHistory } from '@utils/storage';
import { useShallow } from 'zustand/react/shallow';

import styles from './HistoryList.module.css';

interface Props {
    onItemClick?: (item: HistoryItemType) => void;
    /** Только для тестов: если передан, используется как источник истории */
    initialHistory?: HistoryItemType[];
}

export const HistoryList: React.FC<Props> = ({ onItemClick, initialHistory }) => {
    const store = !initialHistory
        ? useHistoryStore(
            useShallow((state) => ({
                history: state.history,
                showModal: state.showModal,
                setSelectedItem: state.setSelectedItem,
                removeFromHistory: state.removeFromHistory,
                updateHistoryFromStorage: state.updateHistoryFromStorage,
            }))
        )
        : null;
    const history = initialHistory ?? store?.history;
    const showModal = initialHistory ? undefined : store?.showModal;
    const setSelectedItem = initialHistory ? undefined : store?.setSelectedItem;
    const removeFromHistory = initialHistory ? undefined : store?.removeFromHistory;
    const updateHistoryFromStorage = initialHistory ? undefined : store?.updateHistoryFromStorage;

    useEffect(() => {
        if (updateHistoryFromStorage) {
            updateHistoryFromStorage();
        }
    }, []);

    const handleItemClick = (item: HistoryItemType) => {
        if (setSelectedItem) setSelectedItem(item);
        if (showModal) showModal();
        if (onItemClick) onItemClick(item);
    };

    const handleDeleteItem = (id: string) => {
        if (removeFromHistory) {
            removeFromHistory(id);
        }
    };

    return (
        <div className={styles.list} data-testid="history-list">
            {(history ?? []).map((item) => (
                <HistoryItem key={item.id} item={item} onClick={handleItemClick} onDelete={handleDeleteItem} />
            ))}
        </div>
    );
};
