import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn, selectUserID } from '../redux/slice/authSlice'
import { db } from '../firebase/config';
import { ref, onValue } from 'firebase/database'; // Import ref and onValue from the appropriate Firebase module


export const useProjectSelector = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userID = useSelector(selectUserID);
  const [userProjects, setUserProjects] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      const noteHashMap = db.ref(userID + "/AllUserProjects");
      noteHashMap.on('value', (snapshot) => {
        const data = snapshot.val();
        setUserProjects(data);
      });
    }
  }, [isLoggedIn, userID]);

  return userProjects;
};
