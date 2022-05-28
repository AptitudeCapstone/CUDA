import {GoogleSignin, statusCodes} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import {Alert} from "react-native";

export const handleLogInGoogle = async (userInfo) => {
    try {
        console.log('attempting to log in with google');
        const success = await logInGoogle(userInfo);
        if(success)
            console.log('success');
    } catch (error) {
        Alert.alert('Error', error.message);
    }
}

export const logInGoogle = async (userInfo) => {
    GoogleSignin.configure({
        webClientId: "141405103878-rsc5n2819h3b7fors0u0oadthfv4dmde.apps.googleusercontent.com",
    });

    try {
        await GoogleSignin.hasPlayServices();
        const {idToken} = await GoogleSignin.signIn();
        const credential = auth.GoogleAuthProvider.credential(idToken);
        userInfo.userAuth.linkWithCredential(credential)
            .catch(() => {
                auth().signInWithCredential(credential);
            });
        console.log(userInfo);
        return true;
    } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            return true;
        } else if (error.code === statusCodes.IN_PROGRESS) {
            return true;
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            throw new Error('Google play services are unavailable, try another login method.');
        }
        return false
    }
}

export const logOut = async () => {
    GoogleSignin.signOut()
        .then(() => {
            auth().signOut()
                .catch(() => {
                    console.error('Error signing out');
                });
        }).catch(err => {
        auth().signOut()
            .catch(() => {
                console.error('Error signing out');
            });
    });
}

export const disconnectFromOrganization = (userInfo) => {
    userInfo.userData.ref.update({organization: null})
        .then(() => {
            Alert.alert('Disconnect Successful', 'Data is no longer being synced');
        }).catch(() => {
            Alert.alert('Error', 'A problem was encountered while disconnecting');
        });
}