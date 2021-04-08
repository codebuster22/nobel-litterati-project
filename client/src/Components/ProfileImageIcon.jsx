import React from 'react';
import {faUser} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProfileImageIcon = () => 
            <div className={'profile-image-container d-flex justify-content-center align-items-center'}>
                <FontAwesomeIcon icon={faUser} className={'profile-image-icon'} />
            </div>

export default ProfileImageIcon;