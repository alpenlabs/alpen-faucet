import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./providers/WalletProvider";
import { ConfigProvider } from "./providers/ConfigProvider";
import Home from "./pages/Home";

const App = () => {
    return (
        <ConfigProvider>
            <WalletProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </Router>
            </WalletProvider>
        </ConfigProvider>
    );
};

export default App;