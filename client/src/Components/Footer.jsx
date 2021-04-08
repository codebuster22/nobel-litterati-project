/*
  Footer component to give details about repository
*/

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const CLIENT = process.env.REACT_APP_REPOSITORY_URL;
const PROJECT = process.env.REACT_APP_PROJECT_REPOSITORY_URL;


const Footer = () => 
        <p className={'tc footer fixed-bottom'}>
                Created with <FontAwesomeIcon icon={faHeart} className={'heart'} /> by Codebuster22.
                <br/>
                <a href={CLIENT} target="_blank" rel="noopener noreferrer">Link to Client Side Repo!</a>
                <a href={PROJECT} target="_blank" rel="noopener noreferrer">Link to Full Project Repo!</a>
        </p>

export default Footer;