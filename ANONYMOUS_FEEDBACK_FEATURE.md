# 🎭 Anonymous Feedback Mode Feature

## Overview
Users can send anonymous feedback, compliments, or suggestions to each other once per day. Perfect for team chats, group projects, and positive team culture!

---

## ✨ Key Features

### 1. Three Types of Anonymous Messages:
- 💖 **Compliments** - Positive feedback and appreciation
- 📝 **Feedback** - Constructive criticism and improvement suggestions  
- 💡 **Suggestions** - Ideas and recommendations

### 2. Privacy & Limits:
- ✅ **Completely Anonymous** - Sender identity is never revealed
- ✅ **Daily Limit** - 1 message per person per day
- ✅ **Prevents Abuse** - Rate limiting built-in
- ✅ **Read Receipts** - Know when feedback is read

### 3. Features:
- 🎭 Send anonymous messages from chat header
- 📬 Inbox with unread count badge
- 🗑️ Delete received feedback
- ⏰ 24-hour cooldown timer
- 📊 View all received feedback
- 🎨 Color-coded by type

---

## 🎯 How It Works

### Sending Feedback:

1. **Open a 1-on-1 Chat**
   - Click on any user to open chat
   
2. **Click the 🎭 Icon**
   - Located in the chat header (top right)
   
3. **Choose Type**
   - 💖 Compliment
   - 📝 Feedback
   - 💡 Suggestion
   
4. **Write Message**
   - Max 500 characters
   - See helpful examples
   
5. **Send Anonymously**
   - Message sent! 
   - 24-hour cooldown starts
   
### Receiving Feedback:

1. **Notification Badge**
   - See unread count in navbar
   - 🎭 Feedback button shows number
   
2. **Open Inbox**
   - Click "🎭 Feedback" in navbar
   - View all received feedback
   
3. **Read Messages**
   - Color-coded by type
   - Timestamp shown
   - Completely anonymous
   
4. **Manage Inbox**
   - Delete unwanted feedback
   - Messages auto-mark as read

---

## 📁 Files Created

### Backend:

#### 1. **Feedback Model**
**File**: `backend/src/models/feedback.model.js`
```javascript
{
  senderId: ObjectId (hidden from recipient),
  recipientId: ObjectId,
  message: String (max 500 chars),
  type: "compliment" | "feedback" | "suggestion",
  isRead: Boolean,
  sentDate: Date (for daily limit tracking)
}
```

#### 2. **Feedback Controller**
**File**: `backend/src/controllers/feedback.controller.js`
- `sendFeedback()` - Send anonymous feedback with daily limit check
- `getMyFeedback()` - Get all feedback received
- `getUnreadCount()` - Count unread feedback
- `canSendFeedback()` - Check if can send to user today
- `deleteFeedback()` - Delete received feedback

#### 3. **Feedback Routes**
**File**: `backend/src/routes/feedback.route.js`
```
POST   /api/feedback/send
GET    /api/feedback/my-feedback
GET    /api/feedback/unread-count
GET    /api/feedback/can-send/:recipientId
DELETE /api/feedback/:id
```

### Frontend:

#### 4. **Send Feedback Modal**
**File**: `frontend/src/components/SendFeedbackModal.jsx`
- Beautiful modal UI
- Type selection (compliment/feedback/suggestion)
- Character counter
- Helpful examples
- Daily limit enforcement

#### 5. **Feedback Inbox**
**File**: `frontend/src/components/FeedbackInbox.jsx`
- View all received feedback
- Color-coded by type
- Delete functionality
- Empty state
- Timestamp display

#### 6. **Updated Components**
- **ChatHeader.jsx** - Added 🎭 button for sending
- **Navbar.jsx** - Added inbox button with unread badge
- **index.js** - Added feedback routes

---

## 🎨 UI Elements

### Chat Header Button:
```
┌─────────────────────────────────┐
│ [Avatar] John Doe        🎭 ✕   │
└─────────────────────────────────┘
         Send Feedback ↑
```

### Navbar Badge:
```
┌───────────────────────────────────┐
│ Chatty    [🎭 Feedback (3)] ...   │
└───────────────────────────────────┘
           Unread count ↑
```

### Feedback Types:
- 💖 **Compliment** (Pink)
- 📝 **Feedback** (Blue)
- 💡 **Suggestion** (Yellow)

---

## 💡 Example Messages

### Compliments:
```
"Your presentation was amazing! Great job on the research!"

"You're always so helpful and supportive. Thank you!"

"Your code is so clean and well-documented. Impressive!"
```

### Feedback:
```
"Your ideas are great, but try to be more concise in meetings."

"Consider adding comments to your code for better readability."

"Your reports are thorough, but could use better formatting."
```

### Suggestions:
```
"Maybe we could try a different approach for this problem?"

"Have you considered using that new framework we discussed?"

"What if we broke this task into smaller milestones?"
```

---

## 🔒 Privacy & Security

### Complete Anonymity:
- ✅ Sender ID **never** revealed to recipient
- ✅ Backend excludes `senderId` from response
- ✅ No way to trace who sent feedback
- ✅ Database still tracks sender (for abuse prevention)

### Rate Limiting:
- ✅ **1 feedback per person per day**
- ✅ 24-hour cooldown period
- ✅ Prevents spam and abuse
- ✅ Encourages thoughtful feedback

