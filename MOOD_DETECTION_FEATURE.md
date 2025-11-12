# 🎭 Message Mood Detection Feature

## Overview
Automatically detects the emotion or tone of messages and displays a corresponding emoji beside them.

## ✨ Features

### Supported Moods & Emojis:
- 😊 **Happy** - "I'm so happy!", "This is great!"
- 😢 **Sad** - "I'm feeling down", "So disappointed"
- 😠 **Angry** - "This is annoying!", "I'm so mad"
- 😴 **Tired** - "I'm so tired today", "Exhausted"
- 🎉 **Excited** - "Can't wait!", "So excited!"
- ❤️ **Love** - "Love this!", "You're the best"
- 🤔 **Confused** - "I don't understand", "Confused"
- 😰 **Worried** - "I'm worried", "Anxious about this"
- 😲 **Surprised** - "OMG!", "Can't believe it"
- 🙏 **Grateful** - "Thanks so much!", "Really appreciate it"
- 🤣 **Laughing** - "Haha that's funny!", "LOL"
- 😎 **Cool** - "Sounds cool", "No problem"
- 🤒 **Sick** - "Feeling unwell", "Got a fever"
- 🎊 **Celebration** - "Happy birthday!", "Congrats!"
- 💭 **Thinking** - "Hmm, let me think", "Maybe"

## 📁 Files Created

### 1. Mood Detection Utility
**File**: `frontend/src/lib/moodDetection.js`
- `detectMood(text)` - Analyzes text and returns mood object
- `getMoodEmoji(text)` - Returns just the emoji
- `hasStrongEmotion(text)` - Checks if emotion is strong

### 2. Mood Indicator Component
**File**: `frontend/src/components/MoodIndicator.jsx`
- Reusable component for displaying mood emojis
- Optional label showing mood name
- Animated entrance

### 3. Updated Components
**File**: `frontend/src/components/ChatContainer.jsx`
- Integrated mood detection into message display
- Shows emoji beside message text
- Animated mood emoji with bounce effect

### 4. CSS Animations
**File**: `frontend/src/index.css`
- Bounce animation for mood emojis
- Hover effects
- Drop shadow for better visibility

## 🎯 How It Works

### Detection Algorithm:
1. **Keyword Matching**: Scans message for emotion keywords
2. **Scoring System**: Assigns scores based on keyword matches
3. **Confidence Rating**: Returns mood with highest confidence
4. **Smart Detection**: Longer/specific keywords get higher weight

### Example Detection:

```javascript
// Input: "I'm so tired today"
// Output: { mood: "tired", emoji: "😴", confidence: 3 }

// Input: "Happy birthday! So excited to celebrate!"
// Output: { mood: "celebration", emoji: "🎊", confidence: 5 }

// Input: "Thanks so much for your help!"
// Output: { mood: "grateful", emoji: "🙏", confidence: 4 }
```

## 🎨 Visual Features

### Animation:
- Mood emojis bounce in when message loads
- Smooth rotation and scale effects
- Hover to enlarge (1.3x scale)

### Styling:
- Drop shadow for depth
- Positioned beside message text
- Responsive sizing (2xl text size)
- Tooltip showing detected mood on hover

## 💡 Usage Examples

### In Chat Messages:

**User Types**: "I'm so happy to see you!"
**Display**: "I'm so happy to see you!" 😊

**User Types**: "I'm exhausted from work today"
**Display**: "I'm exhausted from work today" 😴

**User Types**: "OMG! I can't believe this happened!"
**Display**: "OMG! I can't believe this happened!" 😲

**User Types**: "Thanks for your help, really appreciate it!"
**Display**: "Thanks for your help, really appreciate it!" 🙏

## 🔧 Configuration

### Customizing Moods:
Edit `frontend/src/lib/moodDetection.js` to:
- Add new mood categories
- Change emojis
- Add more keywords
- Adjust confidence thresholds

### Example - Adding New Mood:
```javascript
cool: {
  emoji: "😎",
  keywords: [
    "cool", "awesome", "chill", "relaxed", "smooth"
  ],
}
```

## 🎮 Testing the Feature

### Test Messages:

1. **Happy**: Type "I'm so happy and excited!"
   - Should show: 😊 or 🎉

2. **Sad**: Type "I'm feeling really sad today"
   - Should show: 😢

3. **Tired**: Type "I'm so tired, need sleep"
   - Should show: 😴

4. **Grateful**: Type "Thank you so much!"
   - Should show: 🙏

5. **Laughing**: Type "Haha that's hilarious!"
   - Should show: 🤣

6. **Multiple Emotions**: Type "I'm happy but tired"
   - Shows strongest emotion (higher confidence)

## 🚀 Performance

- **Client-side**: No server processing needed
- **Fast**: Instant mood detection
- **Lightweight**: Keyword-based algorithm
- **No API calls**: Works offline

## 📊 Confidence Scoring

The system calculates confidence based on:
- Number of matching keywords
- Keyword specificity (longer = more weight)
- Returns mood with highest score

**Example Scoring**:
```
"I'm so tired and exhausted" 
- tired: score 3 (2 keywords)
- Shows: 😴

"Happy birthday! Let's celebrate!"
- celebration: score 5 (2 specific keywords)
- Shows: 🎊
```

## 🎨 Future Enhancements

Potential additions:
- [ ] Mood statistics/analytics
- [ ] Filter messages by mood
- [ ] Custom mood categories
- [ ] ML-based sentiment analysis
- [ ] Mood history tracking
- [ ] Group mood trends
- [ ] Emoji reactions based on mood
- [ ] Mood-based message themes

## ⚙️ Disabling Feature

To disable mood detection, remove from `ChatContainer.jsx`:
```javascript
// Remove this import
import { getMoodEmoji } from "../lib/moodDetection";

// Remove this section
{!message.isDeleted && getMoodEmoji(message.text) && (
  <span className="mood-emoji">
    {getMoodEmoji(message.text)}
  </span>
)}
```

## 🐛 Troubleshooting

**Emojis not showing?**
- Clear browser cache
- Refresh the page
- Check browser console for errors

**Wrong mood detected?**
- Add more specific keywords to the mood pattern
- Adjust keyword weights in detection algorithm

**Animation not working?**
- Verify CSS is loaded
- Check for conflicting styles

---

## 📝 Complete Example

**User Message**: "I'm so tired today, but happy it's Friday! Can't wait for the weekend!"

**Mood Detection Process**:
1. Scans for keywords
2. Finds: "tired" (😴 score: 2), "happy" (😊 score: 1), "can't wait" (🎉 score: 2)
3. Multiple moods detected - picks first highest score
4. **Displays**: Message + 😴 (or 🎉 depending on keyword order)

**Result in Chat**:
```
[User Avatar] [Username]
"I'm so tired today, but happy it's Friday! Can't wait for the weekend!" 😴
```

---

## 🎉 Enjoy the Feature!

The mood detection adds personality and visual interest to your chat messages, making conversations more expressive and engaging!
