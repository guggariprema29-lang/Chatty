import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, photo, isPublic, memberIds } = req.body;
    if (!name) return res.status(400).json({ message: "Group name is required" });

    const creatorId = req.user._id;

    const group = new Group({
      name,
      description: description || "",
      photo: photo || "",
      isPublic: !!isPublic,
      members: [{ user: creatorId }],
      admins: [creatorId],
    });

    // add optional initial members
    if (Array.isArray(memberIds)) {
      memberIds.forEach((id) => {
        if (String(id) !== String(creatorId)) group.members.push({ user: id });
      });
    }

    await group.save();

    res.status(201).json(group);
  } catch (err) {
    console.error("createGroup error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupsForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ "members.user": userId }).populate("members.user", "fullName profilePic email").lean();
    res.status(200).json(groups);
  } catch (err) {
    console.error("getGroupsForUser error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // only admins can add
    if (!group.admins.map(String).includes(String(userId))) {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    // don't add if already member
    if (group.members.some((m) => String(m.user) === String(memberId))) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push({ user: memberId });
    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error("addMember error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id: groupId, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // only admins can remove
    if (!group.admins.map(String).includes(String(userId))) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    // can't remove last admin (if removing admin)
    if (String(memberId) === String(userId)) {
      // admin removing self is allowed only if there is another admin
      if (group.admins.length <= 1) {
        return res.status(400).json({ message: "Cannot remove the last admin" });
      }
    }

    group.members = group.members.filter((m) => String(m.user) !== String(memberId));
    group.admins = group.admins.filter((a) => String(a) !== String(memberId));

    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error("removeMember error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { name, description, photo, isPublic } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.admins.map(String).includes(String(userId))) {
      return res.status(403).json({ message: "Only admins can update group" });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (photo !== undefined) group.photo = photo;
    if (isPublic !== undefined) group.isPublic = isPublic;

    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error("updateGroup error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
