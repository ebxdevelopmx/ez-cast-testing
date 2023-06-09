/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { type GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import Image from 'next/image';
import { motion } from 'framer-motion'
import { MainLayout, SlideImagenesLinks } from "~/components";
import Link from "next/link";
import { api } from "~/utils/api";
import { type User } from "next-auth";
import { getSession } from "next-auth/react";
import { Carroucel } from "~/components/shared/Carroucel";
import { MContainer } from "~/components/layout/MContainer";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { TipoUsuario } from "~/enums";
import Constants from "~/constants";
import { useMemo, useRef, useState } from "react";
import { RolPreview } from "~/components/shared/RolPreview";
import { DetallesProyecto } from "~/components/proyecto/detalles";
import { MBanner } from "~/components/shared/MBanner";

type InicioPageProps = {
  user: User,
}

const InicioPage: NextPage<InicioPageProps> = ({user}) => {

  const [dialog, setDialog] = useState<{open: boolean, id_proyecto: number}>({open: false, id_proyecto: 0});

  const proyectos = api.proyectos.getProyectosRandom.useQuery(20, {
		refetchOnWindowFocus: false
	});

  const destacados = api.proyectos.getProyectosDestacados.useQuery(10, {
    refetchOnWindowFocus: false
  });

  const router = useRouter();
  
  const redirect = (user.tipo_usuario) ? (user.tipo_usuario === TipoUsuario.TALENTO) ? '/talento/dashboard' : (user.tipo_usuario === TipoUsuario.CAZATALENTOS) ? '/cazatalentos/dashboard' : '/representante/dashboard' : '';

  const container_ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <Head>
        <title>{user.tipo_usuario ? `${user.tipo_usuario?.charAt(0).toUpperCase()}${user.tipo_usuario?.substring(1, user.tipo_usuario.length).toLowerCase()} | Talent Corner` : ''}</title>
        <meta name="description" content="Talent Corner" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MainLayout menuSiempreBlanco={true}>
        <div ref={container_ref} className="container_slider_intro">
          <div>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="color_a mb-0"><b>Proyectos Activos</b></p>
                <p className="mb-5">Ahora siendo casteado…</p>
              </div>
              <div className="d-flex align-items-center">
                <Link href={redirect} style={{ textDecoration: 'none' }}>
                  <p className="mb-0 color_a mr-2">Continuar a EZ-Cast</p>
                </Link>
                <motion.img src="/assets/img/iconos/icon_next_blue.svg" alt="icon" />
              </div>
            </div>
            <div className="d-flex">
              <motion.img src="/assets/img/iconos/icon_estrella_dorada.svg" alt="icono" />
              <p className="mb-0 ml-2 h5">Destacados </p>
            </div>
          </div>
          <hr className="mb-1 hr_gold" />
          {destacados.data && destacados.data.length > 0 &&
             <Carroucel 
              arrowsColor="#F9B233"
              slidesPerView={6}>
               {destacados.data.map((proyecto, i) => {
                return <MContainer key={i} direction='vertical'>
                  <Image onClick={() => { setDialog({open: true, id_proyecto: proyecto.id}) }} style={{cursor: 'pointer'}} width={250} height={330} src={(proyecto.foto_portada) ? proyecto.foto_portada.url : '/assets/img/no-image.png'} alt="" /> 
                  <Typography onClick={() => { setDialog({open: true, id_proyecto: proyecto.id}) }} style={{cursor: 'pointer'}} align="center" variant="subtitle1">{proyecto.nombre}</Typography>
                </MContainer>
               })}
             </Carroucel>
          }
          {destacados.data && destacados.data.length === 0 &&
            <>
              <Typography fontSize={'1.5rem'} sx={{ color: '#F9B233' }} fontWeight={400}>Todavia no tienes proyectos destacados</Typography>
              <hr className="mb-5 mt-1 hr_gold" />
            </>
          }
          {container_ref.current &&
            <MBanner show_only_media width={container_ref.current.getBoundingClientRect().width} height={250} identificador="banner-cartelera-proyectos-1"/>
          }
          <p className="mt-5 h5">Ahora casteando en EZ-Cast</p>
          <hr className="hr_blue" />
          <Carroucel 
            arrowsColor="#069cb1"
            slidesPerView={6}>
              {proyectos.data && proyectos.data.map((proyecto, i) => {
                  return <MContainer key={i} direction='vertical'>
                      <Image onClick={() => { setDialog({open: true, id_proyecto: proyecto.id}) }} style={{cursor: 'pointer'}} width={250} height={330} src={(proyecto.url) ? proyecto.url : '/assets/img/no-image.png'} alt="" /> 
                      <Typography onClick={() => { setDialog({open: true, id_proyecto: proyecto.id}) }} style={{cursor: 'pointer'}} align="center" variant="subtitle1">{proyecto.nombre}</Typography>
                    </MContainer>
              })}
          </Carroucel>
          <hr className="hr_blue" />
          <div className="d-flex justify-content-end align-items-center">
            <Link href={redirect} style={{ textDecoration: 'none' }}>
              <p className="mb-0 color_a mr-2">Continuar a EZ-Cast</p>
            </Link>
            <motion.img src="/assets/img/iconos/icon_next_blue.svg" alt="" />
          </div>
        </div>
        <Dialog
            style={{
              marginTop: 56
            }}
            fullWidth={true}
            maxWidth={'md'}
            open={dialog.open}
            onClose={() => { setDialog({...dialog, open: false}) }}
        >
            <DialogContent>
                <DetallesProyecto id_proyecto={dialog.id_proyecto}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { setDialog({...dialog, open: false}) }}>Cerrar</Button>
            </DialogActions>
        </Dialog>
      </MainLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (session && session.user) {
    return {
        props: {
            user: session.user
        }
    }
  }
  return {
      redirect: {
          destination: '/',
          permanent: true,
      },
  }
}

export default InicioPage;