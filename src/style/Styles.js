import React from "react";
import {Dimensions, StyleSheet} from 'react-native';
import IconMI from "react-native-vector-icons/MaterialCommunityIcons";

/*
    Named hex colors
 */

export const lightPurple = '#a275bf';
export const mediumPurple = '#8d67a8';

/*
    Colors common to many elements
 */

export const backgroundColor = '#eee';
export const tabBarColor = '#eee';
export const lightText = '#eee';
export const darkText = '#666';

/*
    Floating action bar menu
 */

export const MainFabIcon = () => <IconMI name='menu' color={backgroundColor} size={30}/>;
export const fabColor = lightPurple;
export const fabOverlayColor = 'rgba(0, 0, 0, 0.3)';

export const buttonBorderColor = '#666';
export const tabBarActiveTextColor = '#666';
export const tabBarInactiveTextColor = '#777';

/*
    Camera styles
 */

const camSize = Dimensions.get('window').width - 40;

export const camera = {
    iOS: StyleSheet.create({
        alignItems: 'center',
        width: camSize,
        height: camSize,
        overflow:'hidden',
        borderRadius: 15,
        backgroundColor: backgroundColor,
    }),
    android: StyleSheet.create({
        width: camSize,
        height: camSize,
        overflow:'hidden',
        borderRadius: 15,
        backgroundColor: backgroundColor
    })
}

/*
    Tab navigator styles
 */

export const tabNavigatorStyle = {
    headerShown: false,
    tabBarActiveTintColor: mediumPurple,
    tabBarInactiveTintColor: mediumPurple,
    tabBarActiveBackgroundColor: backgroundColor,
    tabBarInactiveBackgroundColor: backgroundColor,
    tabBarIconStyle: {
        size:  40
    },
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

export const userScreenOptions = {
    title: '',
    headerStyle: {
        backgroundColor: '#fff',
    },
    headerTintColor: '#222',
    headerTitleStyle: {
        fontWeight: 'bold',
    },
};

/*
    Sliding sheet styles
 */

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
        padding: 10,
        backgroundColor: backgroundColor,
        borderTopColor: buttonBorderColor,
        borderLeftColor: buttonBorderColor,
        borderRightColor: buttonBorderColor,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        alignSelf: 'center',
        width: '100%'
    }
};

export const rbCameraSheetStyle = {
    wrapper: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    draggableIcon: {
        backgroundColor: '#000'
    },
    container: {
        borderTopRightRadius: 25,
        borderTopLeftRadius: 25,
        paddingVertical: 15,
        backgroundColor: '#ddd',
        borderTopColor: buttonBorderColor,
        borderLeftColor: buttonBorderColor,
        borderRightColor: buttonBorderColor,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        alignSelf: 'center',
        width: '100%'
    }
};

/*
    Modal list styles
 */

export const modal = StyleSheet.create({
    overlay: {
        backgroundColor: '#eee'
    },
    container: {
        backgroundColor: '#eee'
    },
    option: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 15,
        marginVertical: 10,
        borderColor: '#888'
    },
    optionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: darkText,
        paddingVertical: 18,
        paddingHorizontal: 16,
        marginVertical: 8
    },
    cancelOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.05)',
        margin: 5,
        marginBottom: 15,
    },
    cancelText: {
        color: darkText,
        fontSize: 24,
        fontWeight: 'bold',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginVertical: 8
    }
});

/*
    Floating action bar styles
 */

export const floating = StyleSheet.create({
    iconButtonIcon: {
        color: lightText,
        alignSelf: 'center'
    },
    iconButton: {
        width: 70,
        height: 70,
        alignContent: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        backgroundColor: '#a275bf',
        borderColor: '#888',
        borderRadius: 150,
        marginLeft: 15,
        marginTop: 15,
    },
    actionBar: {
        justifyContent: 'flex-end',
        position: 'absolute',
        right: 15,
        bottom: 15,
    },
});

/*
    Common styles
 */

export const format = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: backgroundColor,
    },
    page: {
        backgroundColor: backgroundColor,
        flex: 1,
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
    selectPatientBarContainer: {
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexGrow: 1,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#888',
        backgroundColor: '#fff',
        marginHorizontal: 5,
    },
    selectPatientBar: {
        backgroundColor: '#333',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#555',
        flexDirection: 'row',
    },
    utilityPatientBarContainer: {
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        marginHorizontal: 10
    },
    utilityBarButton: {
        flexDirection: 'row',
        borderColor: '#888',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 100,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    section: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#999',
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginVertical: 10,
        flex: 1,
    },
    field: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between'
    },
});

