import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import { ImExit } from "react-icons/im";

export default function NavigationBar() {
  const token = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate()
  function removeClick(){
    localStorage.removeItem("authToken");
    localStorage.removeItem("user")
    navigate('/login')
  }  
  return (
    <>
      <Navbar expand="md" dir="rtl" className="shadow-sm p-3">
        <Navbar.Brand className="mx-md-5 mx-0">
          <Link to="/home" className="text-decoration-none text-black">
            مرکز تماس
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav style={{ marginLeft: "auto" }}>
            <Link
              to="/admin/dashboard"
              className="btn btn-secondary p-md-2 p-0 rounded-3 mx-md-3 mx-0 mt-5 mt-md-0"
            >
              داشبورد مدیریت
            </Link>
            <Link
              className="p-md-2 p-0 rounded-3 mx-md-3 mx-0 mt-5 mt-md-0 text-decoration-none text-secondary" style={{}}
            > کاربر {token.username} خوش آمدی</Link>
          </Nav>
          <Nav>
            <Link
              to="/login"
              className="text-danger mt-4 mt-md-0 d-md-block d-none"
              style={{ fontSize: "20px" }}
              onClick={removeClick}
            >
              <ImExit />
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
}
