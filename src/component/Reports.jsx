import React, { useState, useEffect } from "react";
import NavigationBar from "./NavigationBar";
import { Container, Card, Button, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {API_BASE_URL} from "../config.js";

export default function Reports() {
  const [list, setList] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    fetchContacts();
  }, []);

  // --- دریافت لیست تماس‌گیرندگان ---
  const fetchContacts = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contacts/?project_id=${id}`,
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

  // --- تابع دانلود گزارش کلی ---
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
        link.download = "گزارش_کلی.xlsx";
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

  return (
    <>
      <NavigationBar />
      <Container dir="rtl">
        <Card className="p-3 mt-5">
          <Card.Header>
            <div className="d-flex justify-content-between">
              <div className="mt-2">
                <Card.Title>گزارش ها</Card.Title>
              </div>
              <div>
                <Card.Title>
                  <Button
                    variant="success"
                    className="text-white"
                    onClick={handleGetExcel}
                  >
                    دانلود گزارش کلی
                  </Button>
                </Card.Title>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
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
                                  `${API_BASE_URL}/api/excel/specific_user_report/?contact_id=${item.id}`,
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
