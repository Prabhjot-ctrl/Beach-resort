/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

import Head from 'next/head';
import React from 'react';
import Footers from './footers';
import Navbar from './navbar';

function MainLayout({ children, title }) {
  return (
    <>
      <Head>
        <title>{title || 'Beach Resort'}</title>
        <meta name='description' content='Beach Resort ― Hotel Room Booking System' />
        <meta content='width=device-width, initial-scale=1' name='viewport' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Navbar />
      <main style={{ overflow: 'auto' }}>
        {children}
      </main>
      <Footers />
    </>
  );
}

export default MainLayout;
