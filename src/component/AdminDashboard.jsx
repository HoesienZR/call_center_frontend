import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";
import { Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import { FaPhoneSquareAlt, FaChartBar } from "react-icons/fa"; // نسخه 5
import { FaUserGroup, FaChartLine } from "react-icons/fa6"; // نسخه 6
import * as XLSX from "xlsx";
import "./AdminHome.css";
import {API_BASE_URL} from "../config.js";

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState([]);
  const [list, setList] = useState([]);

  useEffect(() => {
    dashboardAdmin();
    fetchContacts();
  }, []);

    const fetchContacts = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contacts/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("contacts:", data);
        if (data.results && Array.isArray(data.results)) {
          setList(data.results);
        } else {
          setList([]);
        }
      } else {
        console.error("خطا در دریافت داده‌ها:", response.status);
        setList([]);
      }
    } catch (error) {
      console.error("خطا در اتصال به API:", error);
      setList([]);
    }
  };

  async function dashboardAdmin() {
    try {
      await fetch(`${API_BASE_URL}/api/admin/dashboard/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setAdminData(data);
        });
    } catch (error) {
      console.log("error:" + error);
    }
  }

  function exportToExcel(data, fileName, sheetName) {
    try {
      // ایجاد یک worksheet از داده‌ها
      const worksheet = XLSX.utils.json_to_sheet(data);

      // تنظیم عرض ستون‌ها (اختیاری)
      worksheet["!cols"] = [
        { wch: 10 }, // ردیف
        { wch: 20 }, // نام تماس‌گیرنده
        { wch: 15 }, // شماره تلفن
        { wch: 15 }, // نام کاربری
        { wch: 15 }, // تعداد کل تماس‌ها
        { wch: 15 }, // تماس‌های موفق
        { wch: 20 }, // تماس‌های پاسخ داده شده
        { wch: 15 }, // نرخ پاسخ‌دهی
        { wch: 15 }, // نرخ موفقیت
        { wch: 20 }, // مدت کل تماس‌ها
        { wch: 20 }, // میانگین مدت تماس
        { wch: 15 }, // تعداد پروژه‌ها
      ];

      // ایجاد یک workbook و افزودن worksheet به آن
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // تولید فایل اکسل و دانلود آن
      XLSX.writeFile(workbook, fileName);
      return true;
    } catch (error) {
      console.error("Error in exportToExcel:", error);
      return false;
    }
  }

  async function handleGetExcel() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/excel/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "report.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert("خطایی در دریافت فایل رخ داد.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("خطایی در دانلود فایل رخ داد.");
    }
  }

  async function handleGetCaller() {
    if (!adminData?.callerPerformance?.length) {
      alert("داده‌ای برای دانلود وجود ندارد");
      return;
    }

    const worksheetData = adminData.callerPerformance.map((caller, index) => ({
      ردیف: index + 1,
      "نام تماس‌گیرنده": caller.name || "نامشخص",
      "شماره تلفن": caller.phone_number || "نامشخص",
      "نام کاربری": caller.username || "نامشخص",
      "تعداد کل تماس‌ها": caller.total_calls_all_projects || 0,
      "تماس‌های موفق": caller.total_successful_calls_all_projects || 0,
      "تماس‌های پاسخ داده شده": caller.total_answered_calls_all_projects || 0,
      "نرخ پاسخ‌دهی (درصد)": `${Math.round(
        caller.overall_response_rate || 0
      )}%`,
      "نرخ موفقیت (درصد)": `${Math.round(caller.overall_success_rate || 0)}%`,
      "مدت کل تماس‌ها (دقیقه)": Math.round(
        (caller.total_duration_all_projects || 0) / 60
      ),
      "میانگین مدت تماس (ثانیه)": caller.overall_avg_duration || 0,
      "تعداد پروژه‌ها": caller.project_count || 0,
    }));

    const currentDate = new Date()
      .toLocaleDateString("fa-IR")
      .replace(/\//g, "-");
    const fileName = `گزارش_عملکرد_تماس_گیرندگان_${currentDate}.xlsx`;

    if (exportToExcel(worksheetData, fileName, "گزارش عملکرد")) {
      alert("فایل اکسل با موفقیت دانلود شد!");
    } else {
      alert("خطا در تولید فایل اکسل");
    }
  }

  return (
    <>
      <NavigationBar />
      <Container dir="rtl">
        <Card className="p-3 mt-5">
          <Card.Header>
            <div className="d-flex justify-content-between">
              <div>
                <Card.Title>به داشبورد مدیریت خوش آمدید</Card.Title>
              </div>
              <div>
                <Card.Title>
                  <Button variant="success" onClick={handleGetExcel}>
                    دانلود گزارش کلی
                  </Button>
                </Card.Title>
              </div>
            </div>
          </Card.Header>
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
                        کل پروژه‌ها
                      </div>
                    </Col>
                    <Col lg="4">
                      <div>{adminData.total_projects}</div>
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
                        کل تماس‌ها
                      </div>
                    </Col>
                    <Col lg="4">
                      <div>{adminData.total_calls}</div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col lg="3" md="6" sm="12">
                <Card className="p-3 mt-5" id="card-hover">
                  <Row>
                    <Col lg="9">
                      <div>
                        <FaUserGroup
                          className="text-muted mx-1"
                          style={{ fontSize: "19px" }}
                        />
                        کل تماس‌گیرندگان
                      </div>
                    </Col>
                    <Col lg="3">
                      <div>{adminData.total_callers}</div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col lg="3" md="6" sm="12">
                <Card className="p-3 mt-5" id="card-hover">
                  <Row>
                    <Col lg="8">
                      <div>
                        <FaChartLine
                          className="text-warning mx-1"
                          style={{ fontSize: "19px" }}
                        />
                        نرخ موفقیت
                      </div>
                    </Col>
                    <Col lg="4">
                      <div>
                        {adminData.success_rate
                          ? `${adminData.success_rate.toFixed(2)}%`
                          : "47%"}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <Card className="p-3 mt-5">
              <Card.Header>
                <div className="d-flex justify-content-between">
                  <div>
                    <Card.Title>عملکرد تماس‌گیرندگان</Card.Title>
                  </div>
                  <div>
                    <Card.Title>
                      <Button variant="primary" onClick={handleGetCaller}>
                        دانلود گزارش تماس گیرندگان
                      </Button>
                    </Card.Title>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <Table striped hover responsive dir="rtl">
                  <thead>
                    <tr>
                      <th>تماس گیرنده</th>
                      <th>شماره تلفن</th>
                      <th>نام کاربری</th>
                      <th>کل تماس‌ها</th>
                      <th>تماس‌های پاسخ داده شده</th>
                      <th>تماس‌های موفق</th>
                      <th>نرخ پاسخ‌دهی</th>
                      <th>نرخ موفقیت</th>
                      <th>میانگین مدت تماس</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData.callerPerformance &&
                    adminData.callerPerformance.length > 0 ? (
                      adminData.callerPerformance.map((caller) => (
                        <tr key={caller.caller_id}>
                          <td>{caller.name}</td>
                          <td>{caller.phone_number}</td>
                          <td>{caller.username}</td>
                          <td>{caller.total_calls}</td>
                          <td>{caller.answered_calls}</td>
                          <td>{caller.successful_calls}</td>
                          <td>{caller.response_rate.toFixed(2)}%</td>
                          <td>{caller.success_rate.toFixed(2)}%</td>
                          <td>{caller.avg_call_duration_formatted}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center">
                          داده‌ای برای نمایش وجود ندارد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
            <Card className="p-3 mt-5">
              <Card.Header>
                <Card.Title>لیست مخاطب</Card.Title>
              </Card.Header>
              <Card.Body>
                <Table striped hover responsive dir="rtl">
                  <thead>
                    <tr>
                      <th>نام مخاطب</th>
                      <th>شماره مخاطب</th>
                      <th>جنسیت</th>
                      <th>کاربر خاص</th>
                      <th>شماره تماس‌گیرنده</th>
                      <th>دانلود</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((item) => (
                      <tr key={item.id}>
                        <td>{item.full_name || "بدون نام"}</td>
                        <td>{item.phone || "بدون شماره"}</td>
                        <td>
                          {item.gender === "none" ? "مشخص نشده" : item.gender}
                        </td>
                        <td>{item.is_special ? "بله" : "خیر"}</td>
                        <td>{item.assigned_caller_phone || "بدون شماره"}</td>
                        <td>
                          <Button
                            variant="primary"
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  `http://127.0.0.1:8000/api/excel/specific_user_report/?contact_id=${item.id}`,
                                  {
                                    method: "GET",
                                    headers: {
                                      Authorization: `Token ${localStorage.getItem(
                                        "authToken"
                                      )}`,
                                      "Content-Type": "application/json",
                                    },
                                  }
                                );
                                if (response.ok) {
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = `گزارش_کاربر_${
                                    item.full_name || item.id
                                  }.xlsx`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);
                                } else {
                                  alert("خطا در دانلود گزارش.");
                                }
                              } catch (error) {
                                console.error("خطا در دانلود:", error);
                                alert("خطا در دانلود گزارش.");
                              }
                            }}
                          >
                            دانلود
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
