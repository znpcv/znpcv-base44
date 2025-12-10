import Checklist from './pages/Checklist';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import FAQ from './pages/FAQ';
import TradeHistory from './pages/TradeHistory';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import Register from './pages/Register';
import AGB from './pages/AGB';
import Datenschutz from './pages/Datenschutz';
import Impressum from './pages/Impressum';
import Account from './pages/Account';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Checklist": Checklist,
    "Home": Home,
    "Dashboard": Dashboard,
    "FAQ": FAQ,
    "TradeHistory": TradeHistory,
    "Payment": Payment,
    "PaymentSuccess": PaymentSuccess,
    "Register": Register,
    "AGB": AGB,
    "Datenschutz": Datenschutz,
    "Impressum": Impressum,
    "Account": Account,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};