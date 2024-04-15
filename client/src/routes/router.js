import {createBrowserRouter} from "react-router-dom"
import Dashboard from "../Dashboard";
import GreenScreen from "../GreenScreen";
import VideoUpload from "../VideoUpload";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Dashboard />,
        
    },
    {
        path: "/upload",
        element: <VideoUpload />
    },
    {
        path: "/green-screen",
        element: <GreenScreen />
    }
]);

export default router;