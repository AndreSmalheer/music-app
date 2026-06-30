import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Onboarding.css";

const steps = [
  {
    title: "Stream vanaf YouTube",
    description:
      "Speel miljoenen nummers direct af vanaf YouTube zonder ze eerst te downloaden.",
  },
  {
    title: "Download naar je apparaat",
    description:
      "Sla nummers lokaal op voor je eigen collectie. Downloads worden op je apparaat opgeslagen en zijn niet bedoeld voor offline streaming.",
  },
  {
    title: "Maak je account aan",
    description:
      "Log in om je bibliotheek, favorieten en instellingen op al je apparaten te synchroniseren.",
    type: "form",
  },
];

function Onboarding() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleNext = () => {
    setError("");

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    navigate("/");
  };

  const handleBack = () => {
    setError("");

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const checkEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
  };

  return (
    <motion.div
      className="onboarding-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="onboarding-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h1>{steps[currentStep].title}</h1>
          <p>{steps[currentStep].description}</p>

          {steps[currentStep].type === "form" && (
            <div className="onboarding-form">
              <input
                type="text"
                placeholder="Email"
                className="onboarding-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={checkEmail}
              />

              <input
                type="password"
                placeholder="Password"
                className="onboarding-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="onboarding-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {confirmPassword && password !== confirmPassword && (
                <p
                  style={{
                    color: "#ff4d4f",
                    fontSize: "14px",
                    marginTop: "8px",
                  }}
                >
                  Passwords do not match.
                </p>
              )}

              {error && (
                <p
                  style={{
                    color: "#ff4d4f",
                    fontSize: "14px",
                    marginTop: "8px",
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          )}

          <div className="onboarding-actions">
            {currentStep > 0 && (
              <button
                className="onboarding-button secondary"
                onClick={handleBack}
              >
                Back
              </button>
            )}

            <button className="onboarding-button primary" onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Create Account" : "Next"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="onboarding-indicators">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentStep ? "active" : ""}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default Onboarding;
