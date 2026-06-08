import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Onboarding.css";

const steps = [
  {
    title: "Welcome to MusicApp",
    description: "The ultimate destination for music lovers. Experience sound like never before.",
  },
  {
    title: "Curated for You",
    description: "Our advanced engine learns your unique taste to curate playlists that resonate with your mood.",
  },
  {
    title: "Listen Anywhere",
    description: "Download your favorite tracks and enjoy uninterrupted music, even without an internet connection.",
  },
];

function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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

          <div className="onboarding-actions">
            {currentStep > 0 && (
              <button className="onboarding-button secondary" onClick={handleBack}>
                Back
              </button>
            )}
            <button className="onboarding-button primary" onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
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

