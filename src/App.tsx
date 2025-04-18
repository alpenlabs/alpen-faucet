import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { WalletProvider } from "./providers/WalletProvider";

const App = () => {
    return (
        <WalletProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </Router>
        </WalletProvider>
    );
};

export default App;
