import { Box, Button, Divider, Grid, Skeleton, Typography } from "@mui/material";
import Head from "next/head";
import Image from 'next/image';
import { Alertas, MainLayout, MenuLateral } from "~/components";


const AgendaVirtual = () => {
    return (
        <>
            <Head>
				<title>Cazatalentos | Talent Corner</title>
				<meta name="description" content="Talent Corner" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

            <MainLayout menuSiempreBlanco={true}>
                <div className="d-flex wrapper_ezc">
					<MenuLateral />
                    <div className="seccion_container col" style={{ paddingTop: 0 }}>
						<br /><br />
						<div className="container_box_header">
							<div className="d-flex justify-content-end align-items-start py-2">
								<Alertas />
							</div>
							<Grid container>
								
                                <Grid item xs={12}>
                                    <Grid container item columns={12}>
                                        <Grid item md={1} textAlign={'center'}>
                                            <Image src="/assets/img/iconos/agenda.svg" width={50} height={50} style={{margin: '15px 0 0 0', filter: 'invert(43%) sepia(92%) saturate(431%) hue-rotate(140deg) brightness(97%) contrast(101%)'}} alt="" />
                                        </Grid>
                                        <Grid item md={11}>
                                            <Typography fontWeight={800} sx={{ color: '#069cb1', fontSize: '2rem' }}>Agenda Virtual</Typography>
                                            <Typography fontWeight={600} sx={{ color: '#000', fontSize: '`.7rem' }}>Horarios</Typography>
                                        </Grid>
                                        
                                    </Grid>
								</Grid>
								<Grid item xs={12}>
                                <Grid container item xs={20} sx={{ backgroundColor: '#fff', padding: '10px 10px' }} columns={18}>
                                        <Grid item md={4} textAlign={'center'}>
                                             
                                        </Grid>
                                        <Grid item md={1} textAlign={'center'}>
                                             
                                        </Grid>
                                        <Grid item md={4} textAlign={'center'}>
                                            
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            Pendientes
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            Confirmados
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            No confirmados
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            Reagendados
                                        </Grid>
                                        <Grid item md={1} textAlign={'center'}>
                                            
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={18} sx={{ backgroundColor: '#069cb1', padding: '16px 10px', margin: '0 0 16px 0' }} columns={18}>
                                        <Grid item md={4} textAlign={'center'}>
                                            Nombre
                                        </Grid>
                                        <Grid item md={1} textAlign={'center'}>
                                            Roles
                                        </Grid>
                                        <Grid item md={4} textAlign={'center'}>
                                            Fecha de creación
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            <Image src="/assets/img/iconos/relojdearena.svg" width={20} height={20} style={{filter : 'invert(1)'}} alt="" />
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            <Image src="/assets/img/iconos/check-k.svg" width={20} height={20} style={{filter : 'invert(1)'}} alt="" />
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            <Image src="/assets/img/iconos/tache.svg" width={20} height={20} style={{filter : 'invert(1)'}} alt="" />
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            <Image src="/assets/img/iconos/reloj.svg" width={20} height={20} style={{filter : 'invert(1)'}} alt="" />
                                        </Grid>
                                        <Grid item md={1} textAlign={'right'}>
                                            
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={20} sx={{ backgroundColor: '#069cb185', padding: '5px 10px', margin: '4px 0' }} columns={18}>
                                        <Grid item md={4} textAlign={'center'}>
                                            Audición Corto
                                        </Grid>
                                        <Grid item md={1} textAlign={'center'}>
                                            2
                                        </Grid>
                                        <Grid item md={4} textAlign={'center'}>
                                            07/09/21
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            9
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            1
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            1
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            2
                                        </Grid>
                                        <Grid item md={1} textAlign={'right'}>
                                            <Image src="/assets/img/iconos/kebab-menu-k.svg" width={20} height={20} style={{filter : 'invert(1)'}} alt="" />
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={20} sx={{ backgroundColor: '#ea9d2185', padding: '5px 10px', margin: '4px 0' }} columns={18}>
                                        <Grid item md={4} textAlign={'center'}>
                                            Callback Corto
                                        </Grid>
                                        <Grid item md={1} textAlign={'center'}>
                                            1
                                        </Grid>
                                        <Grid item md={4} textAlign={'center'}>
                                            07/09/21
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            9
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            1
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            1
                                        </Grid>
                                        <Grid item md={2} textAlign={'center'}>
                                            2
                                        </Grid>
                                        <Grid item md={1} textAlign={'right'}>
                                            <Image src="/assets/img/iconos/kebab-menu-k.svg" width={20} height={20} style={{filter : 'invert(1)'}} alt="" />
                                        </Grid>
                                    </Grid>
								</Grid>
							</Grid>
						</div>
					</div>
                </div>
            </MainLayout>
        </>

    )
}

export default AgendaVirtual