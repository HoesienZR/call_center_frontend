import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { useParams } from "react-router-dom";
import {API_BASE_URL} from "../config.js";

export default function UserList() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true); // فقط این اضافه شد
  const { id } = useParams();

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true); // لودینگ شروع شد
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${id}/members/`,
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
        if (data.members && Array.isArray(data.members)) {
          const formattedUsers = data.members.map((user) => ({
            ...user,
            role_display: user.role === "caller" ? "تماس گیرنده" : "کاربر عادی",
          }));
          setUsers(formattedUsers);
          setFilteredUsers(formattedUsers);
        } else {
          console.error("داده‌های دریافت‌شده در فرمت مورد انتظار نیستند");
          setUsers([]);
          setFilteredUsers([]);
        }
      } else {
        console.error("خطا در دریافت داده‌ها:", response.status);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("خطا در دریافت اعضا:", error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false); // لودینگ تموم شد
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  function handleInput(event) {
    const value = event.target.value;
    setSearch(value);
    if (value.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((item) =>
        item.phone_number.includes(value)
      );
      setFilteredUsers(filtered);
    }
  }

  async function handleCreate(userId, currentRole) {
    try {
      const newRole = currentRole === "caller" ? "contact" : "caller";
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${id}/toggle-user-role/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, current_role: currentRole }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        console.error("خطا از سرور:", data);
        return;
      }
      // به جای به‌روزرسانی دستی state، داده‌ها را دوباره از سرور بارگذاری می‌کنیم
      await fetchMembers();
    } catch (error) {
      console.error("خطا در تغییر نقش:", error);
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
            <p className="mt-3 text-muted fs-5">
              در حال بارگذاری لیست کاربران...
            </p>
          </div>
        ) : (
          <Card className="mb-4">
            <Card.Header className="text-center">
              <h5>لیست کاربران پروژه</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} className="mt-4">
                <Form.Group>
                  <Form.Control
                    type="text"
                    value={search}
                    onChange={handleInput}
                    placeholder="جستجو بر اساس شماره تلفن..."
                  />
                </Form.Group>
              </Form>

              <div>
                <p className="text-secondary mt-3">
                  تعداد کاربران ({filteredUsers.length})
                </p>
              </div>

              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <Card className="mt-5 p-3" key={user.id}>
                    <Row className="text-center">
                      <Col lg="6">
                        <p className="text-secondary">{user.full_name}</p>
                        <p className="text-secondary">
                          شماره تلفن: {user.phone_number}
                        </p>
                        <p className="text-secondary">
                          نقش: {user.role_display}
                        </p>
                      </Col>
                      <Col lg="6">
                        <Button
                          variant="success"
                          className="mt-4"
                          onClick={() => {
                            handleCreate(user.id, user.role);
                          }}
                        >
                          {user.role === "caller"
                            ? "تبدیل به کاربر عادی"
                            : "تبدیل به تماس گیرنده"}
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted py-4">
                  کاربری برای این پروژه یافت نشد
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
}
