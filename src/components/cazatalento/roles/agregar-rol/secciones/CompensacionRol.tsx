import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { type FC, useReducer } from 'react';
import { MContainer } from '~/components/layout/MContainer'
import MotionDiv from '~/components/layout/MotionDiv';
import { FormGroup, MCheckboxGroup, MRadioGroup, SectionTitle } from '~/components/shared'
import { MTooltip } from '~/components/shared/MTooltip'
import { type RolCompensacionForm } from '~/pages/cazatalentos/roles/agregar-rol';
import { api } from '~/utils/api';

interface Props {
    fetching: boolean,
    state: RolCompensacionForm,
    onFormChange: (input: { [id: string]: unknown }) => void
}

export const CompensacionRol: FC<Props> = ({ state, onFormChange }) => {
    const tipos_compensaciones_no_monetarias = api.catalogos.getTiposCompensacionesNoMonetarias.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    return (
        <Grid container item xs={12} mt={8}>
            <Grid item xs={12}>
                <SectionTitle
                    title='Paso 2'
                    subtitle='Compensación'
                    subtitleSx={{ ml: 4, color: '#069cb1', fontWeight: 600 }}
                    dividerSx={{ backgroundColor: '#9B9B9B' }}
                />
            </Grid>
            <Grid container item xs={12} mt={4}>
                <Grid item xs={4}>
                    <MRadioGroup
                        label='¿Se pagará un sueldo?'
                        labelStyle={{ fontSize: '1.1rem', color: '#000', fontWeight: 600 }}
                        style={{ gap: 0 }}
                        id="se-pagara-sueldo"
                        options={['Sí', 'No']}
                        value={state.se_pagara_sueldo}
                        direction='vertical'
                        onChange={(e) => {
                            onFormChange({
                                se_pagara_sueldo: e.target.value
                            })
                        }}
                    />
                </Grid>
                <Grid item xs={8}>
                    <MContainer direction='horizontal' styles={{ gap: 30 }}>
                        <FormGroup
                            //error={state.nombre.length < 2 ? 'El nombre es demasiado corto' : undefined}
                            type='number'
                            disabled={state.se_pagara_sueldo === 'No'}
                            show_error_message
                            className={'form-input-md'}
                            labelStyle={{ fontWeight: 600 }}
                            labelClassName={'form-input-label'}
                            value={
                                state.sueldo
                                    ? `${state.sueldo.cantidad_sueldo}`
                                    : ''
                            }
                            onChange={(e) => {
                                onFormChange({
                                    sueldo: {
                                        ...state.sueldo,
                                        cantidad_sueldo: parseInt(e.target.value || '0')
                                    }
                                })
                            }}
                            label='¿Cuánto?'
                        />

                        <MRadioGroup
                            label='Selecciona una'
                            disabled={state.se_pagara_sueldo === 'No'}
                            labelStyle={{ fontSize: '1.1rem', color: '#000', fontWeight: 600 }}
                            style={{ gap: 0 }}
                            id="cada-cuanto-sueldo"
                            options={['Diario', 'Mensual', 'Semanal', 'Proyecto']}
                            value={state.sueldo?.periodo_sueldo || 'Diario'}
                            direction='horizontal'
                            onChange={(e) => {
                                onFormChange({
                                    sueldo: {
                                        ...state.sueldo,
                                        periodo_sueldo: e.target.value
                                    }
                                })
                            }}
                        />
                    </MContainer>
                </Grid>
            </Grid>
            <Grid container item xs={12} mt={2}>
                <Grid item xs={4}>
                    <MRadioGroup
                        label='¿Se otorgarán compensaciones?'
                        labelStyle={{ fontSize: '1.1rem', color: '#000', fontWeight: 600 }}
                        style={{ gap: 0 }}
                        id="se-pagara-sueldo"
                        options={['Sí', 'No']}
                        value={state.se_otorgaran_compensaciones}
                        direction='vertical'
                        onChange={(e) => {
                            onFormChange({
                                se_otorgaran_compensaciones: e.target.value
                            })
                        }}
                    />
                </Grid>
                <Grid item xs={8}>
                    <MCheckboxGroup
                        disabled={state.se_otorgaran_compensaciones === 'No'}
                        title='¿Qué compensación no monetaria recibirá el talento?'
                        onChange={(e, i) => {
                            const tipo_compensacion = tipos_compensaciones_no_monetarias
                                .data?.filter((_, index) => index === i)[0];
                            if (tipo_compensacion) {
                                onFormChange({
                                    compensaciones_no_monetarias:
                                        (state.compensaciones_no_monetarias
                                            .some(cm => cm.id_compensacion === tipo_compensacion.id))
                                            ? state.compensaciones_no_monetarias
                                                .filter(e => e.id_compensacion !== tipo_compensacion.id)
                                            : [
                                                ...state.compensaciones_no_monetarias, {
                                                    id_compensacion: tipo_compensacion.id,
                                                    descripcion_compensacion: ''
                                                }]

                                })
                            }
                        }}
                        direction='horizontal'
                        id="tipos-compensaciones-no-monetarias"
                        labelClassName={'label-black-lg'}
                        options={
                            (tipos_compensaciones_no_monetarias.data)
                                ? tipos_compensaciones_no_monetarias.data.filter(e => e.id < 99).map(g => g.es)
                                : []
                        }
                        label='¿Qué compensación no monetaria recibirá el talento?'
                        labelStyle={{ fontWeight: '400', fontSize: '1.1rem', width: '45%' }}
                        values={
                            (tipos_compensaciones_no_monetarias.data)
                                ? tipos_compensaciones_no_monetarias.data.map(g => (
                                    state.compensaciones_no_monetarias
                                        ? state.compensaciones_no_monetarias
                                            .some(cm => cm.id_compensacion == g.id)
                                        : false
                                ))
                                : [false]
                        }
                    />
                    <MContainer direction='horizontal' justify='start'>
                        <FormControlLabel 
                            disabled={state.se_otorgaran_compensaciones === 'No'}
                            className={'label-black-lg'} 
                            style={{ fontWeight: '400', fontSize: '1.1rem' }}
                            label={'Otro'} 
                            control={
                                <Checkbox
                                    checked={state.compensaciones_no_monetarias.some(e => e.id_compensacion === 99)}
                                    onChange={(e) => {
                                        onFormChange({
                                            compensaciones_no_monetarias: (state.compensaciones_no_monetarias.some(c => c.id_compensacion === 99)) ? 
                                                state.compensaciones_no_monetarias.filter(c => c.id_compensacion !== 99) :
                                                state.compensaciones_no_monetarias.concat([{id_compensacion: 99, descripcion_compensacion: state.descripcion_otra_compensacion}])
                                        })
                                    }}
                                    sx={{
                                        color: '#069CB1',
                                        '&.Mui-checked': {
                                            color: '#069CB1',
                                        },
                                    }}
                                />
                            } 
                        />
                        <MotionDiv show={state.compensaciones_no_monetarias.some(e => e.id_compensacion === 99)} animation='fade'>
                            <FormGroup
                                disabled={state.se_otorgaran_compensaciones === 'No'}
                                rootStyle={{ marginTop: 16 }}
                                className={'form-input-md'}
                                value={state.descripcion_otra_compensacion}
                                onChange={(e) => {
                                    onFormChange({ 
                                        compensaciones_no_monetarias: state.compensaciones_no_monetarias.map(c => {
                                            if (c.id_compensacion === 99) {
                                                c.descripcion_compensacion = e.target.value
                                            }
                                            return c;
                                        }),
                                        descripcion_otra_compensacion: e.target.value 
                                    })
                                }}
                            />
                        </MotionDiv>
                    </MContainer>
                </Grid>
            </Grid>

            <Grid item xs={12} mt={2}>
                <FormGroup
                    //error={state.nombre.length < 2 ? 'El nombre es demasiado corto' : undefined}
                    type='number'
                    show_error_message
                    className={'form-input-md'}
                    labelStyle={{ fontWeight: 600 }}
                    labelClassName={'form-input-label'}
                    value={`${state.compensacion.suma_total_compensaciones_no_monetarias || '0'}`}
                    onChange={(e) => {
                        onFormChange({
                            compensacion: {
                                ...state.compensacion,
                                suma_total_compensaciones_no_monetarias: parseInt(e.target.value || '0')
                            }
                        })
                    }}
                    label='Suma de las compensaciones'
                    tooltip={
                        <MTooltip
                            color='orange'
                            text="Prueba"
                            placement='right'
                        />
                    }
                />
            </Grid>

            <Grid item xs={12} md={6} mt={2}>
                <FormGroup
                    type={'text-area'}
                    className={'form-input-md'}
                    style={{ width: 300 }}
                    labelStyle={{ fontWeight: 600, width: '100%' }}
                    labelClassName={'form-input-label'}
                    value={state.compensacion.datos_adicionales || ''}
                    onChange={(e) => {
                        onFormChange({
                            compensacion: {
                                ...state.compensacion,
                                datos_adicionales: e.target.value
                            }
                        })
                    }}
                    label='Datos adicionales'
                />
            </Grid>
        </Grid>
    )
}
