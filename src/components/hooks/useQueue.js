import { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../firebase/firebaseConfig';
import 'firebase/firestore';

const useQueue = () => {
  const firebase = useContext(FirebaseContext);
  const db = firebase.firestore();
  const [queueLength, setQueueLength] = useState();
  const [nextQueue, setNextQueue] = useState();
  const [lastServed, setLastServed] = useState('');

  useEffect(() => {
    // Get total queue size
    const fetchData = async () => {
      db.collection('queue')
        .where('status', 'in', ['pending', 'notified'])
        .onSnapshot(
          (querySnapshot) => {
            setQueueLength(querySnapshot.size);
            //setLoading(false);
          },
          (err) => {
            console.log(err);
          }
        );

      db.collection('queue')
        .where('status', 'in', ['pending', 'notified'])
        .limit(1)
        .onSnapshot(
          (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              setNextQueue(doc.id);
            });
          },
          (err) => {
            console.log(err);
          }
        );

      db.collection('queue')
        .where('status', '==', 'served')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot(
          (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              setLastServed(doc.data().number);
            });
          },
          (err) => {
            console.log(err);
          }
        );
    };

    fetchData();
  }, [queueLength, nextQueue, lastServed, db]);

  return { queueLength, nextQueue, lastServed };
};

export default useQueue;
