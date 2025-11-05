import React from "react";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import { FaChartBar } from "react-icons/fa";
import { FaPhoneSquareAlt } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { FaClock } from "react-icons/fa6";
import { IoCodeWorkingSharp } from "react-icons/io5";
import "./AdminHome.css";
import {API_BASE_URL} from "../config.js";
export default function Home() {
  const [info, setInfo] = useState({});
  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/main_dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setInfo(data);
        }else{
          setInfo({})
        }
      }else{
        setInfo({})
        console.log("No valid results found in API response for getStatic");
      }
    } catch (error) {
      console.log("error:" + error);
    }
  }
  return (
    <>
      <NavigationBar />
      <Container dir="rtl" className="p-3">
        <Card className="p-3 mt-5 text-center">
          <Card.Title className="text-center">
            به سیستم مدیریت مرکز تماس خوش آمدید
          </Card.Title>
          <p className="text-secondary">
            از این داشبورد می توانید پروژه های تماس خود را مدیریت کنید
          </p>
          <Card.Body>
            <Row>
              <Col lg="3" md="6" sm="12">
                <Card className="p-3 mt-5" id="card-hover">
                  <Row>
                    <Col lg="8">
                      <div>
                        <FaChartBar
                          className="text-primary mx-1"
                          style={{ fontSize: "19px" }}
                        />
                        کل پروژه ها
                      </div>
                    </Col>
                    <Col lg="4">
                      <div>{info.project_count}</div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col lg="3" md="6" sm="12">
                <Card className="p-3 mt-5" id="card-hover">
                  <Row>
                    <Col lg="8">
                      <div>
                        <FaPhoneSquareAlt
                          className="text-success mx-1"
                          style={{ fontSize: "19px" }}
                        />
                        مدیریت تماس ها
                      </div>
                    </Col>
                    <Col lg="4">
                      <div>{info.calls_count}</div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col lg="3" md="6" sm="12">
                <Card className="p-3 mt-5" id="card-hover">
                  <Row>
                    <Col lg="8">
                      <div>
                        <FaCheckCircle
                          className="text-success mx-1"
                          style={{ fontSize: "19px" }}
                        />
                        تماس های انجام شده
                      </div>
                    </Col>
                    <Col lg="4">
                      <div>{info.answered_calls_count}</div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col lg="3" md="6" sm="12">
                <Card className="p-3 mt-5" id="card-hover">
                  <Row>
                    <Col lg="8">
                      <div>
                        <FaClock
                          className="text-warning mx-1"
                          style={{ fontSize: "19px" }}
                        />
                        تماس های در انتظار
                      </div>
                    </Col>
                    <Col lg="4">
                      <div>{info.pending_calls_count}</div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <Link to="/project" className="text-decoration-none">
          <Card className="mt-5 bg-success text-center p-3" id="card-hover">
            <Card.Title className="text-white" style={{ fontSize: "30px" }}>
              <IoCodeWorkingSharp />
            </Card.Title>
            <Card.Body className="text-white">
              <h5>مدیریت پروژه ها</h5>
              مشاهده و مدیریت پروژه های تماس
            </Card.Body>
          </Card>
        </Link>
      </Container>
    </>
  );
}
