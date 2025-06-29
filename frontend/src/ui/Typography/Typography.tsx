import { PropsWithChildren } from 'react';

import { WithClassName } from '@app-types/common';
import cn from 'classnames';

import styles from './Typography.module.css';

type Props = PropsWithChildren &
    WithClassName & {
        color?: 'dark' | 'light' | 'purple' | 'error';
        size?: 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl';
        as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        weight?: 'light' | 'regular' | 'medium' | 'bold' | 'extrabold';
        style?: 'normal' | 'italic';
        maxRowsNumber?: number;
        [key: string]: any; // для data-testid и других пропсов
    };

export const Typography = ({
    as: Component = 'span',
    size = 'm',
    weight = 'regular',
    style = 'normal',
    color = 'dark',
    children,
    maxRowsNumber,
    className,
    ...rest
}: Props) => {
    const lineClampStyle = maxRowsNumber
        ? {
              WebkitLineClamp: maxRowsNumber,
          }
        : {};

    return (
        <Component
            className={cn(
                className,
                styles[`text-size-${size}`],
                styles[`text-weight-${weight}`],
                styles[`text-style-${style}`],
                styles[`text-color-${color}`],
                { [styles.withLineClamp]: Boolean(maxRowsNumber) }
            )}
            style={{ ...lineClampStyle }}
            {...rest}
        >
            {children}
        </Component>
    );
};
