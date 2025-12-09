import Checklist from './pages/Checklist';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EconomicCalendar from './pages/EconomicCalendar';
import TradeHistory from './pages/TradeHistory';
import FAQ from './pages/FAQ';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Checklist": Checklist,
    "Home": Home,
    "Dashboard": Dashboard,
    "EconomicCalendar": EconomicCalendar,
    "TradeHistory": TradeHistory,
    "FAQ": FAQ,
}

export const pagesConfig = {
    mainPage: "Checklist",
    Pages: PAGES,
    Layout: __Layout,
};