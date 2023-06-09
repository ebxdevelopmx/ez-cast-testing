import { Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { type CSSProperties, type FC } from 'react'

interface Props {
    styles?: CSSProperties;
    onRemove?: (...args: unknown[]) => unknown;
    text: string;
}

export const Tag: FC<Props> = ({ text, styles = {}, onRemove }) => {
    return (
        <Typography sx={{
            display: 'inline',
            backgroundColor: '#069cb1',
            borderRadius: 2,
            color: '#fff',
            fontSize: 15,
            padding: '5px 10px 5px 7px',
            ...styles
        }}>
            <motion.img
                style={{
                    cursor: 'pointer',
                    filter: 'invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)',
                    marginRight: 2
                }}
                onClick={onRemove ? onRemove : () => { console.log('click'); }}
                src={'/assets/img/iconos/close.svg'}
                width={15}
                height={15}
                alt="close"
            />
            {text}
        </Typography>
    )
}