### Validation:
- ✅ Cannot send to yourself
- ✅ Recipient must exist
- ✅ Message required (max 500 chars)
- ✅ Type validation

---

## 🎮 Testing Guide

### Test Scenario 1: Send Compliment

1. Open chat with any user
2. Click 🎭 button in header
3. Select "Compliment"
4. Type: "You're doing an amazing job!"
5. Click "Send Anonymously"
6. ✅ Success toast appears
7. ✅ Can't send again for 24 hours

### Test Scenario 2: Receive Feedback

1. Have another user send you feedback
2. Check navbar - see unread badge
3. Click "🎭 Feedback" button
4. ✅ See feedback in inbox
5. ✅ Badge disappears
6. ✅ Feedback marked as read

### Test Scenario 3: Daily Limit

1. Send feedback to User A
2. Try to send again immediately
3. ✅ Error: "Daily limit reached"
4. ✅ Shows next available time
5. Wait 24 hours
6. ✅ Can send again

### Test Scenario 4: Delete Feedback

1. Open feedback inbox
2. Click trash icon on any feedback
3. Confirm deletion
4. ✅ Feedback removed
5. ✅ Count updated

---

## 🔧 Configuration

### Change Daily Limit:
Edit `backend/src/controllers/feedback.controller.js`:
```javascript
// Change 24 hours to different value
const hoursLimit = 24; // Change this
const today = new Date();
today.setHours(today.getHours() - hoursLimit);
```

### Change Character Limit:
Edit `backend/src/models/feedback.model.js`:
```javascript
message: {
  type: String,
  required: true,
  maxlength: 500, // Change this
}
```

### Add New Feedback Types:
Edit `backend/src/models/feedback.model.js`:
```javascript
type: {
  type: String,
  enum: ["compliment", "feedback", "suggestion", "question"], // Add new type
  default: "feedback",
}
```

Then update `SendFeedbackModal.jsx` feedbackTypes array.

---

## 📊 API Endpoints

### Send Feedback
```http
POST /api/feedback/send
Content-Type: application/json

{
  "recipientId": "user_id",
  "message": "Great work!",
  "type": "compliment"
}

Response: 
{
  "message": "Anonymous feedback sent successfully",
  "feedback": { "_id": "...", "type": "compliment", "createdAt": "..." }
}
```

### Get My Feedback
```http
GET /api/feedback/my-feedback

Response:
[
  {
    "_id": "...",
    "recipientId": "...",
    "message": "Great presentation!",
    "type": "compliment",
    "isRead": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### Check Unread Count
```http
GET /api/feedback/unread-count

Response:
{ "count": 3 }
```

### Can Send Feedback?
```http
GET /api/feedback/can-send/:recipientId

Response:
{ 
  "canSend": false,
  "reason": "Daily limit reached",
  "nextAvailableTime": "2024-01-16T10:00:00Z"
}
```

### Delete Feedback
```http
DELETE /api/feedback/:id

Response:
{ "message": "Feedback deleted successfully" }
```

---

## 🚀 Use Cases

### Team Projects:
- Give kudos to team members
- Share improvement ideas anonymously
- Boost morale with compliments

### Workplace:
- Provide honest feedback to colleagues
- Recognize great work
- Suggest improvements without conflict

### Study Groups:
- Compliment classmates' contributions
- Give constructive feedback on presentations
- Share study tips anonymously

### Communities:
- Build positive culture
- Encourage participation
- Foster open communication

---

## 🎨 Visual Design

### Color Scheme:
- **Compliments**: Pink (#ec4899)
- **Feedback**: Blue (#3b82f6)
- **Suggestions**: Yellow (#eab308)

### Icons:
- 💖 Heart (Compliment)
- 📝 MessageSquare (Feedback)
- 💡 Lightbulb (Suggestion)
- 🗑️ Trash (Delete)

### Animations:
- Modal slide-in
- Smooth transitions
- Badge pulse on new feedback

---

## 📈 Future Enhancements

Potential additions:
- [ ] Analytics dashboard (most compliments received)
- [ ] Export feedback to PDF
- [ ] Filter by type
- [ ] Search feedback
- [ ] Feedback templates
- [ ] Group feedback (to entire team)
- [ ] Scheduled feedback delivery
- [ ] Feedback reactions
- [ ] Anonymous replies
- [ ] Mood-based feedback suggestions

---

## 🐛 Troubleshooting

**Can't send feedback?**
- Check if you've already sent to this person today
- Wait 24 hours from last send time
- Make sure you're not trying to send to yourself

**Unread count not updating?**
- Refresh the page
- Check browser console for errors
- Verify backend is running

**Feedback not appearing in inbox?**
- Check you're logged in as correct user
- Try refreshing inbox
- Check network tab for errors

**Daily limit not resetting?**
- Limit is 24 hours from send time, not calendar day
- Check `nextAvailableTime` in error response
- Backend uses UTC timezone

---

## 🎉 Benefits

### For Teams:
- ✅ Builds positive culture
- ✅ Encourages honest feedback
- ✅ Reduces conflict
- ✅ Increases engagement
- ✅ Boosts morale

### For Individuals:
- ✅ Receive constructive criticism safely
- ✅ Get anonymous compliments
- ✅ Learn from peers
- ✅ Feel appreciated
- ✅ Grow professionally

---

Enjoy spreading positivity and constructive feedback anonymously! 🎭✨
