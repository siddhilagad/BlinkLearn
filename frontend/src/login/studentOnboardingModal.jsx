import React, { useState } from "react";
import "./studentOnboardingModal.css";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    id: 1,
    title: "What is your learning goal?",
    subtitle:
      "Tell us what you're hoping to achieve so we can personalize your experience.",
    type: "single",
    options: [
      { icon: "💼", label: "Get a job or switch careers" },
      { icon: "📈", label: "Grow in my current role" },
      { icon: "🎓", label: "Learn for a degree or certification" },
      { icon: "🌱", label: "Explore personal interests" },
      { icon: "🏢", label: "Upskill my team or company" },
    ],
  },
  {
    id: 2,
    title: "Which topics interest you the most?",
    subtitle: "Choose all that apply — we'll recommend courses based on your picks.",
    type: "multi",
    options: [
      { icon: "💻", label: "Web Development" },
      { icon: "📱", label: "Mobile App Development" },
      { icon: "🤖", label: "Artificial Intelligence & ML" },
      { icon: "🎨", label: "UI/UX Design" },
      { icon: "📊", label: "Data Science & Analytics" },
      { icon: "☁️", label: "Cloud Computing" },
      { icon: "🔐", label: "Cybersecurity" },
      { icon: "📸", label: "Photography & Video" },
      { icon: "📣", label: "Digital Marketing" },
      { icon: "💰", label: "Finance & Accounting" },
    ],
  },
  {
    id: 3,
    title: "What is your current skill level?",
    subtitle: "This helps us suggest the right difficulty of courses for you.",
    type: "single",
    options: [
      { icon: "🌱", label: "Beginner — completely new to this" },
      { icon: "📘", label: "Elementary — know the basics" },
      { icon: "⚙️", label: "Intermediate — some hands-on experience" },
      { icon: "🚀", label: "Advanced — ready for expert-level content" },
    ],
  },
  {
    id: 4,
    title: "How much time can you dedicate to learning?",
    subtitle: "We'll suggest courses that fit your schedule.",
    type: "single",
    options: [
      { icon: "⏱️", label: "Less than 1 hour per week" },
      { icon: "🕐", label: "1 – 3 hours per week" },
      { icon: "🕓", label: "3 – 5 hours per week" },
      { icon: "🔥", label: "5+ hours per week" },
    ],
  },
  {
    id: 5,
    title: "What type of learning do you prefer?",
    subtitle: "We'll tailor the course format to your style.",
    type: "single",
    options: [
      { icon: "🎥", label: "Video lectures" },
      { icon: "📝", label: "Reading & articles" },
      { icon: "🛠️", label: "Hands-on projects" },
      { icon: "🎮", label: "Interactive quizzes & challenges" },
      { icon: "🤝", label: "Live classes & mentorship" },
    ],
  },
];

function StudentOnboarding({ onClose }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(
    steps.map((s) => (s.type === "multi" ? [] : null))
  );

  const step = steps[current];
  const answer = answers[current];
  const totalSteps = steps.length;

  const handleSingle = (label) => {
    const updated = [...answers];
    updated[current] = label;
    setAnswers(updated);
  };

  const handleMulti = (label) => {
    const updated = [...answers];
    const arr = updated[current];
    if (arr.includes(label)) {
      updated[current] = arr.filter((l) => l !== label);
    } else {
      updated[current] = [...arr, label];
    }
    setAnswers(updated);
  };

  const canProceed =
    step.type === "single" ? answer !== null : answer.length > 0;

  const handleNext = () => {
    if (current + 1 < totalSteps) {
      setCurrent((prev) => prev + 1);
    } else {
      // Save answers & mark onboarding done
      localStorage.setItem("blinklearn_onboarding_done", "true");
      localStorage.setItem("blinklearn_onboarding_answers", JSON.stringify(answers));
      if (onClose) onClose();
      navigate("/student-dashboard");
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent((prev) => prev - 1);
  };

  const handleSkip = () => {
    localStorage.setItem("blinklearn_onboarding_done", "true");
    if (onClose) onClose();
    navigate("/student-dashboard");
  };

  const progressPercent = ((current + 1) / totalSteps) * 100;

  return (
    <div className="onboard-overlay">
      <div className="onboard-modal">
        {/* ===== Top Bar ===== */}
        <div className="onboard-topbar">
          <div className="onboard-logo">✨ BlinkLearn</div>
          <div className="onboard-step-label">
            Step {current + 1} of {totalSteps}
          </div>
          <button className="onboard-skip" onClick={handleSkip}>
            Skip
          </button>
        </div>

        {/* ===== Progress Bar ===== */}
        <div className="onboard-progress-track">
          <div
            className="onboard-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* ===== Content ===== */}
        <div className="onboard-content">
          <div className="onboard-left">
            <h2 className="onboard-title">{step.title}</h2>
            <p className="onboard-subtitle">{step.subtitle}</p>

            {/* Options */}
            <div className={`onboard-options ${step.type === "multi" ? "grid" : ""}`}>
              {step.options.map((opt) => {
                const isSelected =
                  step.type === "single"
                    ? answer === opt.label
                    : answer.includes(opt.label);

                return (
                  <button
                    key={opt.label}
                    className={`onboard-option ${isSelected ? "selected" : ""}`}
                    onClick={() =>
                      step.type === "single"
                        ? handleSingle(opt.label)
                        : handleMulti(opt.label)
                    }
                  >
                    <span className="opt-icon">{opt.icon}</span>
                    <span className="opt-label">{opt.label}</span>
                    {step.type === "multi" && isSelected && (
                      <span className="opt-check">✓</span>
                    )}
                    {step.type === "single" && (
                      <span className={`opt-radio ${isSelected ? "radio-on" : ""}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===== Right Illustration ===== */}
          <div className="onboard-right">
            <div className="onboard-illustration">
              {["🎯", "📚", "⭐", "🚀", "🎨"][current]}
            </div>
            <p className="onboard-tip">
              {[
                "Set clear goals to stay motivated on your journey!",
                "Pick topics you're genuinely curious about.",
                "Knowing your level helps us find the perfect course.",
                "Consistency beats intensity — even 1 hour helps!",
                "The best format is the one you actually enjoy.",
              ][current]}
            </p>
          </div>
        </div>

        {/* ===== Footer Buttons ===== */}
        <div className="onboard-footer">
          <button
            className="onboard-back-btn"
            onClick={handleBack}
            disabled={current === 0}
          >
            ← Back
          </button>
          <button
            className="onboard-continue-btn"
            onClick={handleNext}
            disabled={!canProceed}
          >
            {current + 1 === totalSteps ? "Finish & Explore 🚀" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentOnboarding;