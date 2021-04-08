/*
  Top Nav Bar
  Contains app name and 
  Button to access user stats
 */

import React, {useContext} from 'react';
import {MenuContext} from 'react-flexible-sliding-menu';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBars} from '@fortawesome/free-solid-svg-icons';

const TopBar = () => {

    const {toggleMenu} = useContext(MenuContext);
    return (
            <nav className={"w-100 navbar navbar-light bg-light"}>
              <h5 className={"navbar-brand"}>Nobel Litterati</h5>
              <button className={"btn btn-lg"} onClick={toggleMenu} type={"button"}>
                <FontAwesomeIcon icon={faBars} />
              </button>
            </nav>
    )

}

export default TopBar;