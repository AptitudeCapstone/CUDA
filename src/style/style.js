import {StyleSheet} from 'react-native';

export const format = StyleSheet.create({
    page: {
        backgroundColor: '#333',
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
        backgroundColor: '#333'
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
        padding: 15,
        paddingTop: 10,
        paddingBottom: 10,
        color: '#222',
        backgroundColor: '#aaa',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#888',
        marginLeft: 40,
        marginRight: 40,
        marginBottom: 15,
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
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#eee',
        paddingTop: 2,
        paddingBottom: 18
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
    }
});