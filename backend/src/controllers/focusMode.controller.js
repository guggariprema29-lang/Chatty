import FocusMode from "../models/focusMode.model.js";

export const getFocusMode = async (req, res) => {
  try {
    const userId = req.user._id;

    let focusMode = await FocusMode.findOne({ userId });

    if (!focusMode) {
      focusMode = new FocusMode({ userId });
      await focusMode.save();
    }

    res.status(200).json(focusMode);
  } catch (error) {
    console.error("Error in getFocusMode:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFocusMode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isEnabled, pinnedContacts, startTime, endTime } = req.body;

    let focusMode = await FocusMode.findOne({ userId });

    if (!focusMode) {
      focusMode = new FocusMode({ userId });
    }

    if (isEnabled !== undefined) focusMode.isEnabled = isEnabled;
    if (pinnedContacts !== undefined) focusMode.pinnedContacts = pinnedContacts;
    if (startTime !== undefined) focusMode.startTime = startTime;
    if (endTime !== undefined) focusMode.endTime = endTime;

    await focusMode.save();

    res.status(200).json(focusMode);
  } catch (error) {
    console.error("Error in updateFocusMode:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleFocusMode = async (req, res) => {
  try {
    const userId = req.user._id;

    let focusMode = await FocusMode.findOne({ userId });

    if (!focusMode) {
      focusMode = new FocusMode({ userId, isEnabled: true });
    } else {
      focusMode.isEnabled = !focusMode.isEnabled;
    }

    if (focusMode.isEnabled) {
      focusMode.startTime = new Date();
      focusMode.endTime = null;
    } else {
      focusMode.endTime = new Date();
    }

    await focusMode.save();

    res.status(200).json(focusMode);
  } catch (error) {
    console.error("Error in toggleFocusMode:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteFocusMode = async (req, res) => {
  try {
    const userId = req.user._id;

    await FocusMode.findOneAndDelete({ userId });

    res.status(200).json({ message: "Focus mode settings deleted" });
  } catch (error) {
    console.error("Error in deleteFocusMode:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
