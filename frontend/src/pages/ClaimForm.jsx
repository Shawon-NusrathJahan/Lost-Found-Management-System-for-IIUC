import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Tag } from "lucide-react";
import Navbar from "../components/Navbar";
import StepperHeader from "../components/StepperHeader";
import "./ReportLostItem.css";
import "./ClaimForm.css";

const STEPS = [
  { title: "Your Information", subtitle: "Answer a few questions" },
  { title: "Upload Proof", subtitle: "Add supporting documents" },
  { title: "Review & Submit", subtitle: "Confirm your claim" },
];

function ClaimForm() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [proofFiles, setProofFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    incidentLocation: "",
    incidentDate: "",
    incidentTime: "",
    howLost: "",
    whyYours: "",
    hiddenMarks: "",
    insideItem: "",
    declaration: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    setError("");
  };

  const goNext = () => {
    // Step 1 validation
    if (currentStep === 1) {
        if (
        !formData.incidentLocation.trim() ||
        !formData.incidentDate ||
        !formData.howLost.trim() ||
        !formData.whyYours.trim() ||
        !formData.hiddenMarks.trim() ||
        !formData.insideItem.trim()
        ) {
        setError("Please complete all fields before continuing.");
        return;
        }
    }

    // Step 2 validation
    if (currentStep === 2) {
        if (proofFiles.length === 0) {
        setError("Please upload at least one proof file.");
        return;
        }
    }

    setError("");
    setCurrentStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  return (
    <div className="cf-claim-page">
      <Navbar isLoggedIn={true} />

      {/* Header */}
      <div className="cf-claim-header">
        <div>
          <button
            className="cf-back-link"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back to item details
          </button>

          <h1>Submit Claim Request</h1>

          <p>
            Help us verify that you are the rightful owner of this item by
            providing accurate information and proof.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <StepperHeader steps={STEPS} currentStep={currentStep} />

      {/* Main Layout */}
      <div className="cf-claim-body">

        {/* Left Column */}
        <div className="cf-claim-form">

          {error && <p className="cf-form-error">{error}</p>}

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="cf-form-section">
              <h3>1. Tell Us About Your Connection to the Item</h3>

              <div className="cf-form-row">
                <div className="cf-form-group">
                  <label>Where did you last have or encounter this item?</label>
                  <input
                    type="text"
                    name="incidentLocation"
                    placeholder="e.g., Library Building"
                    value={formData.incidentLocation}
                    onChange={handleChange}
                  />
                </div>

                <div className="cf-form-group">
                  <label>When did you lose/find it?</label>
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="cf-form-group">
                <label>Time</label>
                <input
                    type="time"
                    name="incidentTime"
                    value={formData.incidentTime}
                    onChange={handleChange}
                />
                </div>
              </div>

              <div className="cf-form-group">
                <label>How did you lose/find it?</label>
                <textarea
                  name="howLost"
                  placeholder="Describe the situation in detail."
                  value={formData.howLost}
                  onChange={handleChange}
                />
              </div>

              <div className="cf-form-group">
                <label>What makes you believe this item is yours? / How do you know it's yours?</label>
                <textarea
                  name="whyYours"
                  placeholder="Mention details only the real owner would know."
                  value={formData.whyYours}
                  onChange={handleChange}
                />
              </div>

              <div className="cf-form-group">
                <label>Any hidden identifiers or unique marks? / Describe any distinctive features</label>
                <textarea
                  name="hiddenMarks"
                  placeholder="e.g., sticker, scratch, engraving"
                  value={formData.hiddenMarks}
                  onChange={handleChange}
                />
              </div>

              <div className="cf-form-group">
                <label>Additional Details (unique to this item, if possible)</label>
                <textarea
                  name="insideItem"
                  placeholder="e.g., ID card, keys, cash"
                  value={formData.insideItem}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="cf-form-section">
              <h3>2. Upload Supporting Proof</h3>

              <div className="cf-upload-box">
                <p>Upload documents or photos that help verify ownership.</p>

                <button className="cf-btn-outline">
                  Browse Files
                </button>

                <p className="cf-upload-note">
                  JPG, PNG, PDF • Max 5MB each
                </p>
              </div>

              <div className="cf-uploaded-list">
                <p>No files uploaded yet.</p>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="cf-form-section">
              <h3>3. Review & Submit</h3>

              <div className="cf-review-box">
                <p>Review all the information before submitting.</p>

                <div className="cf-review-item">
                  <strong>Location:</strong> {formData.incidentLocation || "Not provided"}
                </div>

                <div className="cf-review-item">
                  <strong>Date:</strong> {formData.incidentDate || "Not provided"}
                </div>

<div className="cf-review-item">
    <strong>Time:</strong> {formData.incidentTime || "Not provided"}
  </div>

  <div className="cf-review-item">
    <strong>Connection / How you lost or found it:</strong>
    <p>{formData.howLost || "Not provided"}</p>
  </div>

  <div className="cf-review-item">
    <strong>Why you believe it is yours:</strong>
    <p>{formData.whyYours || "Not provided"}</p>
  </div>

  <div className="cf-review-item">
    <strong>Hidden marks / distinctive features:</strong>
    <p>{formData.hiddenMarks || "Not provided"}</p>
  </div>

  <div className="cf-review-item">
    <strong>Inside item / additional details:</strong>
    <p>{formData.insideItem || "Not provided"}</p>
  </div>

                <div className="cf-review-item">
                  <strong>Uploaded proofs:</strong> {proofFiles.length}
                </div>
              </div>

              <div className="cf-form-group">
                <label className="cf-checkbox">
                  <input
                    type="checkbox"
                    name="declaration"
                    checked={formData.declaration}
                    onChange={handleChange}
                  />
                  I confirm that the information provided is true and accurate.
                </label>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="cf-form-actions">
            <button
              className="cf-btn-outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <div className="cf-actions-right">
              {currentStep > 1 && (
                <button
                  className="cf-btn-outline"
                  onClick={goBack}
                >
                  Previous
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  className="cf-btn-solid"
                  onClick={goNext}
                >
                  Next
                </button>
              ) : (
                <button
                  className="cf-btn-solid"
                  disabled={loading}
                >
                  Submit Claim
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="cf-claim-sidebar">

          <div className="cf-sidebar-card">
            <h4>Item You Are Claiming</h4>

            <div className="cf-item-image">
              <div className="cf-image-placeholder">Item Image</div>
            </div>

            <h5>Brown Leather Wallet</h5>

            <div className="cf-preview-row">
              <Tag size={16} />
              <div>
                <span className="cf-preview-label">Category</span>
                <p>Personal Accessories</p>
              </div>
            </div>

            <div className="cf-preview-row">
              <Calendar size={16} />
              <div>
                <span className="cf-preview-label">Lost on</span>
                <p>June 12, 2024</p>
              </div>
            </div>

            <div className="cf-preview-row">
              <MapPin size={16} />
              <div>
                <span className="cf-preview-label">Lost at</span>
                <p>Library Building</p>
              </div>
            </div>
          </div>

          <div className="cf-sidebar-card">
            <h4>Claim Process</h4>

            <ol className="cf-process-list">
              <li>You submit a claim</li>
              <li>Reporter reviews</li>
              <li>Admin review (if needed)</li>
              <li>Decision is made</li>
              <li>If approved, you can contact the reporter</li>
            </ol>
          </div>

          <div className="cf-sidebar-card">
            <h4>Need Help?</h4>

            <p>
              If you have any questions, please contact the admin team.
            </p>

            <button className="cf-btn-outline cf-full-width">
              Contact Admin
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ClaimForm;