import auth from '@react-native-firebase/auth';
import React, {createContext, useContext, useEffect, useState} from 'react';
import database from "@react-native-firebase/database";

const userAuthContext = createContext({
    user: undefined,                // the current user's data
    dataInfo: {status: "loading"},  // more information about the current user's data
    dataStatus: "loading",          // the status of fetching the current user's data
    initializing: true,             // the status of checking the user's auth session
    userAuth: undefined             // the current user object
});

export const useUserAuth = () => useContext(userAuthContext);

export const UserProvider: React.FC = ({children}) => {
    const [userAuth, setUserAuth] = useState(() => auth().currentUser);
    const [userData, setUserData] = useState({status: 'loading'});
    const [initializing, setInitializing] = useState(userAuth === null);

    // subscribe using the firebase auth 'on auth state changed' hook
    useEffect(() => auth().onAuthStateChanged((user) => {
        if(userData.ref) {
            console.log('Unsubscribed');
            userData.ref.off();
        }
        setUserAuth(user);
        if (initializing) setInitializing(false);
    }), []);

    // unsubscribe from update on previous user, subscribe to new user updates
    useEffect( () => {
        if (initializing) return;
        updateUserInfo().catch((error) => console.log('unsubscribe error:' + error.message));
    }, [userAuth]);

    const updateUserInfo = async () => {
        if (userAuth === null || auth().currentUser === null) {
            setUserData({status: 'signed-out', user: null});
            await auth().signInAnonymously();
            return (console.log('Signed out'));
        } else {
            console.log('userRef id is: ' + userAuth.uid);
            const userDataRef = database().ref('/users/' + userAuth.uid);

            return userDataRef.on('value',
                (snapshot) => {
                    if (snapshot.exists()) {
                        setUserData({
                            status: (userAuth.isAnonymous ? 'anonymous-signed-in' : 'registered-user-signed-in'),
                            get user() {
                                return snapshot.val()
                            },
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
                                status: (userAuth.isAnonymous ? 'anonymous-signed-in' : 'registered-user-signed-in'),
                                get user() {
                                    return snapshot.val()
                                },
                                ref: userDataRef
                            });
                        });
                    }
                },
                (error) => setUserData({
                    status: 'error',
                    user: null,
                    error
                }));
        }
    }



    return (
        <userAuthContext.Provider
            value={{
                get user() {return userData.user}, // convenience function
                userData: userData,
                userStatus: userData.status,       // convenience function
                initializing,
                userAuth: userAuth
            }}
        >
            {children}
        </userAuthContext.Provider>
    );
}