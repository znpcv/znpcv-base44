import AGB from './pages/AGB';
import Checklist from './pages/Checklist';
import CodeExport from './pages/CodeExport';
import Dashboard from './pages/Dashboard';
import Datenschutz from './pages/Datenschutz';
import FAQ from './pages/FAQ';
import Home from './pages/Home';
import Impressum from './pages/Impressum';
import Integrations from './pages/Integrations';
import Register from './pages/Register';
import TradeDetail from './pages/TradeDetail';
import TradeHistory from './pages/TradeHistory';
import Trash from './pages/Trash';
import Account from './pages/Account';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AGB": AGB,
    "Checklist": Checklist,
    "CodeExport": CodeExport,
    "Dashboard": Dashboard,
    "Datenschutz": Datenschutz,
    "FAQ": FAQ,
    "Home": Home,
    "Impressum": Impressum,
    "Integrations": Integrations,
    "Register": Register,
    "TradeDetail": TradeDetail,
    "TradeHistory": TradeHistory,
    "Trash": Trash,
    "Account": Account,
}

export const pagesConfig = {
    mainPage: "Checklist",
    Pages: PAGES,
    Layout: __Layout,
};