//NPM Packages
const { nanoid } = require("nanoid");

//Schemas
const { orderSchema } = require("../schema/Order");

// models
const Order = require("../models/order");

// utils
const sendNotification = require("../utils/notification");

/**
 * @desciption regsiter home owner
 * @route POST /api/user/register
 * @access Public
 */
module.exports.createOder = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  // Error Handling
  const result = orderSchema(payload);
  if (result.error) {
    const errors = result.error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: false,
      msg: errors,
    });
  }

  try {
    const orderId = `#ID-${nanoid(6)}`;

    await Order.create({
      orderId,
      ownerId: id,
      location: payload.location,
      duration: payload.duration,
      jobType: payload.jobType,
      charges: payload.charges,
      status: payload.status,
    });

    return res.status(201).json({
      status: true,
      msg: "Order created successfully!",
      orderId,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

/**
 * @desciption maid applying to the order that the onner created
 * @route POST /api/order/apply/:maidId
 * @access Private
 */
module.exports.applyOrder = async (req, res) => {
  const { orderId } = req.params;
  const { _id } = req.maid;
  const maidId = _id;
  try {
    const order = await Order.findById(orderId).populate("ownerId  maidId");

    if (!order) {
      return res.status(404).json({
        status: false,
        msg: "Order not found",
      });
    }

    if (!order.ownerId) {
      return res.status(400).json({
        status: false,
        msg: "Owner not associated with this order.",
      });
    }

    // Check if maid already applied
    if (order.applicants.includes(maidId)) {
      return res.status(400).json({
        status: false,
        msg: "You have already applied to this order",
      });
    }

    // Add maid to applicants and set appliedAt time
    await Order.findByIdAndUpdate(orderId, {
      $addToSet: { applicants: maidId },
      appliedAt: new Date(),
    });

    const fcmToken = order.ownerId.fcm || null;
    const maidName = order.maidId.userName || "Maid";

    if (!fcmToken) {
      return res.status(400).json({
        status: false,
        msg: "FCM token not found for the owner.",
      });
    }

    sendNotification(
      fcmToken,
      "Order Received",
      `${maidName} has applied to your order!`
    );

    return res.status(201).json({
      status: true,
      msg: "Applied to order successfully!",
      orderId,
      appliedAt: new Date(),
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

/**
 * @description accept the order (called by owner)
 * @route POST /api/order/accept/:orderId
 * @access Private (owner)
 */
module.exports.acceptOrder = async (req, res) => {
  const { _id } = req.user;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({
      _id: orderId,
      ownerId: _id,
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        msg: "Order not found or you don't have permission",
      });
    }

    if (!order.applicants || order.applicants.length === 0) {
      return res.status(400).json({
        status: false,
        msg: "No maids have applied to this order",
      });
    }

    const maidId = order.applicants[0];
    console.log("Maid ID:", maidId);
    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "in progress",
        maidId: maidId,
        $pull: { applicants: maidId },
      },
      { new: true }
    ).populate("maidId");

    // Send notification to maid
    if (updatedOrder.maidId?.fcm) {
      sendNotification(
        updatedOrder.maidId.fcm,
        "Order Accepted",
        `Your application for order has been accepted!`
      );
    }

    return res.status(200).json({
      status: true,
      msg: "Order accepted successfully!",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

/**
 * @description decline the order
 * @route POST /api/order/decline/:orderId
 * @access Private (owner)
 */
module.exports.declineOrder = async (req, res) => {
  const { _id } = req.user;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({
      _id: orderId,
      ownerId: _id,
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        msg: "Order not found or you don't have permission",
      });
    }

    if (!order.applicants || order.applicants.length === 0) {
      return res.status(400).json({
        status: false,
        msg: "No maids have applied to this order",
      });
    }

    // Remove the first maid from applicants
    const maidId = order.applicants[0];
    await Order.findByIdAndUpdate(orderId, {
      $pull: { applicants: maidId },
    });

    // Send notification to maid
    if (maidId) {
      sendNotification(
        maidId.fcm,
        "Order Declined",
        `Your application for order has been declined!`
      );
    }

    return res.status(200).json({
      status: true,
      msg: "Order declined successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

/**
 * @description get all owner orders 
 * @route POST /api/order/get-owner-order/:orderId
 * @access Private (owner)
 */
module.exports.getOwnerOrders = async (req, res) => {
  const { _id } = req.user;
  const {status} = req.query;

  try {
    const filter = { maidId: _id };
    if (status) {
      filter.status = status;
    }
    
    const orders = await Order.find(filter);

    return res.status(200).json({
      status: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    }); 
  }
};

/**
 * @description get all maid orders 
 * @route POST /api/order/get-owner-order/:orderId
 * @access Private (owner)
 */
module.exports.getMaidOrders = async (req, res) => {
  const { _id } = req.maid;
  const {status} = req.query;
  console.log("Owner ID:", _id);

  try {
      const filter = { maidId: _id };

      if (status) {
        filter.status = status;
      }
    const orders = await Order.find(filter);

    return res.status(200).json({
      status: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

/**
 * @description sprcific order
 * @route POST /api/order/specific-owner-order/:orderId
 * @access Private (owner)
 */
module.exports.specificOwnerOrder = async (req, res) => {
  const { _id } = req.user;
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate("maidId ownerId");
    if (!order) {
      return res.status(404).json({ status: false, msg: "Order not found" });
    }

    if (order.maidId._id.toString() !== _id.toString()) {
      return res
        .status(403)
        .json({ status: false, msg: "Unauthorized access" });
    }
    order.status = "completed";
    await order.save();

    return res.status(200).json({
      status: true,
      order,
      maid: order.maidId,
      owner: order.ownerId,
    });
  } catch (error) {
    return res.status(500).json({ status: false, msg: error.message });
  }
};
/**
 * @description sprcific maid order
 * @route POST /api/order/specific-maid-order/:orderId
 * @access Private (owner)
 */
module.exports.specificMaidOrder = async (req, res) => {
  const { _id } = req.maid;
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate("maidId ownerId");

    if (!order) {
      return res.status(404).json({ status: false, msg: "Order not found" });
    }

    if (order.maidId._id.toString() !== _id.toString()) {
      return res
        .status(403)
        .json({ status: false, msg: "Unauthorized access" });
    }

    order.status = "completed";
    await order.save();

    return res.status(200).json({
      status: true,
      order,
      maid: order.maidId,
      owner: order.ownerId,
    });
  } catch (error) {
    return res.status(500).json({ status: false, msg: error.message });
  }
};
