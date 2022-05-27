import React from 'react';
import { UserProvider } from "./src/auth/UserContext.js";
import Navigator from "./src/navigation/Navigator";

const App = () => (
    <UserProvider>
        <Navigator />
    </UserProvider>
);

export default App;
