import { createBrowserRouter } from "react-router";
import Album from "./pages/AlbumPage";
import Auth from "./pages/AuthPage";
import LandPageimport from "./pages/LandingPage";
import MyAlbumPage from "./pages/MyAlbumsPage";
import NewAlbum from "./pages/NewAlbumPage";
import App from "./App";
import Protected from "./components/protected";

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      {
        path: "",
        element: <LandPageimport />,
      },
      {
        path: "login",
        element: <Auth />,
      },
      {
        element: <Protected />,
        children: [
          {
            path: "albums/new",
            element: <NewAlbum />,
          },
          {
            path: "albums",
            element: <MyAlbumPage />,
          },
        ],
      },
      {
        path: "albums/:id",
        element: <Album />,
      },
    ],
  },
]);

export default router;