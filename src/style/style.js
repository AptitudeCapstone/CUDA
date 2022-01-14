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
        backgroundColor: '#333',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#eee',
        margin: 5
    }
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
});

export const icons = StyleSheet.create({
    smallIcon: {
        color: '#eee',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 2
    }
})

export const modal = StyleSheet.create({
    modal: {
        backgroundColor: '#222',
        padding: 15,
        flex: 1,
        borderRadius: 10
    },
    headingText: {
        margin: 20,
        marginBottom: 30,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalCancelButton: {
        backgroundColor: '#666',
        margin: 10,
        padding: 20,
        borderRadius: 10
    },
    modalSubmitButton: {
        backgroundColor: '#2cd46a',
        margin: 10,
        padding: 20,
        borderRadius: 10
    },
    textBox: {
        padding: 15,
        paddingTop: 10,
        paddingBottom: 10,
        color: '#222',
        backgroundColor: '#eee',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        marginLeft: 40,
        marginRight: 40
    },
})