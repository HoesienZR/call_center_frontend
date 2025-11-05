import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";
import {
  Button,
  Card,
  Col,
  Container,
  Row,
  Table,
  Spinner,
} from "react-bootstrap";
import { FaPhoneSquareAlt, FaChartBar } from "react-icons/fa";
import { FaUserGroup, FaChartLine } from "react-icons/fa6";
import * as XLSX from "xlsx";
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
import Select from "react-select";
import "./AdminHome.css";
import {API_BASE_URL} from "../config.js";

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState([]);
  const [list, setList] = useState([]);
  const [calls, setCalls] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState({
    value: null,
    label: "همه پروژه‌ها",
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true); // فقط این اضافه شد

  useEffect(() => {
    Promise.all([dashboardAdmin(), fetchContacts(), fetchCalls()]).finally(
      () => {
        setLoading(false);
      }
    );
  }, []);

  // --- دریافت تماس‌ها ---
  const fetchCalls = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calls/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        console.error("خطا در دریافت تماس‌ها:", response.status);
        return;
      }
      const { results } = await response.json();
      setCalls(results);
      const projectMap = {};
      results.forEach((call) => {
        const proj = call.project;
        if (proj && proj.id && proj.name) {
          projectMap[proj.id] = { id: proj.id, name: proj.name };
        }
      });
      const projectOptions = Object.values(projectMap).map((p) => ({
        value: p.id,
        label: p.name,
      }));
      setProjects(projectOptions);
    } catch (error) {
      console.error("خطا در دریافت تماس‌ها:", error);
    }
  };

  // --- به‌روزرسانی نمودار ---
  useEffect(() => {
    updateChartData();
  }, [selectedProject, calls]);

  const updateChartData = () => {
    if (!calls.length) {
      setChartData([]);
      return;
    }
    const filteredCalls =
      selectedProject.value === null
        ? calls
        : calls.filter((call) => call.project?.id === selectedProject.value);
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
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="bg-white p-3 border rounded shadow-sm"
          style={{ direction: "rtl", textAlign: "right", fontSize: "13px" }}
        >
          <p className="mb-1">
            <strong>تاریخ:</strong> {label}
          </p>
          <p className="mb-1">
            <strong>کل تماس‌ها:</strong> {data.total_calls}
          </p>
          <p className="mb-1 text-success">
            <strong>تماس‌های موفق:</strong> {data.successful_calls}
          </p>
          <p className="mb-0">
            <strong>کاربران:</strong> {data.caller_usernames || "—"}
          </p>
        </div>
      );
    }
    return null;
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
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
      setList([]);
    }
  };

  // --- داشبورد ادمین ---
  async function dashboardAdmin() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/dashboard/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setAdminData(data);
    } catch (error) {
      console.log("error:" + error);
    }
  }

  // --- اکسپورت اکسل ---
  function exportToExcel(data, fileName, sheetName) {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      worksheet["!cols"] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
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

  // --- دانلود عملکرد تماس‌گیرندگان ---
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
        {loading ? (
          <div className="text-center py-5 my-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted fs-5">در حال بارگذاری داشبورد...</p>
          </div>
        ) : (
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
              {/* کارت‌های آماری */}
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

              {/* نمودار با دو خط: کل تماس + موفق */}
              <Card className="p-3 mt-5">
                <Card.Header>
                  <Row className="align-items-center">
                    <Col md={6}>
                      <Card.Title className="mb-0">
                        روند تماس‌های پروژه:{" "}
                        <strong>{selectedProject.label}</strong>
                      </Card.Title>
                    </Col>
                    <Col md={6}>
                      <Select
                        options={[
                          { value: null, label: "همه پروژه‌ها" },
                          ...projects,
                        ]}
                        value={selectedProject}
                        onChange={setSelectedProject}
                        placeholder="انتخاب پروژه..."
                        isRtl={true}
                        isSearchable={true}
                        noOptionsMessage={() => "پروژه‌ای یافت نشد"}
                        styles={{
                          control: (base) => ({
                            ...base,
                            direction: "rtl",
                            textAlign: "right",
                            fontSize: "14px",
                          }),
                          menu: (base) => ({
                            ...base,
                            direction: "rtl",
                          }),
                        }}
                      />
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                      >
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
                          label={{
                            value: "تعداد تماس",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ paddingTop: "10px" }}
                          iconType="line"
                        />
                        {/* خط کل تماس‌ها */}
                        <Line
                          type="monotone"
                          dataKey="total_calls"
                          stroke="#007bff"
                          strokeWidth={3}
                          name="کل تماس‌ها"
                          dot={{ fill: "#007bff", r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                        {/* خط تماس‌های موفق */}
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
                      {selectedProject.value === null
                        ? "داده‌ای برای نمایش وجود ندارد"
                        : "این پروژه تماسی ندارد"}
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* عملکرد تماس‌گیرندگان */}
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
                                    const url =
                                      window.URL.createObjectURL(blob);
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
        )}
      </Container>
    </>
  );
}
