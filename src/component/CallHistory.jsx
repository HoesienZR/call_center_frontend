import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";
import {
  Card,
  Col,
  Container,
  Row,
  ListGroup,
  Form,
  Button,
  Modal,
  Spinner,
} from "react-bootstrap";
import { BsClockHistory } from "react-icons/bs";
import { useParams } from "react-router-dom";
import moment from "jalali-moment";
import {API_BASE_URL} from "../config.js";
export default function CallHistory() {
  const [list, setList] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [control, setControl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentContactId, setCurrentContactId] = useState(null);
  const [currentContactProject, setCurrentContactProject] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true); // فقط این اضافه شد
  const { id } = useParams();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("توکن احراز هویت یافت نشد. لطفاً ابتدا وارد سیستم شوید.");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `${API_BASE_URL}/api/calls/?project_id=${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
          setList(data.results);
          setFilterList(data.results);
        } else {
          setList([]);
          setFilterList([]);
        }
      } else {
        setList([]);
        setFilterList([]);
      }
    } catch (error) {
      alert("خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false); // لودینگ تموم شد
    }
  };

  function handelChange(event) {
    const value = event.target.value;
    setControl(value);
    if (value.trim() === "") {
      setFilterList(list);
    } else {
      const data = list.filter((item) =>
        item.contact?.full_name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilterList(data);
    }
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setNewNote("");
    setCurrentContactId(null);
  };

  const handleSendId = (contactIdPerson, contactIdProject) => {
    setCurrentContactProject(contactIdProject);
    setCurrentContactId(contactIdPerson);
    setShowModal(true);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      alert("لطفاً یادداشت را وارد کنید.");
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("توکن احراز هویت یافت نشد. لطفاً ابتدا وارد سیستم شوید.");
      return;
    }
    const currentItem = filterList.find(
      (item) => item.contact.id === currentContactId
    );
    const formatDate = moment().locale("fa").format("D MMMM YYYY");
    // استخراج یادداشت قبلی به شکل امن
    let previousNoteText = "";
    if (currentItem.notes) {
      const parts = currentItem.notes.split("[یادداشت جدید]");
      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1];
        previousNoteText = lastPart.replace(/\[تاریخ\]:.*$/, "").trim();
      } else {
        previousNoteText = currentItem.notes
          .replace(/\[تاریخ\]:.*$/, "")
          .trim();
      }
    }
    const combinedNotes = `[یادداشت قبلی]: ${previousNoteText}
