import React, { useState } from "react";
import NavigationBar from "./NavigationBar";
import { Button, Card, Container, Form, Modal } from "react-bootstrap";
import { IoIosCodeWorking } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {API_BASE_URL} from "../config.js";

export default function ProjectCreate() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [create, setCreate] = useState();
  const [show, setShow] = useState(false);
  const [styleBtn, setStyleBtn] = useState("");
  const [questionModal, setQuestionModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [questionsData, setQuestionsData] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  
  function handleSubmitProject(event) {
    event.preventDefault();
  }

  async function handleClickProject() {
    if (!token) {
      alert("توکن احراز هویت یافت نشد. لطفاً ابتدا وارد شوید.");
      setStyleBtn("");
      return;
    }

    setStyleBtn("disabled");

    if (name === "" || description === "") {
      setCreate(false);
      setShow(true);
      setTimeout(() => {
        setCreate(null);
        setShow(false);
      }, 3000);
      setStyleBtn("");
      return;
    }

    try {
      // لاگ داده‌های پروژه قبل از ارسال
      const project = {
        name,
        description,
        created_by_id: user.id,
      };
      console.log("Sending project data:", project);

      // ایجاد پروژه
      const projectResponse = await fetch(`${API_BASE_URL}/api/projects/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(project),
      });

      if (!projectResponse.ok) {
        const errorData = await projectResponse.json();
        console.error("Project creation error:", errorData);
        throw new Error(`Failed to create project: ${JSON.stringify(errorData)}`);
      }

      const projectData = await projectResponse.json();
      const projectId = projectData.id;
      console.log("Project response:", projectData);
      console.log("Project ID:", projectId);

      if (!projectId) {
        throw new Error("Project ID is undefined in response");
      }

      console.log("Questions data to send:", questionsData);

      for (const qData of questionsData) {
        if (!qData.question || qData.answers.some((ans) => !ans)) {
          throw new Error("سوال یا پاسخ‌ها نمی‌توانند خالی باشند.");
        }

        // لاگ داده‌های سوال
        console.log("Sending question data:", {
          project_id: projectId,
          text: qData.question,
        });

        // ذخیره سوال
        const questionResponse = await fetch(`${API_BASE_URL}/api/projects/${projectId}/questions/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            project_id: projectId,
            text: qData.question, // استفاده از text به جای question
          }),
        });

        if (!questionResponse.ok) {
          const errorData = await questionResponse.json();
          console.error("Question creation error:", errorData);
          throw new Error(`Failed to create question: ${JSON.stringify(errorData)}`);
        }

        const questionData = await questionResponse.json();
        const questionId = questionData.id;
        console.log("Question response:", questionData);
        console.log("Question ID:", questionId);

        if (!questionId) {
          throw new Error("Question ID is undefined in response");
        }

        // لاگ پاسخ‌ها قبل از ارسال
        console.log("Answers for question ID", questionId, ":", qData.answers);

        // ذخیره پاسخ‌ها
        for (const answer of qData.answers) {
          console.log("Sending choice data:", {
            question_id: questionId,
            text: answer,
          });

          const choiceResponse = await fetch(`${API_BASE_URL}/api/projects/${projectId}/questions/${questionId}/choices/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({
              question_id: questionId,
              text: answer, // استفاده از text به جای answer
            }),
          });

          if (!choiceResponse.ok) {
            const errorData = await choiceResponse.json();
            console.error("Choice creation error:", errorData);
            throw new Error(`Failed to create choice: ${JSON.stringify(errorData)}`);
          }

          console.log("Choice response:", await choiceResponse.json());
        }
      }

      setCreate(true);
      setShow(true);
      setTimeout(() => {
        setCreate(null);
        setShow(false);
        navigate("/project");
      }, 3000);
      setName("");
      setDescription("");
      setQuestionsData([]);
    } catch (error) {
      console.error("Error:", error.message);
      alert(`خطا در ذخیره پروژه یا سوالات/پاسخ‌ها: ${error.message}`);
    }
    setStyleBtn("");
  }

  function handleAddAnswerBox() {
    setAnswers([...answers, ""]);
  }

  function handleAnswerChange(index, value) {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  }

  function handleSaveAndNewQuestion() {
    if (question === "" || answers.length === 0 || answers.some((ans) => ans === "")) {
      alert("لطفاً سوال و حداقل یک پاسخ را پر کنید.");
      return;
    }

    setQuestionsData([...questionsData, { question, answers }]);
    setQuestion("");
    setAnswers([]);
    alert("سوال و پاسخ‌ها ذخیره شدند. می‌توانید سوال جدید بنویسید.");
  }

  function handleSaveQuestionAndAnswers() {
    if (question === "" || answers.length === 0 || answers.some((ans) => ans === "")) {
      alert("لطفاً سوال و حداقل یک پاسخ را پر کنید.");
      return;
    }

    setQuestionsData([...questionsData, { question, answers }]);
    setQuestion("");
    setAnswers([]);
    setQuestionModal(false);
    alert("سوال و پاسخ‌ها با موفقیت ذخیره شدند.");
  }

  return (
    <>
      <NavigationBar />
      <Container dir="rtl">
        <Card className="mt-5 p-3">
          <Card.Title>
            <IoIosCodeWorking className="text-success" style={{ fontSize: "30px" }} />
            ایجاد پروژه جدید
          </Card.Title>
          <Card.Body>
            <Form onSubmit={handleSubmitProject}>
              <Form.Group>
                <Form.Label>نام پروژه:</Form.Label>
                <Form.Control type="text" value={name} onChange={(event) => setName(event.target.value)} />
              </Form.Group>
              {create === false && (name === "" || description === "") ? (
                <Modal show={show} backdrop="static" style={{ direction: "rtl" }}>
                  <Modal.Body>
                    <div>
                      <h4 className="text-danger">اخطار!!!</h4>
                      <h5 className="mt-3">لطفاً نام پروژه یا توضیحات خود را تکمیل نمایید</h5>
                    </div>
                  </Modal.Body>
                </Modal>
              ) : null}
              {create === true ? (
                <Modal show={show} backdrop="static" style={{ direction: "rtl" }}>
                  <Modal.Body>
                    <div>
                      <h5 className="mt-3">
                        <FaCheckCircle className="text-success" /> توضیحات شما به طور کامل فرستاده شد
                      </h5>
                    </div>
                  </Modal.Body>
                </Modal>
              ) : null}
              <Form.Group className="mt-4">
                <Form.Label>توضیحات:</Form.Label>
                <Form.Control
                  type="text"
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Form.Group>
              <div className="mt-4">
                <Button variant="outline-secondary" className="rounded-4" onClick={() => setQuestionModal(true)}>
                  ایجاد سوال
                </Button>
              </div>
              <div className="mt-4 text-center">
                <Button variant="success" className={styleBtn} onClick={handleClickProject}>
                  ایجاد پروژه
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
        {questionsData.length > 0 && (
          <Card className="mt-4 p-3">
            <Card.Title>سوالات و پاسخ‌ها</Card.Title>
            <Card.Body>
              {questionsData.map((qData, index) => (
                <div key={index} className="mb-3">
                  <h6>سوال {index + 1}: {qData.question}</h6>
                  <ul>
                    {qData.answers.map((answer, ansIndex) => (
                      <li key={ansIndex}>پاسخ {ansIndex + 1}: {answer}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Card.Body>
          </Card>
        )}
      </Container>

      <Modal show={questionModal} backdrop="static" style={{ direction: "rtl" }} className="p-3" centered size="lg">
        <Modal.Body>
          <Form.Group>
            <Form.Label>متن سوال:</Form.Label>
            <Form.Control
              type="text"
              as="textarea"
              rows={3}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </Form.Group>
          <div className="mt-3">
            <Button variant="success" onClick={handleAddAnswerBox}>
              برای ایجاد پاسخ کلیک کنید
            </Button>
          </div>
          {answers.map((answer, index) => (
            <Form.Group key={index} className="mt-3">
              <Form.Label>{`پاسخ ${index + 1}:`}</Form.Label>
              <Form.Control
                type="text"
                value={answer}
                onChange={(event) => handleAnswerChange(index, event.target.value)}
              />
            </Form.Group>
          ))}
          {answers.length > 0 && (
            <div className="mt-3">
              <Button variant="primary" onClick={handleSaveAndNewQuestion} className="me-2">
                ذخیره و سوال جدید
              </Button>
              <Button variant="primary" className="mx-3" onClick={handleSaveQuestionAndAnswers}>
                ذخیره سوال و پاسخ‌ها
              </Button>
            </div>
          )}
          <div className="mt-3">
            <Button
              variant="secondary"
              onClick={() => {
                setQuestionModal(false);
                setQuestion("");
                setAnswers([]);
              }}
            >
              بستن
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}