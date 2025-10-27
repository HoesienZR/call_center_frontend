import React, { useState, useEffect } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import {API_BASE_URL} from "../config.js";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (phone === "") {
      setError("لطفا شماره همراه خود را وارد نمایید");
      setTimeout(() => setError(null), 2000);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/request-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        navigate("/verify-otp", { state: { phone } });
      } else {
        const data = await response.json();
        setError(data.message || "خطایی رخ داد. لطفا دوباره امتحان کنید.");
        setTimeout(() => setError(null), 2000);
      }
    } catch (error) {
      console.error("خطا در ارتباط با سرور:", error);
      setError("خطا در ارتباط با سرور. لطفا دوباره امتحان کنید.");
      setTimeout(() => setError(null), 2000);
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <section>
        <Container>
          <Row className="justify-content-center">
            <Col xl="6" lg="8" sm="10">
              <Card className="mx-5">
                <Card.Body>
                  <Card.Title className="text-center mt-3">
                    <p className="title-text">مرکز تماس</p>
                  </Card.Title>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mt-5">
                      <Form.Control
                          type="tel"
                          placeholder="شماره همراه"
                          className="text-end"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                      />
                    </Form.Group>
                    {error && (
                        <div className="text-end mt-2">
                          <Alert variant="danger">{error}</Alert>
                        </div>
                    )}
                    <div className="text-center mb-4" style={{ marginTop: "70px" }}>
                      <Button
                          variant="success w-100"
                          type="submit"
                          disabled={isLoading}
                      >
                        {isLoading ? "...در حال ارسال" : "ارسال کد تأیید"}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
  );
}