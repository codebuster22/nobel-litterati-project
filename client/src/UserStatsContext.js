import {createContext} from 'react';

const defaultValue = {
    userName: '',
    userAddress: '0x00000000000000000000',
    totalLitters: 0,
    nobelBalance: 0
}
const UserStatsContext = createContext(defaultValue);

export default UserStatsContext;