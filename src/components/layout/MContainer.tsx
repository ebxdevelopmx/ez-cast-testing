import type { CSSProperties, FC } from 'react'

interface Props {
    direction: 'horizontal' | 'vertical',
    justify?: 'start' | 'end' | 'space-between',
    children: JSX.Element | JSX.Element[],
    styles?: CSSProperties,
    className?: string
}

export const MContainer: FC<Props>  = ({ direction, justify,  children, styles, className }) => {
    return (
        <div className={className} style={{
            display: 'flex', 
            justifyContent: (justify) ? justify : 'start',
            flexDirection: (direction === 'horizontal') ? 'row' : 'column', 
            flexWrap: 'wrap', 
            ...styles}}>
            {children}
        </div>
    )
}