import React, {useState} from 'react';
import {
    Dimensions,
    Keyboard, Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import IconF from 'react-native-vector-icons/Feather';
import TextInputField from '../components/TextInputField';
import Pdf from 'react-native-pdf';
import RNQRGenerator from 'rn-qr-generator';
import RNHTMLtoPDF from 'react-native-html-to-pdf';


export const QRCodes = ({navigation}) => {
    const [numberOfCodes, setNumberOfCodes] = useState(0);
    const [pdfSource, setPDFSource] = useState({uri:"data:application/pdf;base64,"})
    const [pdfHtml, setPdfHtml] = useState('');
    const [imageUris, setImageUris] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const generateQR = async () => {
        console.log(imageUris);
        console.log(numberOfCodes);
        console.log(pdfSource);
        setImageUris([]);
        setPDFSource({uri:""});
        for (let i = 1; i <= numberOfCodes; ++i) {
            RNQRGenerator.generate({
                value: i.toString(),
                height: 200,
                width: 200,
                base64: true,
                backgroundColor: 'white',
                color: 'black',
                correctionLevel: 'M',
            })
                .then((response) => {
                    //console.log('Response:', response);
                    let temp = imageUris;
                    temp.push(response.base64);
                    setImageUris(temp);
                })
                .catch((err) => console.log('Cannot create QR code', err));
        }

        await generatePDF().then(setModalVisible(true));
    };

    const hideModal = () => {
        if (modalVisible)
            setModalVisible(false);

        setImageUris([]);
        setPDFSource({uri:""});
    }

    const generatePDF = async () => {
        // start page
        let html = ''; // within page, make a grid

        for(let i = 0; i <= Math.floor(imageUris.length / 12); ++i) {

            // add page container
            html += '<div style="height: 723pt;">';
            html += '<div style="display: grid;grid-template-columns: repeat(3, 1fr);">';

            // add grid of QR codes to page
            let j = 0;
            while((i*12) + j < imageUris.length && j < 12) {
                html += '<img style="margin-left:40pt;margin-top:50pt;width:100pt;height:100pt;" src="data:image/jpeg;base64, ' + imageUris[12*i + j] + '"/>';
                ++j;
            }

            html += '</div>';
            html += '</div>';
        }

        let options = {
            html: html,
            fileName: 'test',
            base64: true,
            height: 792,
            width: 612
        };

        let pdf = await RNHTMLtoPDF.convert(options);
        setPDFSource({uri:'data:application/pdf;base64,' + pdf.base64});
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}
                                      style={styles.page}>
                <View style={{alignItems: 'center', backgroundColor: '#222'}}>
                    <View style={styles.section}>
                        <Text style={styles.headingText}>Number of Codes</Text>
                        <TextInputField
                            placeholder='Enter number'
                            keyboardType="numeric"
                            onChangeText={
                                (numCodes) => setNumberOfCodes(numCodes)
                            }
                            style={{padding: 25, color: '#fff'}}
                        />
                    </View>
                    <View style={styles.section}>
                        <TouchableOpacity
                            onPress={generateQR}
                            style={styles.testButton}
                        >
                            <Text style={styles.testButtonText}>Generate PDF</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
            {modalVisible ? (
                <Modal
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        hideModal();
                    }}
                >
                    <View style={{flex: 0.8}}>
                        <Pdf
                            source={pdfSource}
                            onLoadComplete={(numberOfPages,filePath) => {
                                setModalVisible(true);
                                console.log('showing modal');
                            }}
                            onPageChanged={(page,numberOfPages) => {
                                console.log(`Current page: ${page}`);
                            }}
                            onError={(error) => {
                                console.log(error);
                            }}
                            onPressLink={(uri) => {
                                console.log(`Link pressed: ${uri}`);
                            }}
                            style={styles.pdf}/>
                    </View>
                    <View>
                        <View style={styles.testButtonContainer}>
                        <TouchableOpacity
                            onPress={generateQR}
                            style={styles.testButton}
                        >
                            <Text style={styles.testButtonText}>Share</Text>
                            <Text style={{textAlign: 'right'}}>
                                <IconF name='share' size={30} color='#fff'/>
                            </Text>
                        </TouchableOpacity>
                        </View>
                        <View style={styles.testButtonContainer}>
                        <TouchableOpacity
                            onPress={hideModal}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>Close</Text>
                        </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            ) : (
                <View></View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1,
        justifyContent: 'space-between'
    },
    section: {
        flexDirection: 'column',
    },
    headingText: {
        margin: 40,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    pdf: {
        paddingTop: 50,
        paddingBottom: 50,
        flex: 1
    },
    cancelButton: {
        backgroundColor: 'rgb(222,167,91)',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        borderRadius: 50,
        marginTop: 20,
        marginBottom: 20,
        textAlign: 'center',
        alignItems: 'center'
    },
    testButtonText: {
        fontSize: 24,
        color: '#fff',
        paddingRight: 24,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    cancelButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    testButton: {
        backgroundColor: '#2cab5c',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        flexDirection: 'row',
        borderRadius: 50,
        marginTop: 20,
        marginBottom: 20,
    },
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});