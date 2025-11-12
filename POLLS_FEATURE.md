# 📊 Polls Inside Chat Feature

## Overview
Create quick polls directly in chat without leaving the app! Perfect for group decisions like "Where to meet?" or "Which movie to watch?" with real-time voting results!

---

## ✨ Features

### Poll Creation:
- ✅ **Quick & Easy** - Create polls in seconds
- ✅ **2-10 Options** - Support for multiple choices
- ✅ **Custom Question** - Up to 200 characters
- ✅ **Change Votes** - Optional vote changing
- ✅ **Expiration** - Set auto-close time
- ✅ **Real-time** - Instant vote updates

### Voting:
- ✅ **One-Click Voting** - Tap to vote
- ✅ **Live Results** - See percentages update
- ✅ **Vote Counts** - See total votes
- ✅ **Progress Bars** - Visual representation
- ✅ **Your Vote Highlighted** - See what you voted

### Management:
- ✅ **Close Polls** - Stop accepting votes
- ✅ **Delete Polls** - Remove polls
- ✅ **Auto-Expire** - Automatic closing
- ✅ **Creator Controls** - Manage your polls

---

## 🎮 How to Use

### Creating a Poll:

**Step 1**: Click the **📊 Poll button** in message input
- Next to emoji, image, clock, and send buttons

**Step 2**: Fill in poll details
```
Question: "Where should we meet?"
Options:
  1. Coffee shop
  2. Library  
  3. Park
  4. Online
```

**Step 3**: Configure settings
- ☑️ Allow changing votes (optional)
- ⏰ Set expiration time
  - Never
  - 1 hour
  - 6 hours
  - 12 hours
  - 1 day
  - 3 days
  - 1 week

**Step 4**: Click "Create Poll"
- Poll appears in chat immediately!
- Everyone can start voting

---

### Voting on a Poll:

**Step 1**: See the poll in chat
- Question displayed at top
- Options shown with progress bars

**Step 2**: Click an option to vote
- Your vote is highlighted with ✓
- Percentage updates in real-time

**Step 3**: Change your vote (if allowed)
- Click different option
- Previous vote moves automatically

**Step 4**: See results
- Progress bars show distribution
- Percentages calculated automatically
- Vote counts displayed

---

## 📊 Poll Display

### Visual Structure:
```
┌────────────────────────────────────┐
│ 📊 Poll                    [×] [⏰] │
│                                    │
│ Where should we meet?              │
│                                    │
│ ▓▓▓▓▓▓▓▓░░░░ Coffee shop  45%  9   │
│ ▓▓▓▓░░░░░░░░ Library      25%  5   │
│ ▓▓░░░░░░░░░░ Park         15%  3   │
│ ▓░░░░░░░░░░░ Online       15%  3   │
│                                    │
│ 20 votes • by You                  │
└────────────────────────────────────┘
```

### Color Coding:
- **Your Vote**: Blue background with ✓ checkmark
- **Other Options**: Gray background
- **Closed Poll**: "Closed" badge displayed
- **Progress Bars**: Filled based on percentage

---

## 🎯 Example Use Cases

### Example 1: Meeting Location
```
Question: "Where to meet for study session?"
Options:
  - Coffee shop near campus
  - Library 2nd floor
  - Student center
  - Virtual (Zoom)
  
Settings: Allow vote changes, Expires in 6 hours
Result: Everyone votes, majority wins!
```

### Example 2: Movie Night
```
Question: "Which movie should we watch?"
Options:
  - Action movie
  - Comedy
  - Horror
  - Drama
  - Documentary
  
Settings: No vote changes, Expires in 1 day
Result: Democracy in action!
```

### Example 3: Team Decision
```
Question: "Best time for team meeting?"
Options:
  - Monday 2pm
  - Tuesday 10am
  - Wednesday 4pm
  - Thursday 3pm
  
Settings: Allow changes, Never expires
Result: Find time that works for everyone
```

### Example 4: Quick Poll
```
Question: "Pizza or Burgers for lunch?"
Options:
  - Pizza 🍕
  - Burgers 🍔
  
Settings: Allow changes, Expires in 1 hour
Result: Fast decision making!
```

---

## 📱 UI Elements

### Poll Button Location:
```
Message Input Bar:
[😊 Emoji] [📷 Image] [🕐 Auto-Delete] [📊 Poll] [➤ Send]
                                         ↑
                                    Click here!
```

### Poll Card Features:
- **Header**: 📊 Poll icon + Question
- **Options**: Clickable with progress bars
- **Footer**: Vote count + Creator name
- **Actions**: Close/Delete (creator only)

### Real-time Updates:
- Vote counts update instantly
- Percentages recalculate automatically
- Progress bars animate smoothly
- All users see changes simultaneously

---

## 🔧 Poll Settings

### Expiration Options:
```
Never      - Poll stays open indefinitely
1 hour     - Auto-closes after 1 hour
6 hours    - Good for same-day decisions
12 hours   - Half-day window
1 day      - Full day voting
3 days     - Extended voting period
1 week     - Long-term poll
```

### Vote Changing:
- **Disabled**: Vote once, can't change
- **Enabled**: Can switch votes anytime
- Useful for "what if" scenarios

---

## 🎨 Visual Features

### Progress Bars:
- Filled portion shows percentage
- Color: Primary theme color
- Smooth animations
- Real-time updates

### Vote Indicators:
- ✓ Checkmark on your vote
- Blue highlight background
- Border emphasis
- Clear visual feedback

### Status Badges:
- **Active**: No badge (green)
- **Closed**: Gray "Closed" badge
- **Expired**: Auto-closed indicator

---

## 📁 Files Created

