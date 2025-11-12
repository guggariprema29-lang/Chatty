# ⏳ Auto-Disappear by Emotion Feature

## Overview
Messages automatically disappear based on their detected emotion! Angry/sad messages vanish faster, while positive messages stay longer. Perfect for temporary conversations and emotional awareness!

---

## ✨ How It Works

### Emotion-Based Expiration Times:

#### 🔥 Negative Emotions (Disappear Fast):
- 😠 **Angry**: 30 seconds
- 😢 **Sad**: 45 seconds
- 😰 **Worried**: 40 seconds

#### ⏳ Neutral Emotions (Medium Duration):
- 🤔 **Confused**: 2 minutes
- 💭 **Thinking**: 2.5 minutes
- 😴 **Tired**: 1.5 minutes
- 🤒 **Sick**: 1 minute 40 seconds

#### ✨ Positive Emotions (Stay Longer):
- 😊 **Happy**: 3 minutes
- 🎉 **Excited**: 3 minutes 20 seconds
- ❤️ **Love**: 4 minutes
- 🙏 **Grateful**: 3 minutes 40 seconds
- 🤣 **Laughing**: 3 minutes
- 😎 **Cool**: 2 minutes 40 seconds
- 🎊 **Celebration**: 5 minutes (longest!)
- 😲 **Surprised**: 2 minutes

#### 📝 Default (No Mood):
- **Neutral messages**: 2 minutes

---

## 🎯 Features

### 1. Smart Detection
- ✅ Automatically detects emotion from message text
- ✅ Calculates expiration time based on mood
- ✅ Stores mood with message

### 2. Visual Countdown
- ⏰ Real-time countdown timer
- 🔥 Urgent warnings (< 10 seconds)
- ⏳ Color-coded urgency
- 💨 Disappear animation

### 3. Toggle Control
- 🕐 Clock button to enable/disable
- 🟡 Yellow when enabled
- ⚪ Gray when disabled
- 📱 Works per-message

### 4. Smart Behavior
- ✅ Only affects messages with toggle ON
- ✅ Sender and receiver both see timer
- ✅ Messages disappear for everyone
- ✅ Toast notification on disappear

---

## 🎮 How to Use

### Sending Auto-Disappearing Messages:

**Step 1**: Type your message
```
"I'm so angry about this!"
```

**Step 2**: Click the Clock (🕐) button
- Button turns **yellow** when enabled
- Hover to see tooltip

**Step 3**: Send message
- Auto-delete is activated!
- Message will disappear based on emotion

**Step 4**: Watch the countdown
- See timer appear below message
- Color changes as time runs out:
  - 🟢 Green (> 60s)
  - 🔵 Blue (30-60s)
  - 🟠 Orange (10-30s)
  - 🔴 Red (< 10s, pulsing)

**Step 5**: Message disappears!
- 💨 "Message disappeared" toast
- Removed from chat for everyone

---

## 📊 Examples

### Example 1: Angry Message (Fast)
```
User types: "This is so annoying!"
Mood detected: 😠 Angry
Expiration: 30 seconds
Display: "This is so annoying! 😠 | ⏰ 0:28"
Result: Disappears after 30 seconds
```

### Example 2: Happy Message (Slow)
```
User types: "I'm so happy today!"
Mood detected: 😊 Happy
Expiration: 3 minutes
Display: "I'm so happy today! 😊 | ⌛ 2:58"
Result: Disappears after 3 minutes
```

### Example 3: Celebration (Longest)
```
User types: "Happy birthday! Let's celebrate!"
Mood detected: 🎊 Celebration
Expiration: 5 minutes
Display: "Happy birthday! Let's celebrate! 🎊 | ⌛ 4:59"
Result: Disappears after 5 minutes
```

### Example 4: No Auto-Delete
```
User types: "Hello"
Auto-delete: OFF (clock button not pressed)
Display: "Hello" (no timer)
Result: Message stays permanently
```

---

## 🎨 Visual Indicators

### Clock Button States:
```
⚪ OFF  - Gray circle, no auto-delete
🟡 ON   - Yellow circle, auto-delete enabled
```

### Timer Colors:
```
🟢 Green    - > 60s remaining (safe)
🔵 Blue     - 30-60s remaining
🟠 Orange   - 10-30s remaining (warning)
🔴 Red      - < 10s remaining (urgent, pulsing!)
```

### Timer Emojis:
```
⌛ Hourglass - > 60s
⏳ Hourglass - 30-60s  
⏰ Clock     - 10-30s
🔥 Fire      - < 10s (about to disappear!)
```

### Display Format:
```
⏰ 2:30  - 2 minutes 30 seconds
⏰ 0:45  - 45 seconds
⏰ 15s   - 15 seconds
🔥 5s    - 5 seconds (URGENT!)
```

---

## 📁 Files Created

### Backend:
- **Updated**: `backend/src/models/message.model.js`
  - Added `autoDeleteEnabled` field
  - Added `expiresAt` field
  - Added `detectedMood` field

### Frontend Utilities:
- **New**: `frontend/src/lib/messageExpiration.js`
  - Expiration time calculation
  - Mood-based timing logic
  - Timer formatting functions
  - Color/emoji helpers

### Frontend Components:
- **New**: `frontend/src/components/ExpiringMessage.jsx`
  - Countdown timer component
  - Auto-updates every second
  - Triggers expiration callback

### Updated Components:
- **ChatContainer.jsx**
  - Filter expired messages
  - Display countdown timers
  - Handle expiration events
  
- **MessageInput.jsx**
  - Clock toggle button
  - Calculate expiration on send
  - Detect mood automatically

---

## 🔧 Configuration

### Change Expiration Times:
Edit `frontend/src/lib/messageExpiration.js`:

