import Checklist from './pages/Checklist';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Checklist": Checklist,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Checklist",
    Pages: PAGES,
    Layout: __Layout,
};