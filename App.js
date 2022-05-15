import React from 'react';
import { UserProvider } from "./src/contexts/UserContext.js";
import TabNavigator from "./src/components/navigation/TabNavigator";

const App = () => (
    <UserProvider>
        <TabNavigator />
    </UserProvider>
);

export default App;
