/*
    Hamburger Menu Content
    Used to display user statistics 
    along with name.
 */

import React, {useContext} from 'react';
import {MenuContext} from 'react-flexible-sliding-menu';
import UserStats from './UserStats';
import UserStatsContext from '../UserStatsContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';

const ProfileMenu = () => {

    const {closeMenu} = useContext(MenuContext);
    const {userName, currentAccount, litterBalance, nobelBalance} = useContext(UserStatsContext);

    return (
        <div className={'tl h-100'}>
            <button className={'btn btn-lg'} onClick={closeMenu}>
                <FontAwesomeIcon icon={faTimes} />
            </button>
            <UserStats
                userName={userName}
                userAddress={currentAccount} 
                totalLitters={litterBalance} 
                nobelBalance={nobelBalance} 
                />
            <Footer />
        </div>
    )
}

export default ProfileMenu