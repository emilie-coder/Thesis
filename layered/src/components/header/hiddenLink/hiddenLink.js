import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '../../../redux/slice/authSlice';

// display the menu only when the user is logged in
const ShowOnLogin = ({children}) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isLoggedIn = useSelector(selectIsLoggedIn);

    if(isLoggedIn){
        return children;
    }
    return null;

}


export const ShowOnLogOut = ({children}) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isLoggedIn = useSelector(selectIsLoggedIn);

    if(!isLoggedIn){
        return children;
    }
    return null;

}


export default ShowOnLogin;