const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Claim = sequelize.define(
  "Claim",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Which table this claim belongs to
    itemType: {
      type: DataTypes.ENUM("lost", "found"),
      allowNull: false,
    },

    // ID of LostItem or FoundItem
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // User who submitted the claim
    claimerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    reporterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    // ===== Claim Form Information =====

    lostLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lostDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    lostTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    howLost: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    whyYours: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    hiddenMarks: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    insideItem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Uploaded proof file names
    proofFiles: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ===== Approval Workflow =====

    reporterDecision: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected"
      ),
      defaultValue: "pending",
    },

    adminDecision: {
      type: DataTypes.ENUM(
        "not_required",
        "pending",
        "approved",
        "rejected"
      ),
      defaultValue: "not_required",
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "reporterApproved",
        "approved",
        "rejected"
      ),
      defaultValue: "pending",
    },
  },
  {
    tableName: "claims",
    timestamps: true,
  }
);

// ================= Relationships =================


Claim.belongsTo(User, {
  foreignKey: "claimerId",
  as: "Claimer",
});

    Claim.belongsTo(User, {
    foreignKey: "reporterId",
    as: "Reporter",
    });

User.hasMany(Claim, {
  foreignKey: "claimerId",
});

User.hasMany(Claim, {
  foreignKey: "reporterId",
});

module.exports = Claim;