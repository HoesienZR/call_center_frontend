import React, { useState, useEffect } from "react";
import NavigationBar from "./NavigationBar";
import { Button, Card, Container, Form, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaUserGroup } from "react-icons/fa6";
import {API_BASE_URL} from "../config.js";

export default function CallRequest() {
  const [list, setList] = useState([]);
  const [input, setInput] = useState("");
  const [filterList, setFilterList] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [buttonStates, setButtonStates] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  
  useEffect(() => {
    fetchContacts();
  }, [id]);

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
        console.log(data);
        if (data.results && Array.isArray(data.results)) {
          setList(data.results);
          setFilterList(data.results);
          // تنظیم حالت اولیه دکمه‌ها برای هر مخاطب
          const initialButtonStates = data.results.reduce((acc, item) => {
            console.log(item.assigned_caller_phone);
            console.log(user.phone);
          const isAuthorized = item.assigned_caller_phone === user?.phonenumber;
            acc[item.id] = {
              text: "تماس",
              variant: "success",
              isAuthorized, // اضافه کردن ویژگی برای بررسی مجوز
            };
            return acc;
          }, {});
          setButtonStates(initialButtonStates);
        } else {
          console.error("داده‌های دریافت‌شده در فرمت مورد انتظار نیستند");
          setList([]);
          setFilterList([]);
        }
      } else {
        console.error("خطا در دریافت داده‌ها:", response.status);
        setList([]);
        setFilterList([]);
      }
    } catch (error) {
      console.error("خطا در اتصال به API:", error);
      setList([]);
      setFilterList([]);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/contacts/${contactId}/release/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const updatedList = list.filter((item) => item.id !== contactId);
        setList(updatedList);
        setFilterList(updatedList);
      } else {
        console.error("خطا در حذف مخاطب از دیتابیس:", response.status);
      }
    } catch (error) {
      console.error("خطا در اتصال به API برای حذف:", error);
    }
  };

  function handleSubmit(event) {
    event.preventDefault();
  }

  function setHandleInput(event) {
    const value = event.target.value;
    setInput(value);
    if (value.trim() === "") {
      setFilterList(list);
    } else {
      const data = list.filter((item) =>
        item.full_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilterList(data);
    }
  }

  async function handleSendId() {
    try {
      const project = { project_id: id };
      const postResponse = await fetch(
        "http://127.0.0.1:8000/api/contacts/request_new/",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(project),
        }
      );

      if (!postResponse.ok) {
        const errorData = await postResponse.json();
        throw new Error(errorData.message || "خطا در ارسال درخواست تماس");
      }

      const responseData = await postResponse.json();
      await fetchContacts();
      alert("درخواست تماس با موفقیت ثبت شد و مخاطب جدید اضافه شد!");
    } catch (error) {
      console.error("خطا در اتصال به API:", error);
      alert(`خطا در ثبت درخواست تماس: ${error.message}`);
    }
  }

  const handleShowModal = (contact) => {
    console.log("Selected Contact:", contact);
    setSelectedContact(contact);
    setModalShow(true);
  };

  const handleTextClick = (contact) => {
    setButtonStates((prev) => ({
      ...prev,
      [contact.id]: {
        text: "در حال انجام تماس...",
        variant: "primary",
        isAuthorized: prev[contact.id].isAuthorized,
      },
    }));

    setTimeout(() => {
      setButtonStates((prev) => ({
        ...prev,
        [contact.id]: {
          text: "تماس",
          variant: "success",
          isAuthorized: prev[contact.id].isAuthorized,
        },
      }));
      navigate(`/project/${id}/call-feedback`, {
        state: {
          full_name: contact.full_name,
          phone: contact.phone,
          contact_id: contact.id,
        },
      });
    }, 3000);
  };

  return (
    <>
      <NavigationBar />
      <Container dir="rtl">
        <Card className="mx-4 mt-5">
          <Card.Body>
            <div className="d-flex justify-content-between mx-3">
              <div>
                <h4 className="text-center" style={{ color: "blue" }}>
                  درخواست تماس‌ها
                </h4>
              </div>
              <div>
                <Button variant="primary" onClick={handleSendId}>
                  درخواست تماس
                </Button>
              </div>
            </div>
          </Card.Body>
          <Card.Body>
            <div className="mt-3">
              <Form onSubmit={handleSubmit}>
                <Form.Control
                  type="text"
                  placeholder="جستجو در مخاطبین..."
                  className="rounded-4"
                  value={input}
                  onChange={setHandleInput}
                />
              </Form>
              <div className="mt-4">
                <h5>لیست مخاطبین ({filterList.length}) مخاطب</h5>
              </div>
            </div>
            {filterList.length === 0 ? (
              <Card className="mt-5 mb-3 text-center mx-5">
                <h4 className="mt-4">مخاطب جدیدی برای شما وجود ندارد</h4>
                <p className="text-secondary">
                  در حال حاضر هیچ مخاطب تخصیص یافته‌ای برای تماس وجود ندارد.
                </p>
              </Card>
            ) : (
              filterList.map((item) => (
                <Card key={item.id} className="mt-4">
                  <Card.Body>
                    <div className="d-flex justify-content-around align-items-center">
                      <div>
                        <h6>نام و نام خانوادگی: {item.full_name}</h6>
                      </div>
                      <div>
                        <h6>شماره تلفن: {item.phone}</h6>
                      </div>
                      <div>
                        <Button
                          variant="info"
                          className="text-white"
                          onClick={() => handleShowModal(item)}
                        >
                          اطلاعات
                        </Button>
                      </div>
                      {buttonStates[item.id]?.isAuthorized ? (
                        <>
                          <div>
                            <Button
                              variant={
                                buttonStates[item.id]?.variant || "success"
                              }
                              href={`tel:${item.phone}`}
                              title={`تماس با ${item.full_name}`}
                              onClick={() => handleTextClick(item)}
                            >
                              {buttonStates[item.id]?.text || "تماس"}
                            </Button>
                          </div>
                          <div>
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteContact(item.id)}
                              title={`رد کردن ${item.full_name}`}
                            >
                              رد کردن
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div>
                          <p className="text-secondary mt-3">
                            شما مجاز به تماس یا رد کردن نیستید
                          </p>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </Card.Body>
        </Card>
      </Container>
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        style={{ direction: "rtl" }}
      >
        <Modal.Body>
          <div className="text-center">
            <h5>اطلاعات</h5>
          </div>
          <div className="d-flex mt-4">
            <p className="text-secondary">تماس گیرنده مسئول:</p>
            <p className="text-primary mx-2">
              {user?.username} <FaUserGroup className="mx-1" />
            </p>
          </div>
          <div className="mt-2">
            <p className="text-secondary">یادداشت‌های تماس:</p>
            <p style={{ fontSize: "14px" }}>
              آدرس سکونت: {selectedContact?.address || "آدرس نامشخص"}
            </p>
            <p style={{ fontSize: "14px" }}>
              شماره تماس گیرنده:{" "}
              {selectedContact?.assigned_caller_phone || "شماره نامشخص"}
            </p>
            <p style={{ fontSize: "14px" }}>
              جنسیت: {selectedContact?.gender || "نامشخص"}
            </p>
            <p style={{ fontSize: "14px" }}>
              فیلدهای سفارشی: {selectedContact?.custom_fields || "نامشخص"}
            </p>
            {selectedContact?.call_notes?.length > 0 ? (
              selectedContact.call_notes.map((note, index) => (
                <div key={index} className="mt-2">
                  <p style={{ fontSize: "14px" }}>
                    یادداشت: {note.note || "نامشخص"}
                  </p>
                  <p style={{ fontSize: "14px" }}>
                    تاریخ ایجاد: {note.created_at || "نامشخص"}
                  </p>
                  <p style={{ fontSize: "14px" }}>
                    نتیجه تماس: {note.call_result || "نامشخص"}
                  </p>
                  <p style={{ fontSize: "14px" }}>پاسخ‌ها:</p>
                  {note.answers?.length > 0 ? (
                    note.answers.map((answer, ansIndex) => (
                      <div key={ansIndex} style={{ marginRight: "20px" }}>
                        <p style={{ fontSize: "14px" }}>
                          سوال: {answer.question_text || "نامشخص"}
                        </p>
                        <p style={{ fontSize: "14px" }}>
                          پاسخ انتخاب شده:{" "}
                          {answer.selected_choice_text || "نامشخص"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: "14px" }}>پاسخی ثبت نشده است</p>
                  )}
                </div>
              ))
            ) : (
              <p style={{ fontSize: "14px" }}>یادداشتی ثبت نشده است</p>
            )}
          </div>
          <div className="d-flex mt-2">
            <p className="text-warning mx-2">
              وضعیت: {selectedContact?.call_status || "وضعیت نامشخص"}
            </p>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
