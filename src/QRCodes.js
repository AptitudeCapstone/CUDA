import React, {useState} from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {Alert, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View} from 'react-native';
import IconF from 'react-native-vector-icons/Feather';
import Pdf from 'react-native-pdf';
import RNQRGenerator from 'rn-qr-generator';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNShareFile from 'react-native-share-pdf';
import {fonts, format, rbSheetStyle} from "./style/Styles";

const QRCodes = ({modalRef}) => {
    const [numberOfCodes, setNumberOfCodes] = useState(0),
        [pdfSource, setPDFSource] = useState(''),
        [shareSource, setShareSource] = useState(null),
        [imageUris, setImageUris] = useState([]),
        [modalVisible, setModalVisible] = useState(false),
        dimensions = useWindowDimensions();

    // sharing menu functions
    async function loadAndSharePDF() {
        try {
            console.log(RNShareFile.sharePDF);
            await RNShareFile.sharePDF(shareSource.document, shareSource.filename);
        } catch (error) {
            Alert.alert('PDF Error', error);
        }
    }

    // qr generating functions
    const generateQR = async () => {
        setImageUris([]);
        setPDFSource({uri: ''});

        for (let i = 1; i <= numberOfCodes; ++i) {
            RNQRGenerator.generate({
                value: i.toString(),
                height: 200,
                width: 200,
                base64: true,
                backgroundColor: 'white',
                color: 'black',
                correctionLevel: 'M',
            }).then((response) => {
                //console.log('Response:', response);
                let temp = imageUris;
                temp.push(response.base64);
                setImageUris(temp);
            }).catch((err) => console.log('Cannot create QR code', err));
        }

        generatePDF().then(() => {
            showPDF();
        }).catch((error) => {
            Alert.alert('PDF Error', error);
        });
    };

    const generatePDF = async () => {
        // start page
        let html = '';

        // within page, make a grid
        for (let i = 0; i <= imageUris.length / 12; ++i) {
            // add page container
            html += '<div style="height: ' + (712 + Math.floor(i)).toString() + 'pt;">';
            html += '<div style="display: grid;grid-template-columns: repeat(3, 1fr);">';

            // add grid of QR codes to page
            let j = 0;
            while ((i * 12) + j < imageUris.length && j < 12) {
                html += '<img alt="0" style="margin-left:40pt;margin-top:50pt;width:100pt;height:100pt;" src="data:image/jpeg;base64, ' + imageUris[12 * i + j] + '"/>';
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
        setPDFSource({uri: 'data:application/pdf;base64,' + pdf.base64});
        setShareSource({file: pdf.file, document: pdf.base64});
    };

    const showPDF = async () => {
        setModalVisible(true);
    };

    const hidePDF = () => {
        if (modalVisible)
            setModalVisible(false);

        setImageUris([]);
        setPDFSource({uri: ''});
    }

    return (
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={styles.page}>
                <View style={{alignItems: 'center', backgroundColor: '#222'}}>
                    <View style={styles.section}>
                        <Text style={[fonts.mediumText, format.fieldName]}>Name</Text>
                            <TextInput underlineColorAndroid='transparent'
                                       placeholder='Enter number'
                                       placeholderTextColor='#aaa'
                                       keyboardType='numeric'
                                       onChangeText={(numCodes) => setNumberOfCodes(numCodes)}
                                       numberOfLines={1}
                                       multiline={false}
                                       style={format.textBox}
                                       blurOnSubmit={false}/>
                    </View>
                    <View style={styles.section}>
                        <TouchableOpacity onPress={() => generateQR} style={styles.testButton}>
                            <Text style={styles.testButtonText}>Generate PDF</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
            {
                modalVisible ? (
                    <Modal transparent={true}
                           visible={modalVisible}
                           onRequestClose={() => hidePDF}>
                        <View style={{backgroundColor: 'rgba(0, 0, 0, 0.9)', flex: (pdfSource === '') ? 0 : 1, marginTop: 40}}>
                            <Pdf source={pdfSource}
                                 onError={(error) => {Alert.alert('Error reading PDF', error)}}
                                 style={styles.pdf}/>
                            <View>
                                <View style={styles.testButtonContainer}>
                                    <TouchableOpacity onPress={() => loadAndSharePDF} style={styles.testButton}>
                                        <Text style={styles.testButtonText}>Share</Text>
                                        <Text style={{textAlign: 'right'}}>
                                            <IconF name='share' size={30} color='#fff'/>
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.testButtonContainer}>
                                    <TouchableOpacity onPress={() => hidePDF} style={styles.cancelButton}>
                                        <Text style={styles.cancelButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : null
            }
        </RBSheet>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
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

export default QRCodes;