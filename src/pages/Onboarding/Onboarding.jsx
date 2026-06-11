import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Onboarding.css";

const steps = [
  {
    title: "Explore Music",
    description: "Browse and search your favorite artists and tracks effortlessly.",
    image: "/icons/explore.svg",
  },
  {
    title: "Create Playlists",
    description: "Build your own collection by creating custom playlists.",
    image: "/icons/playlist.svg",
  },
  {
    title: "Create Account",
    description: "Join us to save your favorites and access your library anywhere.",
    type: "form",
  },
];

function Onboarding() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [youtubeApiKey, setYoutubeApiKey] = useState("");
  const [mongoDbUri, setMongoDbUri] = useState("");
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
          {steps[currentStep].type !== "form" && (
            <div className="onboarding-image-wrapper">
              <div className="onboarding-image-placeholder" />
            </div>
          )}
          
          <h1>{steps[currentStep].title}</h1>
          <p>{steps[currentStep].description}</p>

          {steps[currentStep].type === "form" && (
            <div className="onboarding-form">
              <input 
                type="email" 
                placeholder="Email" 
                className="onboarding-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="onboarding-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="YouTube API Key" 
                className="onboarding-input" 
                value={youtubeApiKey}
                onChange={(e) => setYoutubeApiKey(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="MongoDB URI" 
                className="onboarding-input" 
                value={mongoDbUri}
                onChange={(e) => setMongoDbUri(e.target.value)}
              />
            </div>
          )}

          <div className="onboarding-actions">
            {currentStep > 0 && (
              <button className="onboarding-button secondary" onClick={handleBack}>
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

