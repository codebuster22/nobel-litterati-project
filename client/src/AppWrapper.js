import React from 'react';
import MenuProvider from 'react-flexible-sliding-menu';
import ProfileMenu from './Components/ProfileMenu';
import App from './App';

const AppWrapper = () => 
            <MenuProvider 
                    MenuComponent={ProfileMenu} 
                    direction={'right'} 
                    width={'75%'} >
                <App />
            </MenuProvider>

export default AppWrapper;