export const iconButton = {
    icon: {
        color: '#555',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        padding: 12,
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        borderWidth: 1,
        backgroundColor: '#222',
        borderColor: '#555',
        borderRadius: 15
    },
}

export const testSelect = {
    covidColor: '#5461ba',
    fibrinogenColor: '#d9584a',
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#aaa',
        shadowColor: 'rgba(0, 0, 0, 0.4)',
        shadowOpacity: 0.6,
        textElevation: 6,
        shadowOffset: {
            width: 0,
            height: 6
        },
        flex: 1,
        marginHorizontal: 15,
        paddingHorizontal: 26,
        paddingVertical: 13,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#999'
    },
    text: {
        color: lightText,
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
}

export const patientSelect = {
    container: {
        backgroundColor: '#fff',
        borderColor: '#aaa',
        borderWidth: 1,
        borderRadius: 15,
        margin: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 10
    },
    text: {
        paddingVertical: 15,
        paddingLeft: 18,
        paddingRight: 10,
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
        color: darkText,
    },
    icon: {
        color: '#555',
        paddingLeft: 10,
        paddingRight: 20,
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
    },
};

export const fonts = StyleSheet.create({
    bigText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: darkText,
        alignSelf: 'center'
    },
    sectionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: darkText,
        textAlign: 'center',
        alignSelf: 'center'
    },
    fieldName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: darkText,
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'center'
    },
    iconButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: darkText,
        marginHorizontal: 10
    },
    iconButtonIcon: {
        color: darkText,
        marginHorizontal: 10
    },
    organizationName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: darkText,
    },
    mediumLink: {
        fontSize: 18,
        textAlign: 'center',
        color: darkText,
    },
    heading: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: darkText,
        padding: 15,
        paddingTop: 2,
        paddingBottom: 35,
    },
    subheading: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: darkText,
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
        color: darkText,
        alignSelf: 'center'
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
        color: darkText,
        textAlign: 'center',
    },
    selectButtonText: {
        color: darkText,
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    patientSelectText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: darkText,
    },
});

export const icons = StyleSheet.create({
    smallIcon: {
        color: darkText,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#eee',
    },
    linkIcon: {
        color: darkText,
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
        color: darkText,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    bloodTypeSelectButton: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#9c3a2f',
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 50,
        borderColor: '#888',
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
        borderColor: '#888',
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

/*
    Device card styles
 */

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

export const device = StyleSheet.create({
    container: {
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#888',
        backgroundColor: '#ccc',
        marginHorizontal: 10
    },
    icon: {
        color: '#555',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        flex: 1,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 15
    },
    body: {
        paddingVertical: 10,
        backgroundColor: '#eee',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    patientSelect: {
        flexDirection: 'row',
        paddingHorizontal: 15,
    },
    buttonContainerLandscape: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee',
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        paddingHorizontal: 10
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingHorizontal: 15
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderColor: '#aaa',
        backgroundColor: '#ddd',
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 8,
        alignSelf: 'center',
        justifyContent: 'center',
        color: darkText,
    },
    statusText: {
        fontSize: 24,
        textAlign: 'left',
        fontWeight: 'bold',
        color: '#ddd',
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

export const chart = {
    marginTop: 15,
    marginLeft: 0,
    marginRight: 0
}

export const chartContainer = {
    marginVertical: 15,
    backgroundColor: '#fff'
};

export const chartConfig = {
    backgroundColor: `rgba(255, 255, 255, 0)`,
    backgroundGradientFrom: `rgba(255, 255, 255, 0)`,
    backgroundGradientTo: `rgba(255, 255, 255, 0)`,
    fillShadowGradientFromOpacity: 0,
    fillShadowGradientToOpacity: 0,
    decimalPlaces: 2,
    color: (opacity = 1) => '#aaa',
    labelColor: (opacity = 1) => '#777',
    style: {
        marginVertical: 15,
    },
    propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: "#999"
    },
    useShadowColorFromDataset: false
};