[تاریخ]: ${formatDate}
[یادداشت جدید]: ${newNote}`;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/calls/${currentItem.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contact_id: currentItem.contact.id,
            caller_id: currentItem.caller?.id,
            project_id: id,
            notes: combinedNotes,
          }),
        }
      );
      if (response.ok) {
        await fetchContacts();
        handleCloseModal();
      } else {
        const errorData = await response.json();
        alert(
          `خطا در افزودن یادداشت: ${errorData.detail || response.statusText}`
        );
      }
    } catch (error) {
      alert("خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <>
      <NavigationBar />
      <Container dir="rtl" className="my-4">
        {loading ? (
          <div className="text-center py-5 my-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted fs-5">
              در حال بارگذاری تاریخچه تماس...
            </p>
          </div>
        ) : (
          <Card>
            <Card.Header className="text-center">
              <h4>
                <BsClockHistory className="text-info mx-2" />
                تاریخچه تماس کاربر
              </h4>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="لطفا نام مورد نظر را وارد کنید..."
                    value={control}
                    onChange={handelChange}
                  />
                </Form.Group>
              </Form>

              <div className="mt-4">
                {filterList.length === 0 ? (
                  <Card className="mt-5 mb-3 text-center mx-5">
                    <h4 className="mt-4">مخاطب جدیدی برای شما وجود ندارد</h4>
                    <p className="text-secondary">
                      در حال حاضر هیچ مخاطب تخصیص یافته‌ای برای تماس وجود ندارد.
                    </p>
                  </Card>
                ) : (
                  filterList.map((item) => (
                    <Card key={item.id} className="mt-4 shadow-sm">
                      <Card.Header className="text-center bg-light">
                        <h5>اطلاعات کاربر</h5>
                      </Card.Header>
                      <Card.Body>
                        <Row className="mb-3">
                          <Col md={6} lg={4}>
                            <strong>نام کامل:</strong>{" "}
                            {item.contact?.full_name || "نامشخص"}
                          </Col>
                          <Col md={6} lg={4}>
                            <strong>شماره تماس:</strong>{" "}
                            {item.contact?.phone || "نامشخص"}
                          </Col>
                          <Col md={6} lg={4}>
                            <strong>ایمیل:</strong>{" "}
                            {item.contact?.email || "نامشخص"}
                          </Col>
                          <Col md={6} lg={4}>
                            <strong>آدرس:</strong>{" "}
                            {item.contact?.address || "نامشخص"}
                          </Col>
                          <Col md={6} lg={4}>
                            <strong>تاریخ تولد:</strong>{" "}
                            {item.contact?.birth_date || "نامشخص"}
                          </Col>
                          <Col md={6} lg={4}>
                            <strong>جنسیت:</strong>{" "}
                            {item.contact?.gender || "نامشخص"}
                          </Col>
                          <Col md={6} lg={4}>
                            <strong>تماس گیرنده اختصاصی:</strong>{" "}
                            {item.contact?.assigned_caller || "نامشخص"}
                          </Col>
                          <Col md={6} lg={4}>
                            <strong>شماره تماس تماس گیرنده:</strong>{" "}
                            {item.contact?.assigned_caller_phone || "نامشخص"}
                          </Col>
                          <Col md={6} lg={4}>
                            <strong>وضعیت تماس:</strong>{" "}
                            {item.contact?.call_status || "نامشخص"}
                          </Col>
                          <Col md={6} lg={4}>
                            <strong>قابلیت تماس:</strong>{" "}
                            {item.contact?.can_call ? "بله" : "خیر"}
                          </Col>
                          <Col md={12}>
                            <strong>فیلدهای سفارشی:</strong>{" "}
                            {item.contact?.custom_fields &&
                            item.contact.custom_fields.trim() !== ""
                              ? item.contact.custom_fields
                              : "نامشخص"}
                          </Col>
                        </Row>
                        <hr />
                        <h6>یادداشت‌های تماس:</h6>
                        {item.contact?.call_notes &&
                        item.contact.call_notes.length > 0 ? (
                          <ListGroup variant="flush">
                            {item.contact.call_notes.map((note, idx) => (
                              <ListGroup.Item
                                key={idx}
                                className="mb-2 p-3 bg-light rounded"
                              >
                                <p>
                                  <strong>تاریخ:</strong> {note.created_at}
                                </p>
                                <p>
                                  <strong>نتیجه تماس:</strong>{" "}
                                  {note.call_result}
                                </p>
                                <p>
                                  <strong>یادداشت:</strong>{" "}
                                  {note.note || "بدون یادداشت"}
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    className="mx-2"
                                    onClick={() =>
                                      handleSendId(item.contact.id, item.id)
                                    }
                                  >
                                    ایجاد یادداشت جدید
                                  </Button>
                                </p>
                                {note.answers && note.answers.length > 0 && (
                                  <>
                                    <strong>پاسخ‌ها:</strong>
                                    <ul>
                                      {note.answers.map((answer, aIdx) => (
                                        <li key={aIdx}>
                                          سوال: {answer.question_text} - پاسخ:{" "}
                                          {answer.selected_choice_text}
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <p>
                            هیچ یادداشتی برای این کاربر وجود ندارد.
                            <Button
                              variant="primary"
                              size="sm"
                              className="mx-2"
                              onClick={() =>
                                handleSendId(item.contact.id, item.id)
                              }
                            >
                              ایجاد یادداشت جدید
                            </Button>
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Modal for adding new note */}
        <Modal show={showModal} onHide={handleCloseModal} centered dir="rtl">
          <Modal.Header>
            <Modal.Title>افزودن یادداشت جدید</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>یادداشت:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="یادداشت خود را وارد کنید..."
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              بستن
            </Button>
            <Button variant="primary" onClick={handleAddNote}>
              افزودن یادداشت
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}
