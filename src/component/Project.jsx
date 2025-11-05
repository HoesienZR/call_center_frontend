import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";
import {
  Card,
  Col,
  Row,
  Container,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import moment from "jalali-moment";
import { BsFillFileEarmarkTextFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import {API_BASE_URL} from "../config.js";

export default function Project() {
  const [listItem, setListItem] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [showmodal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [getdata, setGetData] = useState(false);
  const [userid, setUserId] = useState("");
  const [projectname, setProjectName] = useState("");
  const [caption, setCaption] = useState("");
  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(true); // فقط این اضافه شد
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("authToken");

  // دریافت پروژه‌ها
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
          setListItem(data.results);
        } else {
          setListItem([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setListItem([]);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
          setUsersData(data.results);
        } else {
          setUsersData([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsersData([]);
      } finally {
        setLoading(false); // لودینگ تموم شد (بعد از هر دو API)
      }
    };

    fetchProjects();
    fetchUsers();
  }, [getdata, token]);

  // یافتن کاربر کنونی و بررسی can_create_projects
  const currentUser = usersData.find((u) => u.username === user?.username);
  const canCreateProjects = currentUser?.can_create_projects || false;

  const fetchQuestions = async (projectId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/questions/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        setQuestionsData(
          data.results.map((q) => ({
            id: q.id,
            text: q.text,
            answers: q.choices
              ? q.choices.map((c) => ({ id: c.id, text: c.text }))
              : [],
          }))
        );
      } else {
        setQuestionsData([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestionsData([]);
    }
  };

  async function handleDelete() {
    try {
      await fetch(`${API_BASE_URL}/api/projects/${userid}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      setListItem((prev) => prev.filter((item) => item.id !== userid));
      setShowModalDelete(false);
      setGetData((prev) => !prev);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }

  async function EditHandler() {
    try {
      if (!projectname || !caption) {
        alert("لطفاً نام پروژه و توضیحات را پر کنید.");
        return;
      }
      if (
        questionsData.some((q) => !q.text || q.answers.some((a) => !a.text))
      ) {
        alert("لطفاً تمام سوالات و پاسخ‌ها را پر کنید.");
        return;
      }
      const userInfoNew = {
        name: projectname,
        description: caption,
        created_by_id: user.id,
      };
      const projectResponse = await fetch(
        `${API_BASE_URL}/api/projects/${userid}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userInfoNew),
        }
      );
      if (!projectResponse.ok) {
        const errorData = await projectResponse.json();
        throw new Error(
          `HTTP error! status: ${
            projectResponse.status
          }, details: ${JSON.stringify(errorData)}`
        );
      }
      const updatedProject = await projectResponse.json();
      for (const qData of questionsData) {
        let questionId = qData.id;
        if (qData.id) {
          const questionResponse = await fetch(
            `${API_BASE_URL}/api/projects/${userid}/questions/${qData.id}/`,
            {
              method: "PUT",
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                project_id: userid,
                text: qData.text,
              }),
            }
          );
          if (!questionResponse.ok) {
            const errorData = await questionResponse.json();
            throw new Error(
              `Failed to update question: ${JSON.stringify(errorData)}`
            );
          }
        } else {
          const questionResponse = await fetch(
            `${API_BASE_URL}/api/projects/${userid}/questions/`,
            {
              method: "POST",
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                project_id: userid,
                text: qData.text,
              }),
            }
          );
          if (!questionResponse.ok) {
            const errorData = await questionResponse.json();
            throw new Error(
              `Failed to create question: ${JSON.stringify(errorData)}`
            );
          }
          const questionData = await questionResponse.json();
          questionId = questionData.id;
        }
        for (const answer of qData.answers) {
          if (answer.id) {
            const choiceResponse = await fetch(
              `${API_BASE_URL}/api/projects/${userid}/questions/${questionId}/choices/${answer.id}/`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Token ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  question_id: questionId,
                  text: answer.text,
                }),
              }
            );
            if (!choiceResponse.ok) {
              const errorData = await choiceResponse.json();
              throw new Error(
                `Failed to update choice: ${JSON.stringify(errorData)}`
              );
            }
          } else {
            const choiceResponse = await fetch(
              `${API_BASE_URL}/api/projects/${userid}/questions/${questionId}/choices/`,
              {
                method: "POST",
                headers: {
                  Authorization: `Token ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  question_id: questionId,
                  text: answer.text,
                }),
              }
            );
            if (!choiceResponse.ok) {
              const errorData = await choiceResponse.json();
              throw new Error(
                `Failed to create choice: ${JSON.stringify(errorData)}`
              );
            }
          }
        }
      }
      setListItem((prev) =>
        prev.map((item) =>
          item.id === userid ? { ...item, ...updatedProject } : item
        )
      );
      setShowModal(false);
      setGetData((prev) => !prev);
      alert("پروژه و سوالات با موفقیت ویرایش شدند.");
    } catch (error) {
      console.error("Error editing project:", error);
      alert(`خطا در ویرایش پروژه یا سوالات: ${error.message}`);
    }
  }

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questionsData];
    newQuestions[index].text = value;
    setQuestionsData(newQuestions);
  };

  const handleAnswerChange = (qIndex, aIndex, value) => {
    const newQuestions = [...questionsData];
    newQuestions[qIndex].answers[aIndex].text = value;
    setQuestionsData(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestionsData([...questionsData, { text: "", answers: [{ text: "" }] }]);
  };

  const handleAddAnswer = (qIndex) => {
    const newQuestions = [...questionsData];
    newQuestions[qIndex].answers.push({ text: "" });
    setQuestionsData(newQuestions);
  };

  const handleDeleteQuestion = async (qIndex, qId) => {
    try {
      if (qId) {
        await fetch(
          `${API_BASE_URL}/api/projects/${userid}/questions/${qId}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
      const newQuestions = questionsData.filter((_, index) => index !== qIndex);
      setQuestionsData(newQuestions);
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("خطا در حذف سوال.");
    }
  };

  const handleDeleteAnswer = async (qIndex, aIndex) => {
    try {
      const answerId = questionsData[qIndex].answers[aIndex].id;
      if (answerId) {
        await fetch(
          `${API_BASE_URL}/api/projects/${userid}/questions/${questionsData[qIndex].id}/choices/${answerId}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
      const newQuestions = [...questionsData];
      newQuestions[qIndex].answers = newQuestions[qIndex].answers.filter(
        (_, index) => index !== aIndex
      );
      setQuestionsData(newQuestions);
    } catch (error) {
      console.error("Error deleting choice:", error);
      alert("خطا در حذف پاسخ.");
    }
  };

  return (
    <>
      <NavigationBar />
      <Container dir="rtl">
        {loading ? (
          <div className="text-center py-5 my-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted fs-5">در حال بارگذاری پروژه‌ها...</p>
          </div>
        ) : (
          <Card className="mt-5 p-3">
            <Card.Header className="d-flex justify-content-between">
              <div className="mt-1" style={{ fontSize: "20px" }}>
                مدیریت پروژه‌ها
              </div>
              <div>
                {canCreateProjects && (
                  <Link to="/project/create" className="btn btn-success">
                    ایجاد پروژه جدید
                  </Link>
                )}
                {!canCreateProjects && usersData.length > 0 && (
                  <p className="text-danger">
                    شما اجازه ایجاد پروژه جدید ندارید.
                  </p>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {listItem.length === 0 ? (
                <div className="text-center mt-5">
                  <h4>مدیریت پروژه‌ها</h4>
                  <p className="mb-0 mt-4">
                    در حال حاضر هیچ پروژه‌ای برای نمایش وجود ندارد
                  </p>
                </div>
              ) : (
                <div>
                  <Row>
                    {listItem.map((item, index) => (
                      <Col xl="4" lg="6" md="6" sm="12" key={item.id || index}>
                        <Card className="mt-5">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <h5>{item.name || "بدون نام"}</h5>
                              <p className="text-secondary">
                                {item.persian_created_at || "تاریخ نامشخص"}
                              </p>
                            </div>
                            <h6>{item.description || "بدون توضیحات"}</h6>
                            <div className="mt-4">
                              {user.id === item.created_by.id && (
                                <>
                                  <Button
                                    variant="secondary"
                                    onClick={() => {
                                      setShowModal(true);
                                      setUserId(item.id);
                                      setProjectName(item.name || "");
                                      setCaption(item.description || "");
                                      fetchQuestions(item.id);
                                    }}
                                  >
                                    ویرایش
                                  </Button>
                                  <Button
                                    variant="danger"
                                    className="mx-2"
                                    onClick={() => {
                                      setShowModalDelete(true);
                                      setUserId(item.id);
                                    }}
                                  >
                                    حذف
                                  </Button>
                                </>
                              )}
                              <Link
                                to={`/project/${item.id}`}
                                className="btn btn-primary text-white"
                              >
                                مشاهده جزئیات
                              </Link>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* مودال حذف */}
        <Modal
          show={showModalDelete}
          backdrop="static"
          style={{ direction: "rtl" }}
        >
          <Modal.Body>
            <h5>آیا مطمئن هستید که می‌خواهید این پروژه را حذف کنید؟</h5>
            <div className="mt-3">
              <Button
                variant="secondary"
                onClick={() => setShowModalDelete(false)}
              >
                انصراف
              </Button>
              <Button variant="danger" className="mx-3" onClick={handleDelete}>
                حذف
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* مودال ویرایش */}
        <Modal
          show={showmodal}
          backdrop="static"
          style={{ direction: "rtl" }}
          size="lg"
        >
          <Modal.Body>
            <h5>لطفا تغییرات خود را اعمال نمایید</h5>
            <Form>
              <Form.Group>
                <Form.Label>نام پروژه:</Form.Label>
                <Form.Control
                  type="text"
                  value={projectname}
                  onChange={(event) => setProjectName(event.target.value)}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>توضیحات:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>سوالات و پاسخ‌ها:</Form.Label>
                {questionsData.length === 0 ? (
                  <p>هیچ سوالی برای این پروژه وجود ندارد.</p>
                ) : (
                  questionsData.map((qData, qIndex) => (
                    <div key={qIndex} className="mb-3 p-3 border rounded">
                      <Form.Group>
                        <Form.Label>{`سوال ${qIndex + 1}:`}</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={qData.text}
                          onChange={(e) =>
                            handleQuestionChange(qIndex, e.target.value)
                          }
                        />
                      </Form.Group>
                      {qData.answers.map((answer, aIndex) => (
                        <Form.Group
                          key={aIndex}
                          className="mt-2 d-flex align-items-center"
                        >
                          <Form.Label className="me-2">{`پاسخ ${
                            aIndex + 1
                          }:`}</Form.Label>
                          <Form.Control
                            type="text"
                            value={answer.text}
                            onChange={(e) =>
                              handleAnswerChange(qIndex, aIndex, e.target.value)
                            }
                            className="me-2"
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteAnswer(qIndex, aIndex)}
                          >
                            حذف
                          </Button>
                        </Form.Group>
                      ))}
                      <Button
                        variant="success"
                        className="mt-2 me-2"
                        onClick={() => handleAddAnswer(qIndex)}
                      >
                        افزودن پاسخ
                      </Button>
                      <Button
                        variant="danger"
                        className="mt-2 mx-2"
                        onClick={() => handleDeleteQuestion(qIndex, qData.id)}
                      >
                        حذف سوال
                      </Button>
                    </div>
                  ))
                )}
                <Button
                  variant="outline-primary"
                  className="mt-3"
                  onClick={handleAddQuestion}
                >
                  افزودن سوال جدید
                </Button>
              </Form.Group>
              <div className="mt-3">
                <Button variant="danger" onClick={() => setShowModal(false)}>
                  انصراف
                </Button>
                <Button
                  variant="secondary"
                  className="mx-3"
                  onClick={EditHandler}
                >
                  ویرایش
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}
