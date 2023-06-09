import { Divider, type SxProps, Typography, Box, Skeleton, Button } from '@mui/material';
import { useMemo, type FC } from 'react'
import { MContainer } from '../layout/MContainer'
import Image from 'next/image';
import { api } from '~/utils/api';


interface Props {
    width: number,
    height: number,
    identificador: string,
    show_only_media: boolean,
    sx?: SxProps
}

export const MBanner: FC<Props> = (props) => {

    const banner = api.banners.getBannerByIdentificador.useQuery(props.identificador, {
        refetchOnWindowFocus: false
    })
    
    const banner_content = useMemo(() => {
        if (banner.isFetching) return <Skeleton width={props.width} height={props.height}/>;
        if (banner.data) {
            let position = {};
            switch (banner.data.position) {
                case 'top': position = {top: 56, left: '50%'}; break;
                case 'bottom': position = {top: '90%', left: '50%'}; break;
                case 'left': position = {top: '50%', left: 0}; break;
                case 'right': position = {top: '50%', rigth: 0}; break;
            }
            const element = (banner.data.isButton) ? <Button style={{...position}}>{banner.data.text}</Button> : <Typography style={{...position}}>{banner.data.text}</Typography>;
            return <Box width={props.width} height={props.height}>
                {!props.show_only_media && element}
                {banner.data.type.includes('image') &&
                    <Image style={{cursor: 'pointer'}} onClick={() => {window.open(banner.data?.redirect_url)}} src={banner.data.content.url} width={props.width} height={props.height} alt={props.identificador}/>
                }
                {banner.data.type.includes('video') &&
                    <video autoPlay style={{ width: props.width, height: props.height }}>
                        <source src={banner.data.content.url} type="video/mp4" />
                        Lo sentimos tu navegador no soporta videos.
                    </video>   
                }
            </Box>
        }
        return <p>Ocurrio un error al intentar cargar el banner</p> 
    }, [banner.data, banner.isFetching]);

    return (
        <Box style={{position: 'relative'}}>
            {banner_content}
        </Box>
    )
}
