/*
  Component that shows 
  username, 
  useraddress, 
  litter balance, 
  NBT balance
 */

import React from 'react';
import ProfileImageIcon from './ProfileImageIcon';

const UserStats = ({userName, userAddress, totalLitters, nobelBalance}) => {

    return (
          <div className={'user-stats tc'}>
              <ProfileImageIcon />
              <UserName>
                {userName}
              </UserName>
              <UserAddress>
                {userAddress}
              </UserAddress>
              <Balance
                  ch1={'Litters'}
                  cd1={totalLitters}
                  ch2={'NBTs'}
                  cd2={nobelBalance}
              />
          </div>
    )

}

export default UserStats

const UserName = (props) => 
          <h3 className={'mt-4 mb-1'} style={{wordBreak: 'break-all'}} >
              {props.children}
          </h3>

const UserAddress = (props) => 
              <p className={'fs-14 pl-3 pr-3'} style={{wordBreak: 'break-all'}}>
                {props.children}
              </p>

const Balance = ({ch1, cd1, ch2, cd2}) => 
              <div className={'d-flex flex-wrap justify-content-around'}>
                <h5 style={{wordBreak: 'break-all'}} >
                {ch1} - {cd1}
                </h5>
                <h5 style={{wordBreak: 'break-all'}} >
                {ch2} - {cd2}
                </h5>
              </div>