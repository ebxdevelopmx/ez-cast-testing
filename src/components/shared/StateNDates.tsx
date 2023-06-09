import { type FC, type CSSProperties, useState, useEffect } from "react"
import { Box, Button, Divider, Typography } from "@mui/material"
import { MSelect } from "./MSelect/MSelect";
import { MRadioGroup } from "./MRadioGroup";
import { MContainer } from "../layout/MContainer";
import { FormGroup } from "./FormGroup";
import MotionDiv from "../layout/MotionDiv";
import { Tag } from "./Tag";
import useNotify from "~/hooks/useNotify";

interface Props {
    title?: string;
    stylesTitle?: CSSProperties;
    styleRoot?: CSSProperties;

    //select
    loadingSelect: boolean;
    optionsSelect: { value: string, label: string }[];
    nameSelect: string;
    valueSelect: string;
    onSelectChange: (value: string) => void;

    //radio
    nameRadio: string;

    //fechas
    valueFechas: {inicio: Date, fin?: Date}[];
    onAgregarFecha: (date: {inicio: Date, fin?: Date}) => void;
    onEliminarFecha: (index: number) => void;
}

export const StateNDates: FC<Props> = ({
    title,
    loadingSelect, nameSelect, optionsSelect, valueSelect,
    nameRadio,
    valueFechas,
    stylesTitle = {}, styleRoot = {},
    onSelectChange,
    onAgregarFecha,
    onEliminarFecha,
}) => {

    const [valueRadio, setValueRadio] = useState('Rango de fechas')

    const [date1, setDate1] = useState('')
    const [date2, setDate2] = useState<string | null>('')

    useEffect(() => {
        if (valueRadio === 'Individuales') {
            setDate2(null);
        }
    }, [valueRadio]);

    const {notify} = useNotify();

    return (
        <Box sx={styleRoot}>
            <Typography sx={{ fontWeight: 600, ...stylesTitle }}>{title}</Typography>
            <Box sx={{ border: '2px solid #069cb1', borderRadius: 2, padding: '10px 20px', width: 380 }}>
                <Box sx={{ marginTop: 2 }}>
                    <MSelect
                        id={nameSelect}
                        loading={loadingSelect}
                        options={optionsSelect}
                        value={valueSelect}
                        className={'form-input-md'}
                        onChange={(e) => {onSelectChange(e.target.value)}}
                        label='Ciudad/Estado:'
                    />
                </Box>
                <Box sx={{ marginTop: 2 }}>
                    <MRadioGroup
                        label='Fecha:'
                        labelStyle={{ fontSize: '1.1rem', color: '#000', fontWeight: 600 }}
                        style={{ gap: 0 }}
                        id={nameRadio}
                        options={['Rango de fechas', 'Individuales']}
                        value={valueRadio}
                        direction='vertical'
                        onChange={(e) => {
                            setValueRadio(e.target.value)
                        }}
                    />
                </Box>

                <Box sx={{ marginTop: 2 }}>
                    <Typography fontWeight={600}>Fecha:</Typography>
                    <MContainer direction="horizontal" styles={{ justifyContent: 'space-between' }}>
                        <FormGroup
                            type="date"
                            className={'form-input-md'}
                            labelStyle={{ fontWeight: 600 }}
                            labelClassName={'form-input-label'}
                            style={{ width: 130 }}
                            value={date1}
                            onChange={(e) => {
                                setDate1(e.target.value)
                            }}
                            label=''
                        />
                        <MotionDiv animation="fade" show={valueRadio === 'Rango de fechas'}>
                            <Typography>a</Typography>
                        </MotionDiv>
                        <MotionDiv animation="fade" show={valueRadio === 'Rango de fechas'}>
                            <FormGroup
                                type="date"
                                className={'form-input-md'}
                                labelStyle={{ fontWeight: 600 }}
                                labelClassName={'form-input-label'}
                                style={{ width: 130 }}
                                value={(date2) ? date2 : ''}
                                onChange={(e) => {
                                    setDate2(e.target.value)
                                }}
                                label=''
                            />
                        </MotionDiv>
                    </MContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            onClick={() => {
                                switch (valueRadio) {
                                    case 'Rango de fechas': {
                                        if (date2 != null && date2 !== '') {
                                            onAgregarFecha({inicio: new Date(date1), fin: new Date(date2)})
                                        }  else {
                                            notify('warning', 'Por favor agregar la segunda fecha antes de continuar');
                                        }
                                        break;
                                    }
                                    case 'Individuales': {
                                        if (date1 !== '') {
                                            onAgregarFecha({inicio: new Date(date1), fin: undefined})
                                        }  else {
                                            notify('warning', 'Por favor agrega una fecha valida');
                                        }
                                        break;
                                    }
                                }
                            }}
                            sx={{
                                textTransform: 'none',
                                backgroundColor: '#069cb1',
                                borderRadius: '3rem',
                                color: '#fff',
                                padding: '5px 40px',
                                '&:hover': {
                                    backgroundColor: '#03adc4',
                                    color: '#fff',
                                },
                                border: 'none',
                                outline: 'none'
                            }}
                        >
                            Agregar fecha
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ marginTop: 2 }} />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, padding: '10px 0px', maxWidth: '100%' }}>
                    {
                        valueFechas.map((fecha,i) => {
                            if (fecha.inicio) {
                                return <Tag
                                    key={i}
                                    text={`${fecha.inicio.toLocaleDateString('es-mx')}${(fecha.fin) ? ` a ${fecha.fin.toLocaleDateString('es-mx')}` : ''}`}
                                    onRemove={() => {
                                        onEliminarFecha(i);
                                    }}
                                />
                            }
                            return null;

                        })
                    }
                </Box>
            </Box>
        </Box>
    )
}
