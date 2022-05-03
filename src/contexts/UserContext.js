import auth from '@react-native-firebase/auth';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {GoogleSignin, statusCodes,} from '@react-native-google-signin/google-signin';
import database from "@react-native-firebase/database";
import {Alert} from "react-native";


const userAuthContext = createContext();

export const UserProvider : React.FC = ({ children }) => {
    const [user, setUser] = useState("Authentication has not occurred yet");
    const [userInfo, setUserInfo] = useState(null);
    const [orgInfo, setOrgInfo] = useState(null);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(updateUserInfo);
        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        /*
                if the user is not signed in on startup,
                create an anonymous user and sign them in

                this allows users to store info in the database
                without needing to register an account or sign in
        */

        if (user !== null)
            return;

        createAnonymousUser();
        return;
    }, [user]);

    const updateUserInfo = async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            // user has just been authenticated
            const userRef = database().ref('/users/' + currentUser.uid);
            userRef.once('value')
                .then((userSnapshot) => {
                    if (userSnapshot.val()) {
                        setUserInfo(userSnapshot.val());
                        //console.debug('setting user info - ');
                        //console.debug(userSnapshot.val());
                        const currentOrg = userSnapshot.val().organization;
                        if (currentOrg === undefined || currentOrg === null) {
                            setOrgInfo(null);
                        } else {
                            database().ref('organizations/' + currentOrg)
                                .once('value')
                                .then((orgSnapshot) => {
                                    setOrgInfo(orgSnapshot.val());
                                });
                        }
                    }
                });
        }
    }

    //  create a database entry for a user via their credentials
    //      initialize their assigned organization to null
    const createUserInDatabase = async (userCredentials, name) => {
        const update = (name ?
            {displayName: name, organization: null} :
            {organization: null});

        database().ref('/users/' + userCredentials.user.uid)
            .set(update).then(() => {
                return userCredentials;
            }
        );
    }

    //  create a new anonymous user and create their database entry
    //      performed when a user logs out, or when the app starts
    //      with no user credentials cached
    const createAnonymousUser = () => {
        setUser(null);
        setUserInfo(null);
        setOrgInfo(null);

        auth().signInAnonymously()
            .then((userCredentials) => {
                console.log('User signed in anonymously with uid ' + userCredentials.user.uid);
                return createUserInDatabase(userCredentials);
            }).catch(error => {
                console.error(error);
            });
    }

    //  sign up via name, email password
    //      sets the user profile with desired name and
    //      then create user entry in database
    const signUp = async (name, email, password) => {
        const success = (userCredentials) => {
            return createUserInDatabase(userCredentials, name);
        }

        if (password.length >= 6) {
            const credential = auth.EmailAuthProvider.credential(email, password);
            auth().currentUser.linkWithCredential(credential)
                .then((userCredentials) => {
                    return success(userCredentials);
                }).catch(error => {
                    if (error.code === 'auth/email-already-in-use') {
                        throw new Error('That email address is already in use');
                    } else if (error.code === 'auth/invalid-email') {
                        throw new Error('That email address is invalid');
                    } else {
                        throw new Error(error);
                    }
                });
        } else {
            throw new Error('Please use at least 6 characters for your password');
        }
    }

    //  log in via email, password
    //      if an account with this credential exists, link them
    //      else, log in
    const logIn = async (email, password) => {
        const credential = auth.EmailAuthProvider.credential(email, password);

        const success = (userCredential, mergeAccounts) => {
            if(mergeAccounts) {
                // TO-DO
            }

            return userCredential;
        }

        auth().currentUser.linkWithCredential(credential)
            .then((userCredential) => {
                // attempt to link with credential for the first time was successful
                return success(userCredential, false);
            }).catch(error => {
                if (error.code === 'auth/wrong-password')
                    throw new Error('Password is incorrect');
                else if (error.code === 'user-not-found')
                    throw new Error('Account was not found with that email');
                else {
                    // account exists
                    // sign in, merge data to existing account, and delete old user
                    auth().signInWithCredential(credential)
                        .then((userCredential) => {
                            return success(userCredential, true);
                        });
                }
            });
    }

    const logInGoogle = async () => {
        const success = (userCredentials, linkingAccounts) => {
            const userRef = database().ref('users/' + userCredentials.user.uid);

            // update database with current Google name
            userRef.update({displayName: userCredentials.user.providerData[0].displayName})
                .then(() => {
                    return userCredentials;
                });
        }

        GoogleSignin.configure({
            webClientId: "141405103878-rsc5n2819h3b7fors0u0oadthfv4dmde.apps.googleusercontent.com",
        });

        GoogleSignin.hasPlayServices().then(async (hasPlayServices) => {
            if(hasPlayServices) {
                const {idToken} = await GoogleSignin.signIn();
                const credential = auth.GoogleAuthProvider.credential(idToken);

                auth().currentUser.linkWithCredential(credential).then((userCredentials) => {
                    // successful google sign in for the first time
                    return success(userCredentials, true);
                }).catch(error => {
                    // account exists, merge data to account and delete old user
                    // TO DO...

                    auth().signInWithCredential(credential).then(userCredentials => {
                        return success(userCredentials, false);
                    });
                });
            } else {
                // play services not available or outdated
                throw new Error('Google play services not available');
            }
        });
    }

    //  log out the current user
    const logOut = async () => {
        GoogleSignin.signOut()
            .then(() => {
                auth().signOut()
                    .catch(() => {
                        console.error('Error signing out');
                    });
            }).catch(err => {
            console.log(err);
            auth().signOut()
                .catch(() => {
                    console.error('Error signing out');
                });
        });
    }

    const connectOrganization = (addCode) => {
        // transaction to search org with add code, create user associated with that org

        if (addCode >= 0) {
            database().ref('organizations/').orderByChild('addCode').equalTo(addCode).once('value', function (snapshot) {
                //verify that org with add code exists
                if (snapshot.val()) {
                    snapshot.forEach(function (organizationSnapshot) {
                        const currentUserID = auth().currentUser.uid;
                        database().ref('/users/' + currentUserID).update({
                            organization: organizationSnapshot.key
                        }).then(r => {
                            Alert.alert(
                                'Organization Found',
                                'Attempting to sync data with ' + organizationSnapshot.val().name,
                                [
                                    {
                                        text: 'Continue',
                                        onPress: () => navigation.navigate('Home')
                                    },
                                    {
                                        text: 'Cancel',
                                        style: 'cancel',
                                    },
                                ]
                            );
                        });
                    });
                } else {
                    Alert.alert('Error', 'No organization was found with this add code');
                }
            })
        } else {
            Alert.alert('Please enter a valid add code');
        }
    };

    const disconnectFromOrganization = () => {
        database().ref('/users/' + auth().currentUser.uid).update({
            organization: null
        }).then(r => {
                Alert.alert('Disconnected', 'No longer syncing with ' + orgInfo.name)
                setOrgInfo(null);
            }
        );
    }

    return (
        <userAuthContext.Provider
            value={{
                user,
                userInfo,
                orgInfo,
                logIn,
                signUp,
                logOut,
                logInGoogle,
                connectOrganization,
                disconnectFromOrganization
            }}
        >
            {children}
        </userAuthContext.Provider>
    );
}

export const useUserAuth = () => {
    const context = useContext(userAuthContext);
    if (context === undefined) {
        throw new Error("Attempted to use auth context outside of FirebaseAuthProvider");
    }
    return context;
}