import "./App.css";
import { Button } from "./components/ui/button";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ManageSkills from "./pages/ManageSkills";
import ManageTimeLine from "./pages/ManageTimeLine";
import ManageProject from "./pages/ManageProject";
import ViewProject from "./pages/ViewProject";
import UpdateProject from "./pages/UpdateProject";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/password/forgot" element={<ForgotPassword/>}/>
        <Route path="/password/reset/:token" element={<ResetPassword/>}/>
        <Route path="/manage/skills" element={<ManageSkills/>}/>
        <Route path="/manage/timeline" element={<ManageTimeLine/>}/>
        <Route path="/manage/project" element={<ManageProject/>}/>
        <Route path="/view/project/:id" element={<ViewProject/>}/>
        <Route path="/update/project/:id" element={<UpdateProject/>}/>
      </Routes>
      <ToastContainer position="bottom-right"  theme="dark"/>
    </Router>
  );
}

export default App;
