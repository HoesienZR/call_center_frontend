import { useState } from "react"
import {BrowserRouter as Router , Routes , Route, Navigate} from "react-router-dom"
import Login from "./component/Login"
import Home from "./component/Home"
import AdminDashboard from "./component/AdminDashboard"
import Project from "./component/Project"
import ProjectCreate from "./component/ProjectCreate"
import ProjectsId from "./component/ProjectsId"
import CallRequest from "./component/CallRequest"
import Upload from "./component/Upload"
import CallFeedBack from "./component/CallFeedBack"
import UserList from "./component/UserList"
import CallHistory from "./component/CallHistory"
import ContactList from "./component/ContactList"
import Reports from "./component/Reports"
import VerifyOTP from "./component/VerifyOTP"
function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login"/>}/>
          <Route path="/verify-otp" element={<VerifyOTP />}/>
          <Route path="/home" element={<Home />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/admin/dashboard" element={<AdminDashboard />}/>
          <Route path="/project" element={<Project />}/>
          <Route path="/project/:id" element={<ProjectsId />}/>
          <Route path="/project/:id/call-request" element={<CallRequest />}/>
          <Route path="/project/:id/upload" element={<Upload />}/>
          <Route path="/project/:id/history" element={<CallHistory />}/>
          <Route path="/project/create" element={<ProjectCreate />}/>
          <Route path="/project/:id/call-feedback" element={<CallFeedBack />}/>
          <Route path="/project/:id/contactlist" element={<ContactList />}/>
          <Route path="/project/:id/users" element={<UserList />}/>
          <Route path="/project/:id/reports" element={<Reports />}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
