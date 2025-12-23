import AGB from './pages/AGB';
import Account from './pages/Account';
import Checklist from './pages/Checklist';
import CodeExport from './pages/CodeExport';
import Dashboard from './pages/Dashboard';
import Datenschutz from './pages/Datenschutz';
import FAQ from './pages/FAQ';
import Home from './pages/Home';
import Impressum from './pages/Impressum';
import Integrations from './pages/Integrations';
import Register from './pages/Register';
import TradeHistory from './pages/TradeHistory';
import Trash from './pages/Trash';
import TradeDetail from './pages/TradeDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AGB": AGB,
    "Account": Account,
    "Checklist": Checklist,
    "CodeExport": CodeExport,
    "Dashboard": Dashboard,
    "Datenschutz": Datenschutz,
    "FAQ": FAQ,
    "Home": Home,
    "Impressum": Impressum,
    "Integrations": Integrations,
    "Register": Register,
    "TradeHistory": TradeHistory,
    "Trash": Trash,
    "TradeDetail": TradeDetail,
}

export const pagesConfig = {
    mainPage: "Checklist",
    Pages: PAGES,
    Layout: __Layout,
};