import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Stethoscope, AlertTriangle, Loader2 } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const ChatbotWidget = ({ doctors, onSelectDoctor }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! Tell me what's going on and I'll ask a few questions before suggesting the right doctor — or simple self-care advice if that's all you need.",
    },
  ]);
  const [apiHistory, setApiHistory] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, sending]);

  const sendToBot = async (text) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setSending(true);

    try {
      const res = await axiosInstance.post(
        "/chatbot/message",
        { message: text, history: apiHistory },
        { headers }
      );
      const reply = res.data;

      setApiHistory((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: reply.message },
      ]);

      if (reply.type === "doctor") {
        const matches = doctors.filter((d) => d.specialization === reply.specialization);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text:
              matches.length > 0
                ? reply.message
                : `${reply.message} We don't have a ${reply.specialization} registered right now — here are available doctors instead.`,
            doctors: matches.length > 0 ? matches : doctors.slice(0, 2),
          },
        ]);
      } else if (reply.type === "emergency") {
        setMessages((prev) => [...prev, { sender: "bot", text: reply.message, emergency: true }]);
      } else if (reply.type === "self-care") {
        setMessages((prev) => [...prev, { sender: "bot", text: reply.message, selfCare: true }]);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: reply.message }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn't reach the assistant right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    sendToBot(text);
  };

  const handleStillSeeDoctor = () => {
    sendToBot("I'd still like to see a doctor for this.");
  };

  const handleBookClick = (doctorId) => {
    onSelectDoctor(doctorId);
    setOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-primary rounded-circle shadow"
        style={{ position: "fixed", bottom: "24px", right: "24px", width: "56px", height: "56px", zIndex: 1050 }}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div
          className="card shadow-lg border-0"
          style={{
            position: "fixed",
            bottom: "92px",
            right: "24px",
            width: "340px",
            maxHeight: "480px",
            borderRadius: "16px",
            zIndex: 1050,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="bg-primary text-white p-3 d-flex align-items-center gap-2"
            style={{ borderRadius: "16px 16px 0 0" }}
          >
            <Stethoscope size={20} />
            <div>
              <h6 className="mb-0">Health Assistant</h6>
              <small className="opacity-75">Describe your symptoms</small>
            </div>
          </div>

          <div className="p-3" style={{ flex: 1, overflowY: "auto", maxHeight: "300px" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-2 d-flex ${m.sender === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                <div
                  className={`p-2 rounded-3 ${
                    m.sender === "user"
                      ? "bg-primary text-white"
                      : m.emergency
                      ? "bg-danger-subtle border border-danger"
                      : "bg-light"
                  }`}
                  style={{ maxWidth: "85%", fontSize: "14px" }}
                >
                  {m.emergency && (
                    <div className="d-flex align-items-center gap-1 fw-semibold text-danger mb-1">
                      <AlertTriangle size={14} /> Emergency
                    </div>
                  )}
                  <div>{m.text}</div>

                  {m.selfCare && (
                    <button
                      className="btn btn-outline-primary btn-sm rounded-pill mt-2"
                      style={{ fontSize: "12px" }}
                      onClick={handleStillSeeDoctor}
                      disabled={sending}
                    >
                      Still want to see a doctor?
                    </button>
                  )}

                  {m.doctors && (
                    <div className="mt-2 d-flex flex-column gap-2">
                      {m.doctors.map((doc) => (
                        <div
                          key={doc._id}
                          className="bg-white border rounded-3 p-2 d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div className="fw-semibold" style={{ fontSize: "13px" }}>
                              {doc.name}
                            </div>
                            <div className="text-muted" style={{ fontSize: "12px" }}>
                              {doc.specialization || "General Physician"}
                              {doc.fees ? ` · ₹${doc.fees}` : ""}
                            </div>
                          </div>
                          <button
                            className="btn btn-primary btn-sm rounded-pill"
                            style={{ fontSize: "12px" }}
                            onClick={() => handleBookClick(doc._id)}
                          >
                            Book
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="d-flex justify-content-start mb-2">
                <div className="p-2 rounded-3 bg-light d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
                  <Loader2 size={14} className="spin" /> Typing...
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="p-2 border-top d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Describe your symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={sending}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={sending}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;