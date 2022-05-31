import auth from '@react-native-firebase/auth';
import React, {createContext, useContext, useEffect, useState} from 'react';
import database from "@react-native-firebase/database";

const userAuthContext = createContext({
    user: undefined,                // the current user's data
    dataInfo: {loginStatus: 'loading'},  // more information about the current user's data
    loginStatus: 'loading',          // the status of fetching the current user's data
    userRefPath: '/users/offline',
    initializing: true,             // the status of checking the user's auth session
    userAuth: undefined             // the current user object
});

export const useAuth = () => useContext(userAuthContext);

export const UserProvider: React.FC = ({children}) => {
    const [userAuth, setUserAuth] = useState(() => auth().currentUser);
    const [userData, setUserData] = useState({loginStatus: 'offline'});
    const [userRefPath, setUserRefPath] = useState(() => '/users/offline');
    const [initializing, setInitializing] = useState(userAuth === null);
    const [subscriptions, setSubscriptions] = useState(() => []);

    useEffect(() => auth().onAuthStateChanged((user) => {
        if(!user) {
            database()
                .goOffline()
                .then(() => {
                    let subs = subscriptions;
                    subs.forEach(sub => {
                        sub.off();
                        subs.pop();
                    });
                    setSubscriptions(subs);

                    setUserAuth(null);
                    setUserRefPath('/users/offline');
                    setUserData({
                        loginStatus: 'offline',
                        user: null
                    });
                })
                .then(() => {
                    console.log('User entered offline mode');
                });
        } else {
            database()
                .goOnline()
                .then(() => {
                    console.log('User entering online mode');
                })
                .then(() => {
                    const userPath = '/users/' + user.uid;
                    const userDataRef = database().ref(userPath);

                    userDataRef.once('value', (snapshot) => {
                        console.log('user org:', snapshot.val().organization);
                        let orgID = snapshot.val().organization;
                        if(orgID) {
                            setUserRefPath('/organizations/' + orgID)
                        } else {
                            setUserRefPath(userPath);
                        }
                    }). then(() => {
                        // append this subscription to current subscriptions
                        let prevSubs = subscriptions;
                        prevSubs.push(userDataRef);
                        setSubscriptions(prevSubs);

                        setUserAuth(user);
                        return userDataRef.on('value',
                            (snapshot) => {
                                setUserData({
                                    loginStatus: 'registered',
                                    get user() {
                                        return snapshot.val()
                                    }
                                });
                            },
                            (error) => setUserData({
                                loginStatus: 'error',
                                user: null
                            }));
                    })
                })
        }

        if (initializing) setInitializing(false);
    }), []);

    return (
        <userAuthContext.Provider
            value={{
                get user() {
                    return userData.user
                },
                userData: userData,
                loginStatus: userData.loginStatus,
                userAuth: userAuth,
                userRefPath: userRefPath,
                initializing,
            }}
        >
            {children}
        </userAuthContext.Provider>
    );
}

export default useAuth;