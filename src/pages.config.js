import Checklist from './pages/Checklist';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import FAQ from './pages/FAQ';
import TradeHistory from './pages/TradeHistory';
import Register from './pages/Register';
import AGB from './pages/AGB';
import Datenschutz from './pages/Datenschutz';
import Impressum from './pages/Impressum';
import Account from './pages/Account';
import TradeDetail from './pages/TradeDetail';
import CodeExport from './pages/CodeExport';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Checklist": Checklist,
    "Home": Home,
    "Dashboard": Dashboard,
    "FAQ": FAQ,
    "TradeHistory": TradeHistory,
    "Register": Register,
    "AGB": AGB,
    "Datenschutz": Datenschutz,
    "Impressum": Impressum,
    "Account": Account,
    "TradeDetail": TradeDetail,
    "CodeExport": CodeExport,
}

export const pagesConfig = {
    mainPage: "Checklist",
    Pages: PAGES,
    Layout: __Layout,
};