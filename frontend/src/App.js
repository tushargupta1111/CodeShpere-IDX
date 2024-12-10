import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from './Pages/Home';
import Signup from './Pages/Signup';
import Login from "./Pages/Login";
import Collaboration from "./Pages/Collaboration";
import EditorPage from "./Pages/EditorPage";
import Editor from "./Pages/Editor";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./Contexts/ProtectedRoute";

function App() {
  return (
  <>
    <Toaster position="top-right" toastOptions={{ success: { theme: { primary: "#4aed88" }, }, }}></Toaster>
    <BrowserRouter>
    <Routes>
      <Route path ="/" element={<Home />} />
      <Route path ="/signup" element={<Signup/>} />
      <Route path ="/login" element={<Login/>} />
      <Route path ="/Editor" element={<Editor/>} />
      <Route path ="/collaboration" element={<ProtectedRoute> <Collaboration /> </ProtectedRoute>} />
      <Route path ="/collaboration/:roomId" element={<ProtectedRoute><EditorPage /> </ProtectedRoute>} />
    </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
