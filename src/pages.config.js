import Checklist from './pages/Checklist';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import FAQ from './pages/FAQ';
import TradeHistory from './pages/TradeHistory';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Checklist": Checklist,
    "Home": Home,
    "Dashboard": Dashboard,
    "FAQ": FAQ,
    "TradeHistory": TradeHistory,
    "Payment": Payment,
    "PaymentSuccess": PaymentSuccess,
}

export const pagesConfig = {
    mainPage: "Checklist",
    Pages: PAGES,
    Layout: __Layout,
};