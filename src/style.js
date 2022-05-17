import {StyleSheet} from 'react-native';

export const floating = StyleSheet.create({
    iconButtonIcon: {
        color: '#eee',
        alignSelf: 'center'
    },
    iconButton: {
        width: 75,
        height: 75,
        alignContent: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        backgroundColor: '#131313',
        borderColor: '#555',
        borderRadius: 150,
        marginLeft: 15
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        position: 'absolute',
        right: 30,
        bottom: 30,
    },
});

export const modal = StyleSheet.create({
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)'
    },
    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
        marginHorizontal: -12,
    },
    option: {
        marginHorizontal: -8,
        marginVertical: 12,
    },
    optionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#eee',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 15,
        marginVertical: -6,
        paddingVertical: 18,
        paddingHorizontal: 16,
    },
    cancelOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1,
        borderRadius: 15,
        margin: 5,
        marginBottom: 15,
    },
    cancelText: {
        color: '#eee',
        fontSize: 24,
        fontWeight: 'bold',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    searchBar: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 15,
        marginVertical: 15,
    },
    searchText: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 24,
        color: '#eee',
        alignSelf: 'center'
    }
});

export const format = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1,
        padding: 25
    },
    modalSelector: {
        marginBottom: 20,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
        paddingLeft: 20,
        paddingRight: 20,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#888',
        zIndex: -1,
    },
    iconButton: {
        padding: 12,
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        borderWidth: 1,
        backgroundColor: '#222',
        borderColor: '#555',
        borderRadius: 15
    },
    horizontalBar: {
        padding: 15,
        paddingBottom: 5,
    },
    horizontalSubBar: {
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        margin: 5,
        justifyContent: 'center'
    },
    textBox: {
        marginLeft: 35,
        marginRight: 35,
        marginTop: 0,
        marginBottom: 20,
        borderColor: '#888',
        borderWidth: 1,
        borderRadius: 10
    },
    testSelectBar: {
        flexDirection: 'row',
        paddingBottom: 20,
        justifyContent: 'space-between'
    },
    selectPatientBarContainer: {
        marginBottom: 20,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
        paddingLeft: 20,
        paddingRight: 20,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#888'
    },
    selectPatientBar: {
        backgroundColor: '#333',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#555',
        margin: 5,
        flexDirection: 'row',
    },
    utilityPatientBarContainer: {
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    utilityBarButton: {
        flexDirection: 'row',
        borderColor: '#888',
        borderWidth: 1,
        borderRadius: 10,
        padding: 15,
        paddingTop: 3,
        paddingBottom: 3
    }
});

export const deviceCard = StyleSheet.create({
    container: {

    },
    header: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: '#555',
        backgroundColor: '#222',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    utilityBarContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 10,
    },
    utilityBarButton: {
        flexDirection: 'row',
        marginHorizontal: 15,
        paddingHorizontal: 15,
        justifyContent: 'space-around',
        borderColor: '#888',
        borderWidth: 1,
        borderRadius: 10,
        flexGrow: 0.1,
        paddingVertical: 3
    },
    body: {
        justifyContent: 'center',
        borderBottomRightRadius: 15,
        borderBottomLeftRadius: 15,
        paddingHorizontal: 25,
        paddingBottom: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#555',
        backgroundColor: '#333',
    },
    nameText: {
        fontSize: 24,
        alignSelf: 'center',
        justifyContent: 'center',
        color: '#eee',
        textAlign: 'center',
        overflow: 'hidden',
        fontWeight: 'bold'
    },
    characteristicText: {
        fontSize: 24,
        paddingVertical: 30,
        color: '#eee',
        textAlign: 'center',
    },
    button: {
        padding: 20,
        backgroundColor: '#333',
        borderRadius: 40,
        margin: 5,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#555',
    },
    buttonText: {
        color: '#eee',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center'
    }
});

export const fonts = StyleSheet.create({
    username: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#eee',
    },
    iconButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#eee',
        marginHorizontal: 10
    },
    iconButtonIcon: {
        color: '#eee',
        marginHorizontal: 10
    },
    organizationName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#eee',
    },
    mediumLink: {
        fontSize: 18,
        textAlign: 'center',
        color: '#fff',
    },
    heading: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#eee',
        padding: 15,
        paddingTop: 2,
        paddingBottom: 35,
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
    subheadingSpaced: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#eee',
        padding: 15,
        paddingTop: 40,
        paddingBottom: 30
    },
    mediumText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#eee',
        padding: 8
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
    },
    selectButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    patientSelectText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#eee',
    },
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
    covidSelectButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        borderColor: '#666',
        backgroundColor: '#333',
        borderWidth: 1,
        borderBottomColor: '#3c499e',
        borderBottomWidth: 6,
        flexGrow: 0.475,
    },
    fibrinogenSelectButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        borderColor: '#666',
        backgroundColor: '#333',
        borderWidth: 1,
        borderBottomColor: '#9c3a2f',
        borderBottomWidth: 6,
        flexGrow: 0.475,
    },
    unselectedButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        borderColor: '#555',
        borderWidth: 1,
        flexGrow: 0.475,
    },
    bloodTypeSelectButton: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#9c3a2f',
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 50,
        borderColor: '#555',
        borderWidth: 1
    },
    unselectedBloodTypeButton: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#333',
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 50,
        borderColor: '#555',
        borderWidth: 1
    },
    animatedText: {
        marginLeft: 25,
        marginRight: 25,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff'
    },
});