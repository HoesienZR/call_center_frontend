import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";
import {
  Card,
  Container,
  Row,
  Col,
  Badge,
  ListGroup,
  Form,
} from "react-bootstrap";
import { CiCircleList } from "react-icons/ci";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone, FiMapPin } from "react-icons/fi";
import {
  FaUserTie,
  FaCalendarAlt,
  FaPhoneAlt,
  FaClipboardList,
} from "react-icons/fa";

export default function ContactList() {
  const [control, setControl] = useState("");
  const [contactList, setContactList] = useState([]);
  const [filterList, setFilterList] = useState([]);

  useEffect(() => {
    handleContactList();
  }, []);

  async function handleContactList() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
          setContactList(data.results);
          setFilterList(data.results);
        } else {
          console.error("داده‌های دریافت‌شده در فرمت مورد انتظار نیستند");
          setContactList([]);
          setFilterList([]);
        }
      } else {
        console.error("خطا در دریافت داده‌ها:", response.status);
        setContactList([]);
        setFilterList([]);
      }
    } catch (error) {
      console.log("error:" + error);
      setContactList([]);
      setFilterList([]);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fa-IR", options);
  }

  function handelChange(event) {
    const value = event.target.value;
    setControl(value);
    if (value.trim() === "") {
      setFilterList(contactList);
    } else {
      const data = contactList.filter((item) =>
        item.full_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilterList(data);
    }
  }

  return (
    <>
      <NavigationBar />
      <Container className="my-4" dir="rtl">
        <Card>
          <Card.Header className="text-center">
            <h4>
              <CiCircleList className="mx-2 text-danger" />
              لیست مخاطبین
            </h4>
          </Card.Header>
          <Card.Body>
            <Form className="mb-5">
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="لطفا نام مورد نظر را وارد کنید..."
                  value={control}
                  onChange={handelChange}
                />
              </Form.Group>
            </Form>
            {filterList.length === 0 ? (
              <Card className="mt-5 mb-3 text-center mx-5 shadow-sm">
                <h4 className="mt-4">لیست جدیدی برای شما وجود ندارد</h4>
                <p className="text-secondary">
                  در حال حاضر هیچ لیست تخصیص یافته‌ای برای مخاطبین وجود ندارد.
                </p>
              </Card>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {filterList.map((item) => (
                  <Col key={item.id}>
                    <Card className="shadow-sm mb-0 mt-0">
                      <Card.Body>
                        <Card.Title className="mb-3 fw-bold">
                          {item.full_name || "نامشخص"}
                        </Card.Title>
                        <ListGroup variant="flush" className="mb-3">
                          <ListGroup.Item>
                            <FaPhoneAlt className="me-2 text-primary" />
                            {item.phone || "شماره موجود نیست"}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <HiOutlineMail className="me-2 text-info" />
                            {item.email || "ایمیل موجود نیست"}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <FiMapPin className="me-2 text-success" />
                            {item.address || "آدرس موجود نیست"}
                          </ListGroup.Item>
                        </ListGroup>

                        <ListGroup variant="flush" className="mb-3">
                          <ListGroup.Item>
                            <FaUserTie className="me-2 text-warning" />
                            تماس‌گیرنده: {item.assigned_caller || "تعیین نشده"}
                            {item.assigned_caller_phone && (
                              <>
                                {" "}
                                - <FiPhone className="me-1" />{" "}
                                {item.assigned_caller_phone}
                              </>
                            )}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            وضعیت تماس:{" "}
                            <Badge
                              bg={
                                item.call_status === "pending"
                                  ? "warning"
                                  : item.call_status === "completed"
                                  ? "success"
                                  : item.call_status === "failed"
                                  ? "danger"
                                  : "secondary"
                              }
                            >
                              {item.call_status || "نامشخص"}
                            </Badge>
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <FaClipboardList className="me-2" />
                            آمار تماس‌ها:
                            <ul
                              className="mb-0"
                              style={{ listStyleType: "none", paddingRight: 0 }}
                            >
                              <li>
                                کل تماس‌ها:{" "}
                                {item.call_statistics?.total_calls || 0}
                              </li>
                              <li>
                                پاسخ داده شده:{" "}
                                {item.call_statistics?.answered_calls || 0}
                              </li>
                              <li>
                                پاسخ داده نشده:{" "}
                                {item.call_statistics?.unanswered_calls || 0}
                              </li>
                              <li>
                                تماس‌های ناموفق:{" "}
                                {item.call_statistics?.unreachable_calls || 0}
                              </li>
                            </ul>
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <FaCalendarAlt className="me-2" />
                            تاریخ ایجاد: {formatDate(item.created_at)} (
                            {item.persian_created_by || "-"})
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
