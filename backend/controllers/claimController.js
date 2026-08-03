const Claim = require("../models/Claim");
const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const Category = require("../models/Category");

// =====================================
// Submit Claim
// =====================================
const submitClaim = async (req, res) => {
  try {
    const {
      itemType,
      itemId,
      lostLocation,
      lostDate,
      lostTime,
      howLost,
      whyYours,
      hiddenMarks,
      insideItem,
    } = req.body;

    // ==========================
    // Validate required fields
    // ==========================
    if (
      !itemType ||
      !itemId ||
      !lostLocation ||
      !lostDate ||
      !howLost ||
      !whyYours ||
      !hiddenMarks ||
      !insideItem
    ) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    // ==========================
    // Find the target item
    // ==========================
    let item = null;

    if (itemType === "lost") {
      item = await LostItem.findByPk(itemId);
    } else if (itemType === "found") {
      item = await FoundItem.findByPk(itemId);
    } else {
      return res.status(400).json({
        message: "Invalid item type.",
      });
    }

    if (!item) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    // ==========================
    // Reporter cannot claim own item
    // ==========================
    if (item.userId === req.user.id) {
      return res.status(403).json({
        message: "You cannot claim your own reported item.",
      });
    }

    // ==========================
    // Prevent duplicate claim
    // ==========================
    const existingClaim = await Claim.findOne({
      where: {
        itemType,
        itemId,
        claimerId: req.user.id,
      },
    });

    if (existingClaim) {
      return res.status(409).json({
        message: "You have already submitted a claim for this item.",
      });
    }

    // ==========================
    // Get category
    // ==========================
    const category = await Category.findByPk(item.categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    // ==========================
    // Upload proof files
    // ==========================
    const proofFiles = req.files
      ? req.files.map((file) => file.filename)
      : [];

    // ==========================
    // Create claim
    // ==========================
    const claim = await Claim.create({
      reporterId: item.userId,

      itemType,
      itemId,

      claimerId: req.user.id,

      lostLocation,
      lostDate,
      lostTime,

      howLost,
      whyYours,
      hiddenMarks,
      insideItem,

      proofFiles: JSON.stringify(proofFiles),

      reporterDecision: "pending",

      adminDecision: category.isSensitive
        ? "pending"
        : "not_required",

      status: "pending",
    });

    return res.status(201).json({
      message: "Claim submitted successfully.",
      claim,
    });
  } catch (error) {
    console.error("Submit Claim Error:", error);

    return res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

// =====================================
// Reporter Approves Claim
// =====================================
const approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findByPk(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found.",
      });
    }

    // Only the reporter can approve
    if (claim.reporterId !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to approve this claim.",
      });
    }

    // Prevent approving twice
    if (claim.reporterDecision !== "pending") {
      return res.status(400).json({
        message: "This claim has already been reviewed.",
      });
    }

    // Find related item
    let item;

    if (claim.itemType === "lost") {
      item = await LostItem.findByPk(claim.itemId);
    } else {
      item = await FoundItem.findByPk(claim.itemId);
    }

    if (!item) {
      return res.status(404).json({
        message: "Related item not found.",
      });
    }

    // Get category
    const category = await Category.findByPk(item.categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    // Reporter approved
    claim.reporterDecision = "approved";

    if (category.isSensitive) {
      // Wait for admin approval
      claim.adminDecision = "pending";
      claim.status = "pending";

      await claim.save();

      return res.status(200).json({
        message: "Reporter approved. Waiting for admin approval.",
        claim,
      });
    }

    // Non-sensitive category
    claim.status = "approved";

    item.status = "approved";

    await claim.save();
    await item.save();

    return res.status(200).json({
      message: "Claim approved successfully.",
      claim,
    });

  } catch (error) {
    console.error("Approve Claim Error:", error);

    return res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

// =====================================
// Reporter Rejects Claim
// =====================================
const rejectClaim = async (req, res) => {
  try {
    const claim = await Claim.findByPk(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found.",
      });
    }

    // Only reporter can reject
    if (claim.reporterId !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to reject this claim.",
      });
    }

    // Prevent rejecting twice
    if (claim.reporterDecision !== "pending") {
      return res.status(400).json({
        message: "This claim has already been reviewed.",
      });
    }

    claim.reporterDecision = "rejected";
    claim.status = "rejected";

    await claim.save();

    return res.status(200).json({
      message: "Claim rejected successfully.",
      claim,
    });

  } catch (error) {
    console.error("Reject Claim Error:", error);

    return res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

// =====================================
// Admin Approve / Reject Claim
// =====================================
const adminDecision = async (req, res) => {
  try {
    const claim = await Claim.findByPk(req.params.id);

    if (!["approved", "rejected"].includes(req.body.decision)) {
      return res.status(400).json({
        message: "Decision must be approved or rejected.",
      });
    }

    // Admin only
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can perform this action.",
      });
    }

    const claim = await Claim.findByPk(claimId);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found.",
      });
    }

    // Reporter must approve first
    if (claim.reporterDecision !== "approved") {
      return res.status(400).json({
        message: "Reporter approval is still pending.",
      });
    }

    // Already decided
    if (claim.adminDecision !== "pending") {
      return res.status(400).json({
        message: "This claim has already been reviewed.",
      });
    }

    // Reject
    if (decision === "rejected") {
      claim.adminDecision = "rejected";
      claim.status = "rejected";

      await claim.save();

      return res.json({
        message: "Claim rejected by admin.",
        claim,
      });
    }

    // Approve
    claim.adminDecision = "approved";
    claim.status = "approved";

    await claim.save();

    let item;

    if (claim.itemType === "lost") {
      item = await LostItem.findByPk(claim.itemId);
    } else {
      item = await FoundItem.findByPk(claim.itemId);
    }

    if (item) {
      item.status = "approved";
      await item.save();
    }

    return res.json({
      message: "Claim approved successfully.",
      claim,
    });

  } catch (error) {
    console.error("Admin Decision Error:", error);

    return res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

// =====================================
// Get all claims for an item
// =====================================
const getClaimsForItem = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;

    if (!["lost", "found"].includes(itemType)) {
      return res.status(400).json({
        message: "Invalid item type.",
      });
    }

    let item;

    if (itemType === "lost") {
      item = await LostItem.findByPk(itemId);
    } else {
      item = await FoundItem.findByPk(itemId);
    }

    if (!item) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    // Only reporter or admin
    if (
      req.user.role !== "admin" &&
      item.userId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized.",
      });
    }

    const claims = await Claim.findAll({
      where: {
        itemType,
        itemId,
      },
      include: [
        {
          association: "claimer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const response = claims.map((claim) => ({
      id: claim.id,

      claimer: claim.claimer,

      submittedAt: claim.createdAt,

      howLostPreview:
        claim.howLost.length > 120
          ? claim.howLost.substring(0, 120) + "..."
          : claim.howLost,

      proofFiles: JSON.parse(claim.proofFiles || "[]"),

      status: claim.status,

      reporterDecision:
        req.user.role === "admin"
          ? claim.reporterDecision === "pending"
            ? "Pending"
            : "Reviewed"
          : claim.reporterDecision,

      adminDecision:
        req.user.role === "admin"
          ? claim.adminDecision
          : claim.adminDecision === "pending"
          ? "Pending"
          : claim.adminDecision === "not_required"
          ? "Not Required"
          : "Reviewed",
    }));

    return res.json(response);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

// =====================================
// Get one claim details
// =====================================
const getClaimDetails = async (req, res) => {
  try {

    const claim = await Claim.findByPk(req.params.id, {
      include: [
        {
          association: "claimer",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found.",
      });
    }

    let item;

    if (claim.itemType === "lost") {
      item = await LostItem.findByPk(claim.itemId);
    } else {
      item = await FoundItem.findByPk(claim.itemId);
    }

    if (!item) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    if (
      req.user.role !== "admin" &&
      item.userId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized.",
      });
    }

    return res.json({
      ...claim.toJSON(),

      proofFiles: JSON.parse(claim.proofFiles || "[]"),

      reporterDecision:
        req.user.role === "admin"
          ? claim.reporterDecision === "pending"
            ? "Pending"
            : "Reviewed"
          : claim.reporterDecision,

      adminDecision:
        req.user.role === "admin"
          ? claim.adminDecision
          : claim.adminDecision === "pending"
          ? "Pending"
          : claim.adminDecision === "not_required"
          ? "Not Required"
          : "Reviewed",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

module.exports = {
  submitClaim,
  approveClaim,
  rejectClaim,
  adminDecision,
  getClaimsForItem,
  getClaimDetails,
};