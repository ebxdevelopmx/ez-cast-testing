
import { Checkbox, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup, Skeleton, Typography } from '@mui/material';
import type { ChangeEventHandler, CSSProperties, FC, HTMLInputTypeAttribute } from 'react'
import { MContainer } from '../layout/MContainer';
import { MTooltip } from './MTooltip';

interface Props {
    id: string,
    label?: string,
    options: string[],
    onChange?: (e: boolean, i: number) => void;
    values: boolean[];
    style?: CSSProperties,
    labelStyle?: CSSProperties,
    labelClassName?: string,
    onAllOptionChecked?: (cheked: boolean) => void,
    title?: string,
    titleStyle?: CSSProperties,
    direction?: 'vertical' | 'horizontal'
    loading?: boolean,
    fontWeight?: number,

    textTooltip?: string,
    styleTooltip?: CSSProperties,
    colorTooltip?: 'orange' | 'blue',
    disabled?: boolean,
}

export const MCheckboxGroup: FC<Props> = ({
    disabled, direction, title, titleStyle, onAllOptionChecked, labelClassName, id, onChange, values, labelStyle,
    style, options, fontWeight, textTooltip, styleTooltip = {}, colorTooltip = 'orange', loading
}) => {
    const elements_count = (options.length > 0) ? options.length : 5;
    return (
        <div>
            {title &&
                <Typography fontSize={'1.2rem'} fontWeight={fontWeight || 600} style={titleStyle} component={'p'}>
                    {title}
                    {textTooltip && <MTooltip sx={styleTooltip} text={textTooltip} color={colorTooltip} placement='right' />}
                </Typography>
            }
            {loading &&
                Array.from({length: elements_count}).map((s, i) => {
                    return <Skeleton key={i} style={style}></Skeleton>; 
                })
            }
            {!loading && onAllOptionChecked &&
                <FormGroup id={id}>
                    <MContainer direction='vertical'>
                        <FormControlLabel
                            className={labelClassName}
                            style={labelStyle}
                            control={
                                <Checkbox
                                    disabled={(disabled)}
                                    onChange={(e) => { onAllOptionChecked(e.target.checked) }}
                                    style={style}
                                    sx={{
                                        color: '#069CB1',
                                        '&.Mui-checked': {
                                            color: '#069CB1',
                                        },
                                    }}
                                />
                            }
                            label={'Seleccionar todos'} />
                        <Divider style={{ margin: 8 }} />
                    </MContainer>
                </FormGroup>
            }
            {!loading &&
                <FormGroup id={id}>
                    <MContainer direction={(direction) ? direction : 'vertical'}>

                        {options.map((e, i) => {
                            const value = values[i];
                            return <FormControlLabel className={labelClassName} style={labelStyle} key={i}
                                control={
                                    <Checkbox
                                        disabled={(disabled)}
                                        checked={(value && value === true) ? value : false}
                                        onChange={onChange ? (e) => onChange(e.target.checked, i) : () => { console.log('nothing'); }}
                                        style={style}
                                        sx={{
                                            color: '#069CB1',
                                            '&.Mui-checked': {
                                                color: '#069CB1',
                                            },
                                        }}
                                    />
                                } label={e} />
                        })}
                    </MContainer>
                </FormGroup>
            }
        </div>
    )
}
