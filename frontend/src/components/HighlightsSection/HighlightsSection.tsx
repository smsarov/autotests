import { FC } from 'react';

import { AnalysisHighlight } from '@app-types/analysis';
import { HighlightCard } from '@components/HighlightCard';
import { Typography } from '@ui/Typography';

import styles from './HighlightsSection.module.css';

type Props = {
    highlights: AnalysisHighlight[];
};

/**
 * Компонент секции с хайлайтами результатов анализа
 */
export const HighlightsSection: FC<Props> = ({ highlights }) => {
    if (highlights.length === 0) {
        return (
            <Typography size="l" className={styles.highlightsPlaceholder} data-testid="highlights-placeholder">
                Здесь появятся хайлайты
            </Typography>
        );
    }

    return (
        <div className={styles.highlightsGrid} data-testid="highlights-grid">
            {highlights.map((highlight: AnalysisHighlight, index: number) => (
                <HighlightCard key={index} highlight={highlight} />
            ))}
        </div>
    );
};
