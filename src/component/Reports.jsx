import React, { useState, useEffect } from "react";
import NavigationBar from "./NavigationBar";
import { Container, Card, Button, Table, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {API_BASE_URL} from "../config.js";

export default function Reports() {
  const [list, setList] = useState([]);
  const [calls, setCalls] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true); // فقط این مدیریت شد
  const [projectName, setProjectName] = useState("در حال بارگذاری...");
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const loadAllData = async () => {
        setLoading(true);
        try {
          // اجرای موازی سه API
          await Promise.all([
            fetchProjectName(),
            fetchContacts(),
            fetchAllCallsAndFilter(),
          ]);
        } catch (error) {
          console.error("خطا در بارگذاری داده‌ها:", error);
        } finally {
          setLoading(false); // فقط یک بار در انتها
        }
      };

      loadAllData();
    } else {
      setProjectName("پروژه نامشخص");
      setLoading(false);
    }
  }, [id]);

  // --- دریافت نام پروژه ---
  const fetchProjectName = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const project = await response.json();
        setProjectName(project.name || `پروژه ${id}`);
      } else {
        setProjectName(`پروژه ${id}`);
      }
    } catch (error) {
      console.error("خطا در دریافت نام پروژه:", error);
      setProjectName(`پروژه ${id}`);
    }
  };

  // --- دریافت مخاطبین ---
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
        if (data.results && Array.isArray(data.results)) {
          setList(data.results);
        } else {
          setList([]);
        }
      } else {
        setList([]);
      }
    } catch (error) {
      console.error("خطا در دریافت مخاطبین:", error);
      setList([]);
    }
  };

  // --- دریافت همه تماس‌ها + فیلتر دستی + موفق ---
  const fetchAllCallsAndFilter = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calls/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        setCalls([]);
        setChartData([]);
        return;
      }
      const { results } = await response.json();
      const projectId = parseInt(id, 10);
      const filteredCalls = results.filter(
        (call) => call.project && call.project.id === projectId
      );
      setCalls(filteredCalls);

      // ساخت داده‌های نمودار: کل + موفق
      const dateMap = {};
      filteredCalls.forEach((call) => {
        const date = call.persian_call_date?.split(" ")[0];
        if (!date) return;
        const username = call.caller?.username || "نامشخص";
        const isSuccessful = call.call_result === "interested";
        if (!dateMap[date]) {
          dateMap[date] = {
            date,
            total_calls: 0,
            successful_calls: 0,
            usernames: [],
          };
        }
        dateMap[date].total_calls += 1;
        if (isSuccessful) {
          dateMap[date].successful_calls += 1;
        }
        if (!dateMap[date].usernames.includes(username)) {
          dateMap[date].usernames.push(username);
        }
      });
      const formatted = Object.values(dateMap)
        .map((item) => ({
          ...item,
          caller_usernames: item.usernames.join("، "),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      setChartData(formatted);
    } catch (error) {
      console.error("خطا در دریافت تماس‌ها:", error);
      setChartData([]);
    }
  };

  // --- Tooltip سفارشی ---
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="bg-white p-3 border rounded shadow-sm"
          style={{ direction: "rtl", textAlign: "right", fontSize: "13px" }}
        >
          <p className="mb-1"><strong>تاریخ:</strong> {label}</p>
          <p className="mb-1"><strong>کل تماس‌ها:</strong> {data.total_calls}</p>
          <p className="mb-1 text-success"><strong>تماس‌های موفق:</strong> {data.successful_calls}</p>
          <p className="mb-0"><strong>کاربران:</strong> {data.caller_usernames || "—"}</p>
        </div>
      );
    }
    return null;
  };

  // --- دانلود گزارش کلی ---
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
        {loading ? (
          // لودینگ مرکزی و حرفه‌ای
          <div className="text-center py-5 my-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted fs-5">در حال بارگذاری گزارش‌های پروژه...</p>
          </div>
        ) : (
          <Card className="p-3 mt-5">
            <Card.Header>
              <div className="d-flex justify-content-between">
                <div className="mt-2">
                  <Card.Title>گزارش‌های پروژه: {projectName}</Card.Title>
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
              {/* نمودار با دو خط: کل + موفق */}
              <Card className="p-3 mt-5">
                <Card.Header>
                  <Card.Title>
                    روند تماس‌های پروژه: <strong>{projectName}</strong>
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          label={{ value: "تعداد تماس", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ paddingTop: "10px" }}
                          iconType="line"
                        />
                        <Line
                          type="monotone"
                          dataKey="total_calls"
                          stroke="#007bff"
                          strokeWidth={3}
                          name="کل تماس‌ها"
                          dot={{ fill: "#007bff", r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="successful_calls"
                          stroke="#28a745"
                          strokeWidth={3}
                          name="تماس‌های موفق"
                          dot={{ fill: "#28a745", r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted py-4">
                      این پروژه تماسی ندارد
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* لیست مخاطب */}
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
                      {list.length > 0 ? (
                        list.map((item) => (
                          <tr key={item.id}>
                            <td>{item.full_name || "بدون نام"}</td>
                            <td>{item.phone || "بدون شماره"}</td>
                            <td>{item.gender === "none" ? "مشخص نشده" : item.gender}</td>
                            <td>{item.is_special ? "بله" : "خیر"}</td>
                            <td>{item.assigned_caller_phone || "بدون شماره"}</td>
                            <td>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      `${API_BASE_URL}/api/excel/specific_user_report/?contact_id=${item.id}`,
                                      {
                                        method: "GET",
                                        headers: {
                                          Authorization: `Token ${localStorage.getItem("authToken")}`,
                                          "Content-Type": "application/json",
                                        },
                                      }
                                    );
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement("a");
                                      link.href = url;
                                      link.download = `گزارش_کاربر_${item.full_name || item.id}.xlsx`;
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            مخاطبی برای این پروژه یافت نشد
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
}