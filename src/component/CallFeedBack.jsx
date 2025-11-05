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
import { FaUser, FaPhone } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {API_BASE_URL} from "../config.js";

export default function CallFeedBack() {
  const [callStatus, setCallStatus] = useState([
    { id: 1, value: "پاسخ داد", variant: "outline-secondary", key: "answered" },
    { id: 2, value: "در انتظار", variant: "outline-secondary", key: "pending" },
    {
      id: 3,
      value: "پاسخ نداد",
      variant: "outline-secondary",
      key: "no_answer",
    },
    {
      id: 4,
      value: "شماره اشتباه",
      variant: "outline-secondary",
      key: "wrong_number",
    },
  ]);
  const [callResult, setCallResult] = useState([
    {
      id: 1,
      value: "علاقه مند هست",
      variant: "outline-success",
      key: "interested",
    },
    { id: 2, value: "وقت ندارد", variant: "outline-success", key: "no_time" },
    {
      id: 3,
      value: "علاقه مند نیست",
      variant: "outline-success",
      key: "not_interested",
    },
  ]);
  const [questionsData, setQuestionsData] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [explain, setExplain] = useState("");
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [selectResultId, setSelectResultId] = useState(null);
  const [loading, setLoading] = useState(true); // فقط این اضافه شد
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    full_name = "نامشخص",
    phone = "نامشخص",
    contact_id = "نامشخص",
  } = location.state || {};
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/projects/${id}/questions/`,
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
      } finally {
        setLoading(false); // لودینگ تموم شد
      }
    };
    fetchQuestions();
  }, [id, token]);

  const handleAnswerChange = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  function handleShowResult(id) {
    setCallStatus((prev) =>
      prev.map((item) => ({
        ...item,
        variant: item.id === id ? "outline-danger" : "outline-secondary",
      }))
    );
    const status = callStatus.find((status) => status.id === id).key;
    setSelectedStatusId(status);
    if (id === 1) {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  }

  function handleIdColor(id) {
    setCallResult((prev) =>
      prev.map((item) => ({
        ...item,
        variant: item.id === id ? "outline-danger" : "outline-success",
      }))
    );
    const result = callResult.find((item) => item.id === id).key;
    setSelectResultId(result);
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  async function handlePostInfo() {
    const answers = Object.entries(selectedAnswers).map(
      ([questionId, answerId]) => ({
        question: parseInt(questionId),
        selected_choice: parseInt(answerId),
      })
    );
    try {
      const project = {
        contact_id: contact_id,
        project_id: id,
        call_result: selectResultId || "",
        status: selectedStatusId,
        answers: answers,
        notes: explain,
      };
      const response = await fetch(
        `${API_BASE_URL}/api/calls/submit_call/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(project),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      navigate(`/project/${id}/call-request`);
    } catch (error) {
      console.error("Error submitting call feedback:", error);
    }
  }

  return (
    <>
      <NavigationBar />
      <Container dir="rtl">
        {loading ? (
          <div className="text-center py-5 my-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted fs-5">
              در حال بارگذاری فرم بازخورد...
            </p>
          </div>
        ) : (
          <Card className="mt-5 mb-3">
            <Card.Body>
              <Card className="mt-3 p-2">
                <Card.Text className="text-center" style={{ fontSize: "20px" }}>
                  <FaUser
                    className="mx-1 text-primary"
                    style={{ fontSize: "13px" }}
                  />
                  خلاصه اطلاعات مخاطب
                </Card.Text>
                <Card.Body>
                  <Row className="text-center">
                    <Col lg="6">
                      <div>
                        <p className="text-secondary">نام و نام خانوادگی:</p>
                        <p className="text-primary">{full_name}</p>
                      </div>
                    </Col>
                    <Col lg="6">
                      <div>
                        <p className="text-secondary">تلفن:</p>
                        <p className="text-primary">{phone}</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mt-5 p-2">
                <Card.Text className="text-center" style={{ fontSize: "20px" }}>
                  <FaPhone
                    className="mx-1 text-primary"
                    style={{ fontSize: "13px" }}
                  />
                  فرم بازخورد تماس
                </Card.Text>
                <Card.Body>
                  <p className="text-secondary" style={{ fontSize: "17px" }}>
                    وضعیت تماس
                  </p>
                  <Row className="text-center">
                    {callStatus.map((item) => (
                      <Col lg="3" key={item.id}>
                        <Button
                          variant={item.variant}
                          className="mt-4"
                          onClick={() => handleShowResult(item.id)}
                        >
                          {item.value}
                        </Button>
                      </Col>
                    ))}
                  </Row>

                  {showResult ? (
                    <div className="mt-4">
                      <p
                        className="text-secondary"
                        style={{ fontSize: "17px" }}
                      >
                        نتیجه تماس
                      </p>
                      <Row className="text-center">
                        {callResult.map((result) => (
                          <Col lg="4" key={result.id}>
                            <Button
                              variant={result.variant}
                              className="mt-2"
                              onClick={() => handleIdColor(result.id)}
                            >
                              {result.value}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ) : (
                    ""
                  )}

                  {questionsData.length > 0 && (
                    <div className="mt-4">
                      <p
                        className="text-secondary"
                        style={{ fontSize: "17px" }}
                      >
                        سوالات پروژه
                      </p>
                      {questionsData.map((qData, qIndex) => (
                        <div
                          key={qData.id || qIndex}
                          className="mb-3 p-3 border rounded"
                        >
                          <h6 className="text-primary mb-2">
                            سوال {qIndex + 1}: {qData.text}
                          </h6>
                          <div className="ms-4">
                            {qData.answers && qData.answers.length > 0 ? (
                              qData.answers.map((answer, aIndex) => (
                                <div key={answer.id || aIndex} className="mb-1">
                                  <Form.Check
                                    inline
                                    type="radio"
                                    name={`question-${qData.id}`}
                                    id={`answer-${answer.id}`}
                                    checked={
                                      selectedAnswers[qData.id] === answer.id
                                    }
                                    onChange={() =>
                                      handleAnswerChange(qData.id, answer.id)
                                    }
                                  />
                                  <span className="mx-1">{answer.text}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted">
                                هیچ پاسخی تعریف نشده است.
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Form onSubmit={handleSubmit} className="mt-4">
                    <Form.Group>
                      <Form.Label>یادداشت‌ها و توضیحات</Form.Label>
                      <Form.Control
                        type="text"
                        as="textarea"
                        rows={4}
                        value={explain}
                        onChange={(event) => setExplain(event.target.value)} // فقط این خط اصلاح شد
                        placeholder="توضیحات و یادداشت‌های اضافی خود را درج کنید..."
                      />
                    </Form.Group>
                  </Form>

                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/project/${id}/call-request`)}
                    >
                      انصراف
                    </Button>
                    <Button
                      variant="primary"
                      className="mx-3"
                      onClick={handlePostInfo}
                    >
                      ثبت بازخورد
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
}
