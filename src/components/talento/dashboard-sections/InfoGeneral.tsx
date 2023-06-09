import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Link, Skeleton, Typography } from "@mui/material";
import { MContainer } from "~/components/layout/MContainer";
import Image from 'next/image';
import { MTable } from "~/components/shared/MTable/MTable";
import { api } from '~/utils/api';
import { useMemo, useState } from 'react';
import { useRouter } from "next/router";
import MotionDiv from "~/components/layout/MotionDiv";

export const InfoGeneral = (props: { id_talento: number, read_only: boolean }) => {
    const [dialog, setDialog] = useState<{open: boolean, url: string, name: string}>({open: false, url: '', name: ''});
    const info = api.talentos.getInfoBasicaByIdTalento.useQuery({ id: props.id_talento }, {
        refetchOnWindowFocus: false,
    });
    const talento = api.talentos.getById.useQuery({ id: props.id_talento }, {
        refetchOnWindowFocus: false,
    })
    const creditos = api.talentos.getCreditosByIdTalento.useQuery({ id: props.id_talento }, {
        refetchOnWindowFocus: false,
    });
    const router = useRouter();

    const loading = info.isFetching || creditos.isFetching;
    const data = useMemo(() => {
        if (info.data) {
            console.log('info_data', info.data)
            return info.data;
        }
        return null;
    }, [info.data]);

    const redes_sociales = useMemo(() => {
        const result: { [red_social: string]: string } = {};
        if (data) {
            data.redes_sociales.forEach(red => {
                result[red.nombre] = red.url;
            })
        }
        return result;
    }, [data]);

    let image_perfil = '';
    if (talento.data) {
        const foto = talento.data.media.filter(m => m.media.identificador === `foto-perfil-talento-${props.id_talento}`)[0];
        if (foto) {
            image_perfil = foto.media.url;
        }
    }

    return (
        <>
            <Grid id="informacion-basica" container>
                <Grid item xs={12} md={5} sx={{ paddingTop: 3 }}>
                    <div style={{ position: 'relative', width: 500, aspectRatio: '500/720', maxWidth: '100%' }}>
                        <Image fill src={(image_perfil !== '') ? image_perfil : '/assets/img/no-image.png' } style={{ objectFit: 'cover' }} alt="" />
                    </div>
                </Grid>
                <Grid item xs={12} md={7} sx={{ paddingTop: 8 }}>
                    <MContainer className="ml-5" direction="vertical">
                        <MContainer styles={{ alignItems: 'baseline' }} className={`m-1`} direction="horizontal">
                            <p style={{ fontSize: 30, fontWeight: 900 }}>Información básica</p>
                            <Link href="/talento/editar-perfil" variant="button">
                                {!props.read_only &&
                                    <Button onClick={() => {
                                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                        router.push('/talento/editar-perfil?step=1')
                                    }} size='small' sx={{ textTransform: 'none', fontSize: '1.1rem' }}
                                        className='ml-2 color_a' variant="text">
                                        Editar
                                    </Button>
                                }
                            </Link>

                        </MContainer>
                        <MContainer className={`m-1`} direction="horizontal">
                            <Typography fontSize={'1.2rem'} fontWeight={300} variant="body1">{loading ? <Skeleton className="md-skeleton" /> : (data && data.info_basica && data.info_basica.union) ? (data.info_basica.union.id_union === 99) ? data.info_basica.union.descripcion : data.info_basica.union.union.es : 'N/A'}</Typography>
                        </MContainer>
                        <MContainer className={`m-1`} direction="horizontal" styles={{ alignItems: 'center' }}>
                            <p style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: 100, margin: 0 }}><span className="badge" ><Image width={32} height={32} src="/assets/img/iconos/cart_location_blue.svg" alt="" /> </span>  </p>
                            <Typography fontSize={'1.2rem'} fontWeight={300} variant="body1">{loading ? <Skeleton className="md-skeleton" /> : (data && data.info_basica) ? data.info_basica.estado_republica.es : 'N/A'}</Typography>
                        </MContainer>

                        <MContainer className={`m-1`} direction="horizontal" styles={{ alignItems: 'center' }}>
                            <p style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: 100, margin: 0 }}><span className="badge"><Image width={32} height={32} src="/assets/img/iconos/icono_web_site_blue.svg" alt="" /> </span>  </p>
                            <Typography fontSize={'1.2rem'} fontWeight={300} variant="body1">{loading ? <Skeleton className="md-skeleton" /> : (redes_sociales['pagina_web']) ? redes_sociales['pagina_web'] : 'N/A'}</Typography>
                        </MContainer>
                        <MContainer className={`m-1`} direction='vertical' styles={{ maxHeight: 100, width: 140 }}>
                            <p className="color_a" style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0, fontSize: '1.3rem', fontWeight: 600 }}><span className="badge"><Image width={32} height={32} src="/assets/img/iconos/icono_regla_blue.svg" alt="" /> </span> Medidas </p>
                            <MContainer styles={{ height: 20 }} direction="horizontal" justify="space-between">
                                <p className="color_a" style={{ fontSize: '1.2rem', fontWeight: 300 }}>Peso </p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 500 }} className="ml-4">{(data && data.info_basica) ? `${data.info_basica.peso} kg` : 'N/A'}</p>
                            </MContainer>
                            <MContainer direction="horizontal" justify="space-between" styles={{ maxHeight: 28 }}>
                                <p className="color_a" style={{ fontSize: '1.2rem', fontWeight: 300 }}>Altura </p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 500 }} className="ml-4">{(data && data.info_basica) ? `${data.info_basica.altura} m` : 'N/A'}</p>
                            </MContainer>
                        </MContainer>
                        <MContainer className="mt-2 mb-4" direction="horizontal">
                            <MotionDiv show={(data != null && data.info_basica != null && data.info_basica.id_media_cv != null)} animation="fade">
                                <Button 
                                    style={{
                                        borderRadius: 16,
                                        borderWidth: 3,
                                        width: 200,
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                        color: '#000',
                                        fontWeight: 600,
                                    }} 
                                    onClick={() => {
                                        if (data) {
                                            window.open(data.info_basica?.media?.url)
                                        }
                                    }}
                                    variant="outlined"
                                >
                                    <Image style={{ marginRight: 10 }} width={20} height={20} src="/assets/img/iconos/documento.svg" alt="" />
                                    Descargar CV
                                </Button>
                            </MotionDiv>
                        </MContainer>
                        <MContainer className={`m-1`} direction="horizontal">
                            <>
                                {redes_sociales['vimeo'] != null &&
                                    <span className="badge"><Image width={32} height={32} src="/assets/img/iconos/icon_vimeo_blue.svg" alt="" /> </span>
                                }
                                {redes_sociales['twitter'] &&
                                    <span className="badge"><Image width={32} height={32} src="/assets/img/iconos/icon_Twitwe_blue.svg" alt="" /> </span>
                                }
                                {redes_sociales['youtube'] &&
                                    <span className="badge"><Image width={32} height={32} src="/assets/img/iconos/icon_youtube_blue.svg" alt="" /> </span>
                                }
                                {redes_sociales['linkedin'] &&
                                    <span className="badge"><Image width={32} height={32} src="/assets/img/iconos/icon_linkedin_blue.svg" alt="" /> </span>
                                }
                                {redes_sociales['instagram'] &&
                                    <span className="badge"><Image width={32} height={32} src="/assets/img/iconos/icon_insta_blue.svg" alt="" /> </span>
                                }
                                {redes_sociales['imdb'] &&
                                    <span className="badge"><Image width={32} height={32} src="/assets/img/iconos/icon_imbd_blue.svg" alt="" /> </span>
                                }
                            </>
                        </MContainer>
                    </MContainer>
                </Grid>
                <Grid item xs={12}>

                    <MContainer direction="vertical" styles={{ marginTop: 40 }}>
                        <Typography sx={{ color: '#069CB1' }} fontWeight={600}>Acerca de</Typography>

                        <Typography>
                            {data?.info_basica?.biografia}
                        </Typography>
                        <div style={{ marginTop: 32 }}>
                            {creditos.isFetching && <Skeleton className="md-skeleton" />}
                            {!creditos.isFetching && !creditos.data &&
                                <Typography fontSize={'1.5rem'} sx={{ color: '#F9B233' }} fontWeight={400}>No haz capturado aun ningun credito</Typography>
                            }
                            {!creditos.isFetching && creditos.data && creditos.data.creditos.length > 0 && creditos.data.creditos.filter(c => c.destacado).length === 0 &&
                                <Typography fontSize={'1.5rem'} sx={{ color: '#F9B233' }} fontWeight={400}>Todavia no tienes creditos destacados</Typography>
                            }
                            {!creditos.isFetching && creditos.data && creditos.data.creditos.filter(c => c.destacado).length > 0 &&
                                <>

                                    <MContainer direction="horizontal" styles={{ alignItems: 'center', marginTop: 16, marginBottom: 16 }}>
                                        <Image
                                            src="/assets/img/iconos/icon_estrella_dorada.svg"
                                            width={20}
                                            height={20}
                                            alt="estrella"
                                        />
                                        <Typography sx={{ color: '#069CB1', marginLeft: 1 }} fontWeight={600}>
                                            Créditos destacados
                                        </Typography>
                                    </MContainer>
                                    <MTable
                                        backgroundColorData="#EBEBEB"
                                        alternate_colors={true}
                                        data={(creditos.data) ? creditos.data.creditos.filter(c => c.destacado).map(c => {
                                            return {
                                                tipo_video: c.titulo,
                                                rol: c.rol,
                                                nombre: c.director,
                                                anio: c.anio,
                                                accion: (!c.media) ? <></> : <MContainer direction="horizontal">
                                                    <IconButton onClick={() => {
                                                        if (c.media) {
                                                            setDialog({open: true, name: c.media.nombre, url: c.media.url})
                                                        }
                                                    }}>
                                                        <Image style={{ marginLeft: 5, cursor: 'pointer' }} src="/assets/img/iconos/play.svg" width={20} height={20} alt="" />
                                                    </IconButton>
                                                    <Typography>
                                                        {c.media.nombre}
                                                    </Typography>
                                                </MContainer>
                                            }
                                        }) : []}
                                    />
                                </>
                            }
                        </div>

                    </MContainer>
                </Grid>
            </Grid>
            <Dialog
                fullWidth={true}
                maxWidth={'md'}
                open={dialog.open}
                onClose={() => { setDialog({...dialog, open: false}) }}
            >
                <DialogTitle>{dialog.name}</DialogTitle>
                <DialogContent>
                    <video controls style={{ width: '100%' }}>
                        <source src={dialog.url} type="video/mp4" />
                        Lo sentimos tu navegador no soporta videos.
                    </video>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialog({...dialog, open: false}) }}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
