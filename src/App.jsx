import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import DebugStorage from "./pages/DebugStorage";
import VideoPlayer from "./components/VideoFeed/VideoPlayer";
import UploadVideo from "./pages/UploadVideo";
import Profile from "./pages/Profile";
import './index.css';
import "./assets/styles/toastCustom.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/watch",
    element: <VideoPlayer />,
  },
  {
    path: "/upload",
    element: <UploadVideo />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/debug",
    element: <DebugStorage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
