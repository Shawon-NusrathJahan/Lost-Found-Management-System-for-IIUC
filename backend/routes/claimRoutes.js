const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  submitClaim,
  approveClaim,
  rejectClaim,
  adminDecision,
  getClaimsForItem,
  getClaimDetails,
} = require("../controllers/claimController");

// Submit claim
router.post(
  "/submit",
  protect,
  upload.array("proofFiles", 4),
  submitClaim
);

// Reporter approves a claim
router.patch(
  "/:id/approve",
  protect,
  approveClaim
);

// Reporter rejects a claim
router.patch(
  "/:id/reject",
  protect,
  rejectClaim
);

// Admin approves or rejects a claim
router.patch(
  "/:id/admin-decision",
  protect,
  adminDecision
);

// Get all claims for a specific item
router.get(
  "/item/:itemType/:itemId",
  protect,
  getClaimsForItem
);

// Get details of a specific claim
router.get(
  "/:id",
  protect,
  getClaimDetails
);

module.exports = router;