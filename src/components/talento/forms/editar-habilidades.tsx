import { useMemo, type FC } from 'react'
import { Accordion, AccordionSummary, Typography, AccordionDetails, Skeleton, Chip } from '@mui/material';
import { Add, ExpandMore, Remove } from '@mui/icons-material';
import { api } from '~/utils/api';
import { type TalentoFormHabilidades } from '~/pages/talento/editar-perfil';
import { MContainer } from '~/components/layout/MContainer';

interface EditarHabilidadesTalentoPageProps {
    state: TalentoFormHabilidades,
    onFormChange: (input: { [id: string]: unknown }) => void;
}

const EditarHabilidadesTalento: FC<EditarHabilidadesTalentoPageProps> = ({ onFormChange, state }) => {
    const habilidades = api.catalogos.getHabilidades.useQuery({ include_subcategories: true }, {
        refetchOnWindowFocus: false
    });
    const accordions = useMemo(() => {
        if (!habilidades.isSuccess || habilidades.isFetching) {
            return Array.from({ length: 10 }).map((n, i) => { console.log(i); return <Skeleton style={{ margin: 8 }} key={i} variant="rectangular" height={56} /> });
        }
        if (habilidades.data) {
            return habilidades.data.map((habilidad, i) => {
                let habilidades_especificas_seleccionadas_by_id: number[] | null = null;
                if (state) {
                    if (state.habilidades_seleccionadas.has(habilidad.id)) {
                        const habilidades_in_map: number[] | undefined = state.habilidades_seleccionadas.get(habilidad.id);
                        if (habilidades_in_map) {
                            habilidades_especificas_seleccionadas_by_id = habilidades_in_map;
                        } else {
                            habilidades_especificas_seleccionadas_by_id = null;
                        }
                    }
                }

                return <Accordion key={i}>
                    <AccordionSummary
                        style={{
                            color: (habilidades_especificas_seleccionadas_by_id && habilidades_especificas_seleccionadas_by_id.length > 0) ? 'white' : 'black',
                            backgroundColor: (habilidades_especificas_seleccionadas_by_id && habilidades_especificas_seleccionadas_by_id.length > 0) ? '#069cb1' : 'white',
                        }}
                        expandIcon={<ExpandMore />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography sx={{ margin: 0 }} fontSize={'1.3rem'} fontWeight={500}>{habilidad.es}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {habilidad.habilidades_especificas.map((he, j) => {
                            return <Chip
                                onClick={() => {
                                    if (state) {
                                        if (habilidades_especificas_seleccionadas_by_id) {
                                            if (habilidades_especificas_seleccionadas_by_id.includes(he.id)) {
                                                state.habilidades_seleccionadas.set(habilidad.id, habilidades_especificas_seleccionadas_by_id.filter(h => h !== he.id));
                                            } else {
                                                // si no esta lo insertamos
                                                state.habilidades_seleccionadas.set(habilidad.id, habilidades_especificas_seleccionadas_by_id.concat([he.id]));
                                            }
                                        } else {
                                            state.habilidades_seleccionadas.set(habilidad.id, [he.id]);
                                        }
                                        onFormChange({ habilidades_seleccionadas: new Map(state.habilidades_seleccionadas) });
                                    }
                                }}
                                icon={(habilidades_especificas_seleccionadas_by_id && habilidades_especificas_seleccionadas_by_id.includes(he.id)) ? <Remove style={{ color: 'white' }} /> : <Add style={{ color: '#069cb1' }} />}
                                key={j}
                                label={he.es}
                                style={{
                                    margin: 4,
                                    fontWeight: 800,
                                    color: (habilidades_especificas_seleccionadas_by_id && habilidades_especificas_seleccionadas_by_id.includes(he.id)) ? 'white' : '#069cb1',
                                    borderColor: (habilidades_especificas_seleccionadas_by_id && habilidades_especificas_seleccionadas_by_id.includes(he.id)) ? 'black' : '#069cb1',
                                    backgroundColor: (habilidades_especificas_seleccionadas_by_id && habilidades_especificas_seleccionadas_by_id.includes(he.id)) ? '#069cb1' : 'white'
                                }}
                                variant="outlined"
                            />
                        })}
                    </AccordionDetails>
                </Accordion>
            })
        }
        return [<Typography key={1} fontSize={'1.2rem'} fontWeight={600} component={'p'}>
            No hay registros en el catalogo de habilidades
        </Typography>]


    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [habilidades.isSuccess, habilidades.isFetching, habilidades.data, state]);
    return (
        <MContainer direction='vertical'>
            {accordions.map(a => a)}
        </MContainer>
    );
}


export default EditarHabilidadesTalento;