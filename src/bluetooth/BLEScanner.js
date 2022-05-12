import React, {useEffect, useState} from 'react';
import BleManager from "react-native-ble-manager";

const BLEScanner = ({seconds}) => {
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            scanPeripherals();
        }, seconds * 1000);
        return () => clearInterval(interval);
    }, []);

    const scanPeripherals = () => {
        if (!isScanning) {
            BleManager.scan([], seconds, false)
                .then(() => {
                    setIsScanning(false)
                }).catch((err) => {
                console.error(err);
            });
        }
    }

    return <></>
}

export default BLEScanner;