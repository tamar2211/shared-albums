import { createBrowserRouter } from "react-router";
import Album from "./pages/AlbumPage";
import Auth from "./pages/AuthPage";
import LandPageimport  from "./pages/LandingPage";
import MyAlbumPage from "./pages/MyAlbumsPage";
import NewAlbum from "./pages/NewAlbumPage";
import App from "./App";
const router=createBrowserRouter([
    {
        path:"",
        element:<App />,
        children:[
          {
                path: "",
                element: <LandPageimport />
            },  
            {
                path:"login",
                element:<Auth />
            },
            {
                path: "albums/new",
                element:<NewAlbum />
            },
            {
                path:"albums/:id",
                element:<Album />
            },
            {
                path:"albums",
                element:<MyAlbumPage />
            },
            
        ]

    }
])

export default router