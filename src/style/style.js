import {StyleSheet} from 'react-native';

export const format = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    deviceList: {
        justifyContent: 'space-around',
        alignContent: 'center',
        textAlign: 'center',
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
    },
    horizontalBar: {
        padding: 15,
        paddingBottom: 5,
    },
    horizontalSubBar: {
        padding: 8,
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: '#444',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#888',
        margin: 5,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    textBox: {
        marginLeft: 35,
        marginRight: 35,
        marginTop: 0,
        marginBottom: 20,
        borderColor: '#eee',
        borderWidth: 1,
        borderRadius: 5
    },
});

export const fonts = StyleSheet.create({
    username: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#eee',
    },
    organizationName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#eee',
    },
    mediumLink: {
        fontSize: 16,
        textAlign: 'center',
        color: '#eee',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#eee',
        padding: 15,
        paddingTop: 2,
        paddingBottom: 35
    },
    subheading: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#eee',
        padding: 15,
        paddingTop: 2,
        paddingBottom: 18
    },
    smallText: {
        marginTop: 0,
        marginBottom: 10,
        marginLeft: 20,
        marginRight: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
    }
});

export const icons = StyleSheet.create({
    smallIcon: {
        color: '#eee',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#eee',
    },
    linkIcon: {
        color: '#eee',
        marginLeft: 20
    }
});

export const buttons = StyleSheet.create({
    submitButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#2cab5c',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        borderRadius: 50,
        marginTop: 20,
        marginBottom: 60,
    },
    submitButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    forgotPasswordContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    forgotPasswordButton: {
        backgroundColor: '#348ceb',
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 20,
        paddingBottom: 20,
        borderRadius: 50,
        marginTop: 40,
        marginBottom: 20,
    },
    forgotPasswordText: {
        fontSize: 20,
        color: '#eee',
        textAlign: 'center',
        fontWeight: 'bold'
    },
});