```javascript
const EXPIRATION_TIMES = {
  angry: 30,      // Change to 60 for 1 minute
  happy: 180,     // Change to 300 for 5 minutes
  celebration: 300, // Change to 600 for 10 minutes
  // ...
};
```

### Change Default Time:
```javascript
default: 120,  // Change from 2 minutes to whatever you want
```

### Add New Emotion:
```javascript
motivated: 240,  // 4 minutes
```

---

## 💡 Use Cases

### 1. Temporary Venting
```
"I'm so frustrated with this bug!" 😠
→ Disappears in 30 seconds
→ Keeps chat clean
→ Emotion expressed, then gone!
```

### 2. Celebration Messages
```
"We shipped it! 🎉"
→ Stays for 5 minutes
→ Everyone celebrates
→ Then naturally disappears
```

### 3. Sensitive Topics
```
"I'm worried about the deadline" 😰
→ Disappears in 40 seconds
→ Concern expressed
→ No permanent record
```

### 4. Quick Updates
```
"Running 5 minutes late"
→ Enable auto-delete
→ Disappears after timer
→ No clutter
```

### 5. Emotional Check-ins
```
"Feeling tired today" 😴
→ Disappears in 90 seconds
→ Mood shared
→ Doesn't linger
```

---

## ⚡ Quick Tips

### When to Use:
- ✅ Temporary emotional messages
- ✅ Quick status updates
- ✅ Sensitive information
- ✅ Venting frustrations
- ✅ Time-sensitive info

### When NOT to Use:
- ❌ Important information
- ❌ Instructions needed later
- ❌ Links/references
- ❌ Decisions/agreements
- ❌ Contact information

### Pro Tips:
1. **Angry?** Message disappears fast (30s) - perfect for cooling down!
2. **Celebrating?** Longest timer (5min) - enjoy the moment!
3. **Neutral info?** Maybe skip auto-delete - keep it permanent
4. **Quick vent?** Enable it - express then move on
5. **Check the timer!** Watch to see how long you have

---

## 🎭 Psychology Behind It

### Why Emotion-Based Timing?

**Negative Emotions (Short Timer)**:
- Helps move past negative feelings faster
- Reduces negative atmosphere in chat
- Encourages emotional processing
- Prevents dwelling on problems

**Positive Emotions (Long Timer)**:
- Extends positive vibes
- Celebrates achievements longer
- Reinforces good feelings
- Creates lasting good memories

**Neutral Emotions (Medium Timer)**:
- Balanced approach
- Neither too quick nor too slow
- Appropriate for information
- Natural conversation flow

---

## 📊 Expiration Times Chart

```
Emotion         | Time    | Reasoning
----------------|---------|---------------------------
😠 Angry        | 30s     | Quick release, move on
😢 Sad          | 45s     | Process but don't linger
😰 Worried      | 40s     | Acknowledge, then let go
🤔 Confused     | 2min    | Time to get clarification
😴 Tired        | 1.5min  | Temporary state
😊 Happy        | 3min    | Enjoy the feeling!
🎉 Excited      | 3.5min  | Share the excitement
❤️ Love         | 4min    | Love lasts longer
🙏 Grateful     | 3.5min  | Appreciation deserves time
🤣 Laughing     | 3min    | Laughter is precious
🎊 Celebration  | 5min    | Longest! Enjoy it!
```

---

## 🐛 Troubleshooting

**Timer not showing?**
- Make sure clock button is yellow (enabled)
- Check message was sent with auto-delete ON
- Refresh if needed

**Message not disappearing?**
- Check expiration time hasn't passed
- Verify timer reached 0
- Look for "Message disappeared" toast

**Wrong expiration time?**
- Check mood detection on message
- Verify emotion was detected correctly
- See `detectedMood` field in message

**Clock button not working?**
- Try toggling again
- Check button turns yellow when enabled
- Hover to see tooltip

---

## 🎉 Benefits

### For Users:
- ✅ Express emotions safely
- ✅ Temporary venting outlet
- ✅ Auto-cleanup
- ✅ Less chat clutter
- ✅ Emotional awareness

### For Teams:
- ✅ Healthier communication
- ✅ Reduces negativity buildup
- ✅ Encourages positive vibes
- ✅ Natural conversation flow
- ✅ Less moderation needed

### For Privacy:
- ✅ Sensitive info auto-deletes
- ✅ No permanent record
- ✅ User control
- ✅ Peace of mind
- ✅ GDPR-friendly

---

## 🚀 Future Enhancements

Potential additions:
- [ ] Custom timer setting
- [ ] Batch delete all expired
- [ ] Export before deletion
- [ ] Notification before disappear
- [ ] Extend timer option
- [ ] Admin override
- [ ] Statistics on deleted messages
- [ ] Recovery within grace period

---

## 🎬 Demo Scenarios

### Scenario 1: Frustrated User
```
1. User types: "I'm so mad about this bug!"
2. Clicks clock button (turns yellow)
3. Sends message
4. Mood detected: 😠 Angry (30s)
5. Timer shows: 🔥 0:28
6. Counts down: 0:27... 0:26... 
7. At 0:10 - turns red and pulses
8. At 0:00 - 💨 "Message disappeared"
9. User has moved on emotionally ✨
```

### Scenario 2: Team Celebration
```
1. User types: "We did it! Congrats team! 🎉"
2. Enables auto-delete
3. Sends message
4. Mood detected: 🎊 Celebration (5min)
5. Timer shows: ⌛ 4:59
6. Whole team celebrates!
7. After 5 minutes - message disappears
8. Chat stays clean
9. Memory preserved, clutter removed
```

---

Enjoy your emotionally-intelligent disappearing messages! ⏳✨
