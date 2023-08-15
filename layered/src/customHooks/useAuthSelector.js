import { useSelector } from 'react-redux';
import { selectEmail, selectUserID, selectUsername } from '../redux/slice/authSlice';


export const useAuthSelectors = () => {
  const userID = useSelector(selectUserID);
  const userName = useSelector(selectUsername);
  const email = useSelector(selectEmail);

  return { userID, userName, email };
};