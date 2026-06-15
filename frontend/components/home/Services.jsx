/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

import React from 'react';
import { v4 as uniqueId } from 'uuid';
import services from '../../data/service';
import Title from './Title';

function Services() {
  return (
    <section className='services'>
      <Title title='services' />

      <div className='services-center'>
        {services?.map((item) => (
          <article key={uniqueId()} className='services'>
            <span>{item.icon}</span>
            <h6>{item.title}</h6>
            <p>{item.info}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Services;
