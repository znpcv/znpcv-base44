import Checklist from './pages/Checklist';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EconomicCalendar from './pages/EconomicCalendar';
import FAQ from './pages/FAQ';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Checklist": Checklist,
    "Home": Home,
    "Dashboard": Dashboard,
    "EconomicCalendar": EconomicCalendar,
    "FAQ": FAQ,
}

export const pagesConfig = {
    mainPage: "Checklist",
    Pages: PAGES,
    Layout: __Layout,
};