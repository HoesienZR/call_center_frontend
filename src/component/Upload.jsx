import React, { useState } from "react";
import NavigationBar from "./NavigationBar";
import { Button, Card, Col, Container, Form, Modal, Row } from "react-bootstrap";
import { FaCircleExclamation } from "react-icons/fa6";
import { FaPhoneSquare } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import {API_BASE_URL} from "../config.js";

export default function Upload() {
  const [contact, setContact] = useState([
    { id: 1, text: "فایل اکسل حاوی اطلاعات مخاطبینی که قرار است با آن‌ها تماس گرفته شود" },
    { id: 2, text: "ستون‌های الزامی: contact_phone (شماره تلفن)" },
    { id: 3, text: "ستون‌های اختیاری: full_name (نام کامل), assigned_caller_username (نام کاربری تماس‌گیرنده)" },
    { id: 4, text: "اگر نام کامل وارد نشود، از مخاطب + شماره تلفن استفاده می‌شود" },
    { id: 5, text: "اگر assigned_caller_username وجود داشته باشد و معتبر باشد، مخاطب به آن تماس‌گیرنده تخصیص داده می‌شود" },
    { id: 6, text: "فرمت فایل: Excel (.xlsx, .xls)" },
  ]);
  const [callers, setCallers] = useState([
    { id: 1, text: "فایل اکسل حاوی اطلاعات افرادی که قرار است تماس بگیرند" },
    { id: 2, text: "ستون‌های مورد نیاز: name, last_name, phone_number" },
    { id: 3, text: "در صورت عدم وجود شماره تلفن، کاربر جدید به سیستم اضافه شده و به پروژه با دسترسی تماس‌گیرنده اختصاص می‌یابد" },
    { id: 4, text: "فرمت فایل: Excel (.xlsx, .xls)" },
  ]);
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [firstLastName, setFirstLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [givenPhoneNumber, setGivenPhoneNumber] = useState("");
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [callerFileError, setCallerFileError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setFileError("لطفاً فقط فایل‌های اکسل (.xlsx یا .xls) آپلود کنید.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/projects/${id}/import-contacts/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      setFileError(null);
      alert("مخاطبین با موفقیت آپلود شدند!");
    } catch (err) {
      setFileError(`خطا در آپلود فایل: ${err.message}`);
    }
  };

  const handleFileUploadCallers = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setCallerFileError("لطفاً فقط فایل‌های اکسل (.xlsx یا .xls) برای تماس‌گیرندگان آپلود کنید.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/projects/${id}/upload-callers/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      setCallerFileError(null);
      alert("تماس‌گیرندگان با موفقیت آپلود شدند!");
    } catch (err) {
      setCallerFileError(`خطا در آپلود فایل تماس‌گیرندگان: ${err.message}`);
    }
  };

  async function handleAddUser() {
    try {
      let sendInfo = {
        project_id: id,
        full_name: firstLastName,
        phone: phoneNumber,
        email: email,
        address: address,
        assigned_caller_phone: givenPhoneNumber,
      };
      await fetch(`${API_BASE_URL}/api/contacts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(sendInfo),
      }).then((response) => console.log(response));
      setShowModal(false);
      setFirstLastName("");
      setPhoneNumber("");
      setEmail("");
      setAddress("");
      setGivenPhoneNumber("");
      setError(null);
      alert("مخاطب با موفقیت اضافه شد!");
    } catch (error) {
      console.error("خطا در افزودن مخاطب:", error);
      setError(error.message);
    }
  }

  return (
    <>
      <NavigationBar />
      <Container dir="rtl">
        <Card className="p-3 mt-5">
          <Card.Header>
            <div className="text-center">
              <FaCircleExclamation className="mx-1 text-info" style={{ fontSize: "18px" }} />
              راهنمای آپلود فایل‌ها
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col lg="6">
                <Card className="mt-5">
                  <Card.Header>
                    <div className="text-center">
                      <FaPhoneSquare className="mx-1 text-info" style={{ fontSize: "18px" }} />
                      آپلود فایل مخاطبین
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <h5>فایل مخاطبین (contacts)</h5>
                    <ul className="mt-3">
                      {contact.map((item) => (
                        <li key={item.id} className="text-secondary">
                          {item.text}
                        </li>
                      ))}
                    </ul>
                    <div>
                      <Form>
                        <Form.Group>
                          <Form.Control type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
                        </Form.Group>
                      </Form>
                      {fileError && (
                        <div className="alert alert-danger mt-3" role="alert">
                          {fileError}
                        </div>
                      )}
                      <Button variant="primary" className="w-100 mt-3" onClick={() => setShowModal(true)}>
                        افزودن مخاطب
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg="6">
                <Card className="mt-5">
                  <Card.Header>
                    <div className="text-center">
                      <FaUserGroup className="mx-1 text-success" style={{ fontSize: "18px" }} />
                      آپلود فایل تماس‌گیرندگان
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <h5>فایل تماس‌گیرندگان (Callers)</h5>
                    <ul className="mt-3">
                      {callers.map((item) => (
                        <li key={item.id} className="text-secondary">
                          {item.text}
                        </li>
                      ))}
                    </ul>
                    <div>
                      <Form>
                        <Form.Group>
                          <Form.Control type="file" accept=".xlsx,.xls" onChange={handleFileUploadCallers} />
                        </Form.Group>
                      </Form>
                      {callerFileError && (
                        <div className="alert alert-danger mt-3" role="alert">
                          {callerFileError}
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
      <Modal show={showModal} backdrop="static" style={{ direction: "rtl" }} size="lg">
        <Modal.Header>
          <Modal.Title className="text-center">افزودن مخاطب جدید</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Form>
            <Form.Group>
              <Form.Label>نام و نام خانوادگی (الزامی):</Form.Label>
              <Form.Control type="text" value={firstLastName} onChange={(event) => setFirstLastName(event.target.value)} />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>شماره همراه (الزامی):</Form.Label>
              <Form.Control type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>ایمیل (اختیاری):</Form.Label>
              <Form.Control type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>آدرس (اختیاری):</Form.Label>
              <Form.Control type="text" as="textarea" rows={2} value={address} onChange={(event) => setAddress(event.target.value)} />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>شماره تماس‌گیرنده (اختیاری):</Form.Label>
              <Form.Control type="tel" value={givenPhoneNumber} onChange={(event) => setGivenPhoneNumber(event.target.value)} />
            </Form.Group>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                انصراف
              </Button>
              <Button variant="primary" className="mx-3" onClick={handleAddUser}>
                افزودن مخاطب
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}