import Home from './pages/Home';
import CreateWorld from './pages/CreateWorld';
import CreateCharacter from './pages/CreateCharacter';
import Play from './pages/Play';
import WorldsList from './pages/WorldsList';
import CharactersList from './pages/CharactersList';
import Settings from './pages/Settings';
import SharedChronicle from './pages/SharedChronicle';
import PublicChronicles from './pages/PublicChronicles';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "CreateWorld": CreateWorld,
    "CreateCharacter": CreateCharacter,
    "Play": Play,
    "WorldsList": WorldsList,
    "CharactersList": CharactersList,
    "Settings": Settings,
    "SharedChronicle": SharedChronicle,
    "PublicChronicles": PublicChronicles,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};