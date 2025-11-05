import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { FaUserGroup } from "react-icons/fa6";
import { FaPhoneSquareAlt } from "react-icons/fa";
import { MdPermPhoneMsg } from "react-icons/md";
import { IoMdCloudUpload } from "react-icons/io";
import { MdPhoneBluetoothSpeaker } from "react-icons/md";
import { TbMessageReportFilled } from "react-icons/tb";
import { FaHistory } from "react-icons/fa";
import NavigationBar from "./NavigationBar";
import { CiViewList } from "react-icons/ci";
import moment from "jalali-moment";
import {API_BASE_URL} from "../config.js";

export default function ProjectsId() {
  const [listItem, setListItem] = useState([]);
  const [updateData, setUpdateData] = useState({});
  const [loading, setLoading] = useState(true); // فقط این اضافه شد
  const formatDate = moment().locale("fa").format("D MMMM YYYY");
  const token = localStorage.getItem("authToken");
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [card, setCard] = useState([
    {
      id: 1,
      text: "تماس گیرندگان",
      icon: (
        <FaUserGroup
          className="mx-1 text-primary"
          style={{ fontSize: "17px" }}
        />
      ),
      counter: "0",
    },
    {
      id: 2,
      text: "مخاطبین",
      icon: (
        <FaPhoneSquareAlt
          className="mx-1 text-success"
          style={{ fontSize: "17px" }}
        />
      ),
      counter: "0",
    },
    {
      id: 3,
      text: "تماس های انجام شده",
      icon: (
        <MdPermPhoneMsg
          className="mx-1 text-info"
          style={{ fontSize: "17px" }}
        />
      ),
      counter: "0",
    },
    {
      id: 4,
      text: "تماس های در انتظار",
      icon: (
        <MdPhoneBluetoothSpeaker
          className="mx-1 text-warning"
          style={{ fontSize: "17px" }}
        />
      ),
      counter: "0",
    },
  ]);

  const [cards, setCards] = useState([
    {
      id: 1,
      imText: "درخواست تماس",
      icon: (
        <FaPhoneSquareAlt
          className="mx-1 text-primary"
          style={{ fontSize: "30px" }}
        />
      ),
      text: "برای شروع تماس جدید در این پروژه کلیک کنید",
      url: "call-request",
    },
    {
      id: 2,
      imText: "آپلود فایل ها",
      icon: (
        <IoMdCloudUpload
          className="mx-1 text-success"
          style={{ fontSize: "30px" }}
        />
      ),
      text: "فایل های اکسل مخاطبین و تماس گیرندگان را آپلود کنید",
      url: "upload",
    },
    {
      id: 3,
      imText: "گزارش ها",
      icon: (
        <TbMessageReportFilled
          className="mx-1 text-warning"
          style={{ fontSize: "30px" }}
        />
      ),
      text: "مشاهده گزارش های تفصیلی این پروژه",
      url: "reports",
    },
    {
      id: 4,
      imText: "لیست کاربران",
      icon: (
        <FaUserGroup className="mx-1 text-info" style={{ fontSize: "30px" }} />
      ),
      text: "مشاهده و مدیریت کاربران سیستم",
      url: "users",
    },
    {
      id: 5,
      imText: "تاریخچه تماس کاربر",
      icon: (
        <FaHistory className="mx-1 text-black" style={{ fontSize: "30px" }} />
      ),
      text: "مشاهده تاریخچه تماس کاربر",
      url: "history",
    },
    {
      id: 6,
      imText: "لیست مخاطبین",
      icon: (
        <CiViewList className="mx-1 text-danger" style={{ fontSize: "30px" }} />
      ),
      text: "مشاهده لیست مخاطبین پروژه",
      url: "contactlist",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getProject(), getStatic()]);
      setLoading(false);
    };

    fetchData();
  }, [id, token]);

  useEffect(() => {
    if (updateData && Object.keys(updateData).length > 0) {
      setCard([
        {
          id: 1,
          text: "تماس گیرندگان",
          icon: (
            <FaUserGroup
              className="mx-1 text-primary"
              style={{ fontSize: "17px" }}
            />
          ),
          counter: updateData.total_callers?.toString() || "0",
        },
        {
          id: 2,
          text: "مخاطبین",
          icon: (
            <FaPhoneSquareAlt
              className="mx-1 text-success"
              style={{ fontSize: "17px" }}
            />
          ),
          counter: updateData.total_contacts?.toString() || "0",
        },
        {
          id: 3,
          text: "تماس های انجام شده",
          icon: (
            <MdPermPhoneMsg
              className="mx-1 text-info"
              style={{ fontSize: "17px" }}
            />
          ),
          counter: updateData.total_calls?.toString() || "0",
        },
        {
          id: 4,
          text: "تماس های در انتظار",
          icon: (
            <MdPhoneBluetoothSpeaker
              className="mx-1 text-warning"
              style={{ fontSize: "17px" }}
            />
          ),
          counter:
            updateData.call_results_distribution?.callback_requested?.toString() ||
            "0",
        },
      ]);
    }
  }, [updateData]);

  async function getProject() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        setListItem(data.results);
      } else {
        setListItem([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setListItem([]);
    }
  }

  async function getStatic() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${id}/statistics/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data) {
        setUpdateData(data);
      } else {
        setUpdateData({});
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setUpdateData({});
    }
  }

  const selectionItem = listItem.find((item) => item.id == id);
  const userRole = selectionItem?.members?.find(
    (member) => member.user.id === user?.id
  )?.role;
  const filteredCards =
    userRole === "caller"
      ? cards.filter(
          (item) =>
            item.imText === "درخواست تماس" ||
            item.imText === "تاریخچه تماس کاربر"
        )
      : cards;

  return (
    <>
      <NavigationBar />
      {loading ? (
        <div className="text-center py-5 my-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted fs-5">
            در حال بارگذاری اطلاعات پروژه...
          </p>
        </div>
      ) : selectionItem ? (
        <Container className="p-3" style={{ direction: "rtl" }}>
          <Card className="p-3 mt-5">
            <Card.Title>اطلاعات پروژه</Card.Title>
            <Card.Body>
              <Row>
                <Col lg="6">
                  <p className="text-secondary">نام پروژه</p>
                  <h5>{selectionItem.name}</h5>
                </Col>
                <Col lg="6">
                  <p className="text-secondary">تاریخ ایجاد</p>
                  <h6>{selectionItem.persian_created_at}</h6>
                </Col>
              </Row>
              <p className="text-secondary mt-4">توضیحات</p>
              <h6>{selectionItem.description}</h6>
            </Card.Body>
          </Card>

          <Card className="mt-5">
            <Card.Body>
              <Row>
                {card.map((item) => (
                  <Col lg="3" key={item.id}>
                    <Card className="mt-2 p-3">
                      <Row className="text-center">
                        <Col lg="8">
                          <div>
                            {item.icon}
                            {item.text}
                          </div>
                        </Col>
                        <Col>
                          <div>{item.counter}</div>
                        </Col>
                        <Col lg="4"></Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Row className="text-center">
                {filteredCards.map((item) => (
                  <Col lg="3" key={item.id}>
                    <Link
                      to={`/project/${selectionItem.id}/${item.url}`}
                      className="text-decoration-none"
                    >
                      <Card className="mt-5 p-5">
                        <div>
                          <h5 className="mt-0">{item.icon}</h5>
                          <h5>{item.imText}</h5>
                          <p className="text-secondary">{item.text}</p>
                        </div>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Container>
      ) : (
        <Container className="p-3" style={{ direction: "rtl" }}>
          <p>پروژه‌ای یافت نشد.</p>
        </Container>
      )}
    </>
  );
}
