import React, {useState} from 'react';
import {Dimensions, Keyboard, SafeAreaView, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import SubmitButton from '../components/SubmitButton';
import TextInputField from '../components/TextInputField';
import {openDatabase} from 'react-native-sqlite-storage';
import QRCode from 'react-native-qrcode-svg';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Pdf from 'react-native-pdf';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const QRCodes = ({navigation}) => {
    let [numberOfCodes, setNumberOfCodes] = useState('');
    let [patients, setPatients] = useState([]);
    let [pdfSource, setPDFSource] = useState('')
    let [showPDF, setShowPDF] = useState(false);

    const generatePDF = () => {
        // up to numberOfCodes, fill patients and QR code arrays
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM table_patients',
                [],
                (tx, results) => {
                    var temp = [];
                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push(results.rows.item(i));

                    setPatients(temp);
                }
            );
        });

        let qrCodes = [];
        for (let i = 0; i < numberOfCodes; ++i) {
            const svg = <QRCode
                level="Q"
                style={{width: 256, marginBottom: 50}}
                value={'hello world'}
            />;
            const serializer = new XMLSerializer();
            const svgStr = serializer.serializeToString(svg);
            const img_src = 'data:image/svg+xml;base64,' + window.btoa(svgStr);
            qrCodes.push(img_src);
        }

        // make the pdf using QR code + patient data
        let html = '';
        for (let i = 0; i < numberOfCodes; ++i)
            html += patientBlock(i);

        const options = {html, fileName: 'patientQR', directory: 'Documents'};
        const file = RNHTMLtoPDF.convert(options);
        const pdfSource = file.filePath;
        setPDFSource(pdfSource);

        // update PDF display with new PDF data
        setShowPDF(true);
    };

    const patientBlock = id => `
        <div>
            <h1>id</h1>
        </div>
    `;

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
                            style={{padding: 25}}
                        />
                    </View>
                    <View style={styles.section}>
                        <View style={{marginTop: 45}}>
                            <SubmitButton title='Generate Codes' customClick={generatePDF}/>
                        </View>
                    </View>
                    {showPDF &&
                    <Pdf style={styles.pdf} source={pdfSource}/>
                    }
                </View>
            </TouchableWithoutFeedback>
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
        flex: 1,
        width: Dimensions.get("window").width,
        alignSelf: "center"
    }
});