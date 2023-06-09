import { Typography } from '@mui/material';
import Head from 'next/head'
import { useReducer } from 'react';
import { CuentaRepresentante, MStepper, MainLayout, ValidacionRepresentante } from '~/components';
import { InformacionBasicaRepresentante } from '~/components';
import { PermisosRepresentante } from '~/components/representante/forms/PermisosRepresentante';
import { MTooltip } from '~/components/shared/MTooltip';

type RepresentanteForm = {
    step_active: number,
}

const initialState: RepresentanteForm = {
    step_active: 1,
}

const editarPerfilRepresentanteReducer = (state: RepresentanteForm, action: { type: string, value: { [key: string]: unknown } }) => {
    switch (action.type) {
        case 'update-form': {
            return { ...state, ...action.value }
        }
        default:
            return state;
    }
}

const EditarPerfilRepresentantePage = () => {

    const [state, dispatch] = useReducer(editarPerfilRepresentanteReducer, initialState)

    return (
        <>
            <Head>
                <title>DashBoard ~ Talentos | Talent Corner</title>
                <meta name="description" content="Talent Corner" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MainLayout style={{ padding: 32, backgroundColor: '#f2f2f2', marginTop: 48, minHeight: '100vh' }} menuSiempreBlanco={true} >
                <div className={'RootContainer'} style={{ minHeight: /* ([1].includes(state.step_active)) ?  'calc(100vh - 76px)'  : */ '100%' }}>
                    <MStepper
                        onStepChange={(step: number) => {
                            dispatch({ type: 'update-form', value: { step_active: step } });
                        }}
                        onFinish={() => {
                            /* saveFiltrosApariencias.mutate({
                                ...state.filtros_apariencia,
                                hermanos: {
                                    id_tipo_hermanos: (state.filtros_apariencia.hermanos) ? state.filtros_apariencia.hermanos.id_tipo_hermanos : 0,
                                    descripcion: (state.filtros_apariencia.hermanos && state.filtros_apariencia.hermanos.id_tipo_hermanos === 99) ? state.filtros_apariencia.hermanos.descripcion : state.filtros_apariencia.tipo_hermano_selected
                                }
                            }); */
                        }}
                        current_step={state.step_active}
                        onStepSave={(step: number) => {
                            /* switch (step) {
                                case 1: {
                                    void handleInfoGral();
                                    break;
                                }

                                case 2: {
                                    void handleMedia();
                                    break;
                                }

                                case 3: {
                                    void handleCreditos();
                                    break;
                                }

                                case 4: {
                                    const ids: { id_habilidad_especifica: number, id_habilidad: number }[] = [];
                                    state.habilidades.habilidades_seleccionadas.forEach((value, key) => {
                                        value.forEach(id => {
                                            ids.push({ id_habilidad_especifica: id, id_habilidad: key });
                                        })
                                    });
                                    saveHabilidades.mutate({ ids_habilidades: ids });
                                    break;
                                }

                                case 5: {
                                    saveActivos.mutate({
                                        vehiculos: (state.activos.vehiculos) ? state.activos.vehiculos : [],
                                        mascotas: (state.activos.mascotas) ? state.activos.mascotas : [],
                                        vestuarios: (state.activos.vestuarios) ? state.activos.vestuarios : [],
                                        props: (state.activos.props) ? state.activos.props : [],
                                        equipos_deportivos: (state.activos.equipos_deportivos) ? state.activos.equipos_deportivos : []
                                    });
                                    break;
                                }
                                case 6: {
                                    savePreferencias.mutate({
                                        preferencias: state.preferencias.preferencias,
                                        tipos_trabajo: state.preferencias.tipo_trabajo,
                                        interes_en_proyectos: state.preferencias.interes_en_proyectos,
                                        locaciones: state.preferencias.locaciones,
                                        documentos: state.preferencias.documentos,
                                        disponibilidad: state.preferencias.disponibilidad,
                                        otras_profesiones: state.preferencias.otras_profesiones,
                                    })
                                    break;
                                }
                            } */
                        }}
                        step_titles={{
                            1: 'Información básica',
                            2: 'Permisos',
                            3: 'Cuenta',
                            4: 'Validación',
                        }}
                        tooltips={{
                            4: <MTooltip
                                text='Incluye todas las habilidades que te diferencien de los demás. ¡Un Cazatalentos puede estar buscando un rol con tus habilidades!'
                                color='blue'
                                placement='right'
                            />,
                        }}
                    >

                        <InformacionBasicaRepresentante />
                        <PermisosRepresentante />
                        <CuentaRepresentante />
                        <ValidacionRepresentante />
                    </MStepper>
                </div>
            </MainLayout>
        </>
    )
}

export default EditarPerfilRepresentantePage