### Backend:

#### Poll Model
**File**: `backend/src/models/poll.model.js`
```javascript
{
  creatorId: User,
  chatId: String,
  chatType: "user" | "group",
  question: String,
  options: [
    {
      text: String,
      votes: [{ userId, votedAt }]
    }
  ],
  allowMultipleVotes: Boolean,
  expiresAt: Date,
  isActive: Boolean,
  totalVotes: Number
}
```

#### Poll Controller
**File**: `backend/src/controllers/poll.controller.js`
- `createPoll()` - Create new poll
- `getPollsForChat()` - Load all polls
- `voteOnPoll()` - Cast/change vote
- `closePoll()` - Close voting
- `deletePoll()` - Remove poll

#### Poll Routes
**File**: `backend/src/routes/poll.route.js`
```
POST   /api/polls/create
GET    /api/polls/chat/:chatId
POST   /api/polls/:pollId/vote
PUT    /api/polls/:pollId/close
DELETE /api/polls/:pollId
```

### Frontend:

#### Components
1. **CreatePollModal.jsx** - Poll creation UI
2. **PollCard.jsx** - Poll display & voting
3. Updated **MessageInput.jsx** - Poll button
4. Updated **ChatContainer.jsx** - Poll display

---

## 🔄 Real-Time Features

### Socket Events:
```javascript
// New poll created
socket.on("newPoll", (poll) => {
  // Add to poll list
});

// Vote cast
socket.on("pollUpdate", (updatedPoll) => {
  // Update poll data
  // Recalculate percentages
});

// Poll deleted
socket.on("pollDeleted", (pollId) => {
  // Remove from list
});
```

### Instant Updates:
- ✅ New polls appear immediately
- ✅ Votes update in real-time
- ✅ All participants see changes
- ✅ No refresh needed

---

## 💡 Tips & Tricks

### Best Practices:

**Clear Questions:**
```
✓ "Where to meet for lunch?"
✗ "Thoughts?"
```

**Specific Options:**
```
✓ "Coffee Shop on Main St"
✗ "Maybe somewhere"
```

**Appropriate Timeouts:**
```
Quick decisions: 1-6 hours
Daily plans: 12-24 hours
Weekly events: 3-7 days
Open discussions: Never
```

**Vote Changing:**
```
Enable: Brainstorming, preferences
Disable: Final decisions, commitments
```

---

## 🎯 Pro Features

### Creator Controls:
- 🔒 **Close Poll**: Stop accepting votes
  - Click clock icon
  - Preserves current results
  
- 🗑️ **Delete Poll**: Remove completely
  - Click X icon
  - Confirms before deleting

### Voting Intelligence:
- **Single Vote Mode**: Vote moves if you click another option
- **Change Vote Mode**: Can vote for same option again to remove
- **Real-time Sync**: All devices update together

---

## 📊 Statistics & Results

### Displayed Info:
- **Total Votes**: Sum of all votes cast
- **Percentages**: Auto-calculated per option
- **Progress Bars**: Visual representation
- **Creator**: Who created the poll
- **Expiry**: When poll closes (if set)

### Calculation:
```javascript
Percentage = (Option Votes / Total Votes) × 100
Progress Bar Width = Percentage value
```

---

## 🚀 Advanced Usage

### Group Polling:
```
1. Create poll in group chat
2. All members can vote
3. Results visible to everyone
4. Great for team decisions
```

### 1-on-1 Polling:
```
1. Create poll in direct message
2. Both users can vote
3. Quick two-person decisions
4. Simple majority voting
```

### Sequential Polls:
```
1. First poll: General direction
2. Second poll: Specific options
3. Third poll: Final confirmation
4. Progressive decision making
```

---

## ⚙️ Configuration

### Customize Limits:
Edit `backend/src/controllers/poll.controller.js`:

```javascript
// Max options
if (options.length > 10) {
  // Change 10 to your limit
}

// Question length
maxlength: 200  // Change in model
```

### Customize Timeouts:
Edit `CreatePollModal.jsx`:

```javascript
<option value={2}>2 hours</option>  // Add custom
<option value={48}>2 days</option>  // Add custom
```

---

## 🔍 Troubleshooting

**Poll not appearing?**
- Refresh the chat
- Check socket connection
- Verify both users in chat

**Can't vote?**
- Poll might be closed
- Check if expired
- Verify you're in the chat

**Percentages wrong?**
- Should auto-correct on refresh
- Check total votes count
- Report if persists

**Vote not saving?**
- Check internet connection
- Verify poll still active
- Try voting again

---

## 🎉 Benefits

### For Teams:
- ✅ Quick consensus building
- ✅ Democratic decisions
- ✅ Everyone has a voice
- ✅ No external tools needed
- ✅ Integrated workflow

### For Groups:
- ✅ Plan events easily
- ✅ Choose locations
- ✅ Pick activities
- ✅ Make group decisions
- ✅ Save time

### For Projects:
- ✅ Feature prioritization
- ✅ Timeline decisions
- ✅ Resource allocation
- ✅ Sprint planning
- ✅ Team alignment

---

## 📝 API Examples

### Create Poll:
```javascript
POST /api/polls/create
{
  "chatId": "groupId or userId",
  "chatType": "group",
  "question": "Where to meet?",
  "options": ["Coffee shop", "Library", "Park"],
  "allowMultipleVotes": true,
  "expiresIn": 6
}
```

### Vote:
```javascript
POST /api/polls/:pollId/vote
{
  "optionIndex": 0
}
```

### Get Polls:
```javascript
GET /api/polls/chat/:chatId
```

---

Enjoy democratic decision-making in your chats! 📊✨
