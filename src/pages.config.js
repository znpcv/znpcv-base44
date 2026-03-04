/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
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
import TradeDetail from './pages/TradeDetail';
import TradeHistory from './pages/TradeHistory';
import Trash from './pages/Trash';
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
    "TradeDetail": TradeDetail,
    "TradeHistory": TradeHistory,
    "Trash": Trash,
}

export const pagesConfig = {
    mainPage: "Checklist",
    Pages: PAGES,
    Layout: __Layout,
};