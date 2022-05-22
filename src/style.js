import {StyleSheet} from 'react-native';
import React from "react";

export const backgroundColor = '#ddd';
export const tabBarColor = '#ccc';
export const lightText = '#eee';
export const darkText = '#131313';
export const deviceDefaultButtonColor = '#222';
export const deviceDefaultTextColor = '#eee';
export const buttonBorderColor = '#555';
export const tabBarActiveTextColor = '#555';
export const tabBarInactiveTextColor = '#666';

export const chartConfig = {
    backgroundGradientFrom: "#111",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#222",
    backgroundGradientToOpacity: 0.2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

export const colorDefinitions = {
    // device container colors
    headerDefault: {
        borderColor: '#888',
        backgroundColor: '#777',
    },
    headerGreen: {
        backgroundColor: '#519654',
    },
    headerOrange: {
        borderColor: 'rgba(0, 0, 0, 0.25)',
        backgroundColor: '#520c03',
    },
};

export const deviceColors = {
    'default': {
        headerColors: colorDefinitions.headerDefault,
    },
    'green': {
        headerColors: colorDefinitions.headerGreen,
    },
    'orange': {
        headerColors: colorDefinitions.headerOrange,
    }
}

export const tabNavigatorStyle = {
    headerShown: false,
    tabBarActiveTintColor: tabBarActiveTextColor,
    tabBarInactiveTintColor: tabBarInactiveTextColor,
    tabBarActiveBackgroundColor: tabBarColor,
    tabBarInactiveBackgroundColor: tabBarColor,
    tabBarLabelStyle: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#aaa',
        height: 110,
        backgroundColor: tabBarColor,
    },
    safeAreaInsets: {
        bottom: 0,
        paddingVertical: 10
    },
};

export const rbSheetStyle = {
    wrapper: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    draggableIcon: {
        backgroundColor: '#000'
    },
    container: {
        borderTopRightRadius: 25,
        borderTopLeftRadius: 25,
        padding: 15,
        backgroundColor: backgroundColor,
        borderTopColor: buttonBorderColor,
        borderLeftColor: buttonBorderColor,
        borderRightColor: buttonBorderColor,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        alignSelf: 'center',
        width: '90%'
    }
};

export const floating = StyleSheet.create({
    iconButtonIcon: {
        color: '#555',
        alignSelf: 'center'
    },
    iconButton: {
        width: 75,
        height: 75,
        alignContent: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        backgroundColor: '#ccc',
        borderColor: '#aaa',
        borderRadius: 150,
        marginLeft: 15,
        marginTop: 15,
    },
    actionBar: {
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
        color: lightText,
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
        color: lightText,
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
    safeArea: {
        flex: 1,
        backgroundColor: backgroundColor
    },
    page: {
        backgroundColor: backgroundColor,
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

export const device = StyleSheet.create({
    container: {
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#888',
        backgroundColor: '#777',
    },
    header: {
        flexDirection: 'row',
        flex: 1,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 15
    },
    patientSelect: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        backgroundColor: '#eee'
    },
    buttonContainerLandscape: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingHorizontal: 15,
        backgroundColor: '#eee',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderColor: '#aaa',
        backgroundColor: '#ccc',
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 8,
        alignSelf: 'center',
        justifyContent: 'center',
        color: '#555',
    },
    statusText: {
        fontSize: 24,
        textAlign: 'left',
        fontWeight: 'bold',
        color: '#ddd',
        paddingLeft: 10,
    },
    nameText: {
        fontSize: 30,
        paddingBottom: 4,
        textAlign: 'left',
        fontWeight: 'bold',
        color: lightText
    },
    patientText: {
        fontSize: 24,
        textAlign: 'left',
        fontWeight: 'bold',
        color: '#ddd',
        marginBottom: 8
    },
    connectedIcon: {
        alignSelf: 'center',
        justifyContent: 'flex-end',
        color: '#0dd414',
    }
});

export const fonts = StyleSheet.create({
    bigText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: lightText,
    },
    iconButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: lightText,
        marginHorizontal: 10
    },
    iconButtonIcon: {
        color: lightText,
        marginHorizontal: 10
    },
    organizationName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: lightText,
    },
    mediumLink: {
        fontSize: 18,
        textAlign: 'center',
        color: lightText,
    },
    heading: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: lightText,
        padding: 15,
        paddingTop: 2,
        paddingBottom: 35,
    },
    subheading: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: lightText,
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
        color: lightText,
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
        color: lightText,
        textAlign: 'center',
    },
    selectButtonText: {
        color: lightText,
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    patientSelectText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: lightText,
    },
});

export const icons = StyleSheet.create({
    smallIcon: {
        color: lightText,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#eee',
    },
    linkIcon: {
        color: lightText,
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
        color: lightText,
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
        color: lightText,
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
        color: lightText
    },
});