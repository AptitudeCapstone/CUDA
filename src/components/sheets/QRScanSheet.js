import React from 'react';
import {device, rbCameraSheetStyle} from "../../Styles";
import QRCodeScanner from "react-native-qrcode-scanner";
import {Alert, Text} from "react-native";
import {RNCamera} from "react-native-camera";
import RBSheet from "react-native-raw-bottom-sheet";
import dimensions from "react-native/Libraries/Components/Touchable/BoundingDimensions";

export const QRSheet = ({modalRef}) =>
    <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbCameraSheetStyle}>
        <QRCodeScanner
            onRead={(e) => {
                Alert.alert('Setting patient to ', e.data);
                /*
                console.log('reader to patient map before:', readerToPatientMap);
                const temp = readerToPatientMap.set(lastTappedDeviceForPatientSelect, e.data);
                setReaderToPatientMap(temp);
                console.log('after:', temp);
                const deviceInfo = readersMap.get(lastTappedDeviceForPatientSelect);
                console.log('device info before:', deviceInfo);
                deviceInfo.selectedPatient = e.data;
                updateReaderCards(deviceInfo);
                console.log('after:', readersMap.get(lastTappedDeviceForPatientSelect))

                 */
                modalRef.current?.close();
            }}
            flashMode={RNCamera.Constants.FlashMode.auto}
            topContent={
                <Text style={[device.statusText, {color: '#888', textAlign: 'center'}]}>
                    Place QR code into the frame
                </Text>
            }
        />
    </RBSheet>;