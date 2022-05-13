import React from 'react';
import { UserProvider } from "./src/contexts/UserContext.js";
import BLEScanner from './src/components/BLEScanner';
import TabNavigator from "./src/components/navigation/TabNavigator";

const App = () => (
        <>
            <BLEScanner seconds={3.0} />
            <UserProvider>
                <TabNavigator />
            </UserProvider>
        </>
);

export default App;
