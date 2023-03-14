import styles from "./index.module.css";
import { type NextPage } from "next";
import Head from "next/head";

import { Header, Pagepiling } from "~/components";
import Script from "next/script";

const Home: NextPage = () => {


  return (
    <>
      <Head>
        <title>Talent Corner</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pagePiling.js/1.5.6/jquery.pagepiling.css" integrity="sha512-xbp9DExL/1FLDKhQIJNwoCaBjPytQcPMg82UsbBq02kckLcVzQms0+Ot54jXwuBjR6M91vaYHSmqrZlQ/nOEAQ==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </Head>

      <Header />
      <Pagepiling />

      <Script src="https://code.jquery.com/jquery-3.5.1.min.js" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pagePiling.js/1.5.6/jquery.pagepiling.min.js" />
    </>
  );
};

export default Home;
