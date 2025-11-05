import React, { useState, useEffect } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login.css";
import {API_BASE_URL} from "../config.js";
export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 دقیقه (300 ثانیه)
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone;

  useEffect(() => {
    // بررسی وجود شماره تلفن
    if (!phone) {
      console.warn("شماره تلفن در state وجود ندارد. هدایت به /login");
      navigate("/login");
    }

    // تایمر ۵ دقیقه‌ای
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [navigate, phone]);

  function handleSubmit(event){
    event.preventDefault()
  }

  async function handleClick() {

    if (otp.trim() === "") {
      setError("لطفا کد تأیید را وارد نمایید");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // دیباگ: نمایش داده‌های ارسالی
      let payload = { 
        phone : phone?.trim(), 
        otp: otp.trim().toString()
    };

      const response = await fetch(`${API_BASE_URL}/api/verify-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials:"include",
        body: JSON.stringify(payload),
      });

      // دیباگ: نمایش وضعیت و پاسخ کامل
      const data = await response.json();

      if (response.ok) {
        // بررسی وجود فیلدهای مورد نیاز
        if (!data.token || !data.user_id) {
          throw new Error("پاسخ API ناقص است: token یا user_id وجود ندارد");
        }

        localStorage.setItem("authToken", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user_id,
            username: data.username || "", // در صورت نبود username
            fullname: data.full_name || "", // در صورت نبود full_name
            phonenumber: data.phone || phone,
            role: data.role || "",
          })
        );
        setOtp("");
        navigate("/home");
      } else {
        setError(data.message || "کد تأیید نامعتبر است.");
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error("خطا:", error.message);
      setError(error.message || "خطا در ارتباط با سرور. لطفا دوباره امتحان کنید.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

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
                <p className="text-center">کد تأیید برای {phone} ارسال شد</p>
                <p className="text-center">زمان باقی‌مانده: {formatTime(timer)}</p>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mt-5">
                    <Form.Control
                      type="text"
                      placeholder="کد تأیید"
                      className="text-end"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
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
                      onClick={handleClick}
                    >
                      {isLoading ? "...در حال بررسی" : "تأیید کد"}
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