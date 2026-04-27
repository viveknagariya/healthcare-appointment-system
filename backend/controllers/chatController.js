const Chat = require("../Models/Chat");
const Patient = require("../Models/Patient");
const Doctor = require("../Models/DoctorModel");

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, senderModel, receiverId, receiverModel, message } =
      req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let sName = "Unknown";
    let rName = "Unknown";

    if (senderModel === "Patient") {
      const p = await Patient.findById(senderId);
      if (p) sName = p.name;
    } else {
      const d = await Doctor.findById(senderId);
      if (d) sName = d.fullName;
    }

    if (receiverModel === "Patient") {
      const p = await Patient.findById(receiverId);
      if (p) rName = p.name;
    } else {
      const d = await Doctor.findById(receiverId);
      if (d) rName = d.fullName;
    }

    const newMessage = new Chat({
      senderId,
      senderModel,
      senderName: sName,
      receiverId,
      receiverModel,
      receiverName: rName,
      message,
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Chat.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    })
      .select("senderId senderModel receiverId receiverModel message createdAt")
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChatUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .select("senderId receiverId")
      .lean();

    const ids = new Set();
    chats.forEach((chat) => {
      if (chat.senderId.toString() !== userId)
        ids.add(chat.senderId.toString());
      if (chat.receiverId.toString() !== userId)
        ids.add(chat.receiverId.toString());
    });

    const users = await Patient.find({
      _id: { $in: Array.from(ids) },
    })
      .select("name email")
      .lean();

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.getChatMetadata = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .select("senderId receiverId message createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const metadataMap = new Map();

    chats.forEach((chat) => {
      const otherUserId = chat.senderId.toString() === userId 
        ? chat.receiverId.toString() 
        : chat.senderId.toString();

      if (!metadataMap.has(otherUserId)) {
        metadataMap.set(otherUserId, {
          otherUserId,
          lastMessage: chat.message,
          timestamp: chat.createdAt,
        });
      }
    });

    res.json({
      success: true,
      data: Array.from(metadataMap.values()),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
