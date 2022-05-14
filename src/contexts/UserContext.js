import auth from '@react-native-firebase/auth';
import React, {createContext, useContext, useEffect, useState} from 'react';
import database from "@react-native-firebase/database";

const userAuthContext = createContext({
    user: undefined,                // the current user's data
    dataInfo: {loginStatus: 'loading'},  // more information about the current user's data
    loginStatus: 'loading',          // the status of fetching the current user's data
    initializing: true,             // the status of checking the user's auth session
    userAuth: undefined             // the current user object
});

export const useAuth = () => useContext(userAuthContext);

export const UserProvider: React.FC = ({children}) => {
    const [userAuth, setUserAuth] = useState(() => auth().currentUser);
    const [userData, setUserData] = useState({loginStatus: 'loading'});
    const [initializing, setInitializing] = useState(userAuth === null);
    const [subscriptions, setSubscriptions] = useState([]);

    /*
        - this useEffect subscribes to firebase auth 'on auth state changed' hook
        so that when auth change happens, userAuth updates accordingly
        - we make a copy of all subscriptions so we can be sure
        to avoid memory leaks on previous realtime database subscriptions
     */
    useEffect(() => auth().onAuthStateChanged((user) => {
        let subs = subscriptions;
        subs.forEach(sub => {
            sub.off();
            subs.pop();
        });
        setSubscriptions(subs);
        setUserAuth(user);
        if (initializing) setInitializing(false);
    }), []);

    // unsubscribe from update on previous user, subscribe to new user updates
    useEffect( () => {
        updateUserInfo().catch((error) => console.log('Unsubscribe error:', error));
    }, [userAuth]);

    const updateUserInfo = async () => {
        if (userAuth === null || auth().currentUser === null) {
            setUserData({loginStatus: 'signed-out', user: null});
            await auth().signInAnonymously();
            return console.log('Signed out');
        } else {
            const userPath = '/users/' + userAuth.uid;
            const userDataRef = database().ref(userPath);

            // append this subscription to current subscriptions
            let prevSubs = subscriptions;
            prevSubs.push(userDataRef);
            setSubscriptions(prevSubs);

            return userDataRef.on('value',
                (snapshot) => {
                    if (snapshot.exists()) {
                        setUserData({
                            loginStatus: (userAuth.isAnonymous ? 'guest' : 'registered'),
                            get user() {return snapshot.val()},
                            ref: userDataRef
                        });
                    } else {
                        console.log('User DB entry not found - creating it');
                        let update = {displayName: ''};
                        if (userAuth.displayName) {
                            update = {displayName: userAuth.displayName}
                        } else if (userAuth.providerData[0] && userAuth.providerData[0].displayName) {
                            update = {displayName: userAuth.providerData[0]['displayName']}
                        }

                        userDataRef.update(update).then(() => {
                            setUserData({
                                loginStatus: (userAuth.isAnonymous ? 'guest' : 'registered'),
                                get user() {return snapshot.val()},
                                ref: userDataRef
                            });
                        });
                    }
                },
                (error) => setUserData({
                    loginStatus: 'error',
                    user: null,
                    error
                }));
        }
    }

    return (
        <userAuthContext.Provider
            value={{
                get user() {return userData.user},  // convenience function
                userData: userData,
                loginStatus: userData.loginStatus,  // convenience function
                userAuth: userAuth,
                initializing,
            }}
        >
            {children}
        </userAuthContext.Provider>
    );
}

export default useAuth;