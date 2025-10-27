import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { useParams } from "react-router-dom";
import {API_BASE_URL} from "../config.js";

export default function UserList() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
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
        console.log("Fetched members:", data);
        if (data.members && Array.isArray(data.members)) {
          const formattedUsers = data.members.map((user) => ({
            ...user,
            role_display: user.role === "caller" ? "تماس گیرنده" : "مخاطب",
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
      console.log(
        `Sending request to toggle role for user ${userId} from ${currentRole} to ${newRole}`
      );

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
      console.log("Server response:", data);

      if (!response.ok) {
        console.error("خطا از سرور:", data);
        return;
      }

      // به جای به‌روزرسانی دستی state، داده‌ها را دوباره از سرور بارگذاری می‌کنیم
      console.log("Reloading members after role change...");
      await fetchMembers();
    } catch (error) {
      console.error("خطا در تغییر نقش:", error);
    }
  }

  return (
    <>
      <NavigationBar />
      <Container dir="rtl">
        <Card className="mb-4">
          <Card.Header className="text-center">
            <h5>
              <FaUser
                className="mx-1 text-primary"
                style={{ fontSize: "18px" }}
              />
              لیست کاربران پروژه
            </h5>
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
            {filteredUsers.map((user) => (
              <Card className="mt-5 p-3" key={user.id}>
                <Row className="text-center">
                  <Col lg="6">
                    <p className="text-secondary">{user.full_name}</p>
                    <p className="text-secondary">
                      شماره تلفن: {user.phone_number}
                    </p>
                    <p className="text-secondary">نقش: {user.role_display}</p>
                  </Col>
                  <Col lg="6">
                    <Button
                      variant="success"
                      className="mt-4"
                      onClick={() => {
                        console.log(
                          `Button clicked for user ${user.id}, current role: ${user.role}`
                        );
                        handleCreate(user.id, user.role);
                      }}
                    >
                      {user.role === "caller"
                        ? "تبدیل به مخاطب"
                        : "تبدیل به تماس گیرنده"}
                    </Button>
                  </Col>
                </Row>
              </Card>
            ))}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}