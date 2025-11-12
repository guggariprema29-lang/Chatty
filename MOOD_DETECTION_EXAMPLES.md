# 🎭 Mood Detection - Live Examples

## How Messages Will Look:

### 😊 Happy Messages
**Input**: "I'm so happy to see you!"  
**Display**: `I'm so happy to see you! 😊`

**Input**: "This is amazing! Great work!"  
**Display**: `This is amazing! Great work! 😊`

---

### 😢 Sad Messages
**Input**: "I'm feeling really sad today"  
**Display**: `I'm feeling really sad today 😢`

**Input**: "So disappointed about this"  
**Display**: `So disappointed about this 😢`

---

### 😴 Tired Messages
**Input**: "I'm so tired today"  
**Display**: `I'm so tired today 😴`

**Input**: "Exhausted from all the work"  
**Display**: `Exhausted from all the work 😴`

---

### 🎉 Excited Messages
**Input**: "Can't wait for the party!"  
**Display**: `Can't wait for the party! 🎉`

**Input**: "So excited about this!"  
**Display**: `So excited about this! 🎉`

---

### 🙏 Grateful Messages
**Input**: "Thanks so much for your help!"  
**Display**: `Thanks so much for your help! 🙏`

**Input**: "Really appreciate it!"  
**Display**: `Really appreciate it! 🙏`

---

### 🤣 Laughing Messages
**Input**: "Haha that's hilarious!"  
**Display**: `Haha that's hilarious! 🤣`

**Input**: "LOL I'm dying"  
**Display**: `LOL I'm dying 🤣`

---

### 😠 Angry Messages
**Input**: "This is so annoying!"  
**Display**: `This is so annoying! 😠`

**Input**: "I'm so mad right now"  
**Display**: `I'm so mad right now 😠`

---

### ❤️ Love Messages
**Input**: "I love this so much!"  
**Display**: `I love this so much! ❤️`

**Input**: "You're the best!"  
**Display**: `You're the best! ❤️`

---

### 😲 Surprised Messages
**Input**: "OMG! I can't believe it!"  
**Display**: `OMG! I can't believe it! 😲`

**Input**: "No way! Really?!"  
**Display**: `No way! Really?! 😲`

---

### 🤔 Confused Messages
**Input**: "I don't understand this"  
**Display**: `I don't understand this 🤔`

**Input**: "Hmm, I'm confused"  
**Display**: `Hmm, I'm confused 🤔`

---

### 😰 Worried Messages
**Input**: "I'm really worried about this"  
**Display**: `I'm really worried about this 😰`

**Input**: "Feeling anxious"  
**Display**: `Feeling anxious 😰`

---

### 🎊 Celebration Messages
**Input**: "Happy birthday! 🎂"  
**Display**: `Happy birthday! 🎂 🎊`

**Input**: "Congratulations on your promotion!"  
**Display**: `Congratulations on your promotion! 🎊`

---

### 😎 Cool Messages
**Input**: "That sounds cool!"  
**Display**: `That sounds cool! 😎`

**Input**: "No problem, I got this"  
**Display**: `No problem, I got this 😎`

---

### 🤒 Sick Messages
**Input**: "Feeling unwell today"  
**Display**: `Feeling unwell today 🤒`

**Input**: "I have a headache and fever"  
**Display**: `I have a headache and fever 🤒`

---

### 💭 Thinking Messages
**Input**: "Let me think about it"  
**Display**: `Let me think about it 💭`

**Input**: "Hmm, maybe we should..."  
**Display**: `Hmm, maybe we should... 💭`

---

## Visual Example in Chat:

```
┌─────────────────────────────────────────┐
│  [Avatar] John                   12:30  │
│  ┌───────────────────────────────────┐  │
│  │ I'm so tired today 😴            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                   12:31  You [Avatar]   │
│  ┌───────────────────────────────────┐  │
│  │         Haha that's funny! 🤣     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  [Avatar] Sarah                  12:32  │
│  ┌───────────────────────────────────┐  │
│  │ Thanks for helping me! 🙏        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Animation Details:

When a message appears, the mood emoji:
1. **Bounces in** with a slight rotation
2. **Scales up** from 1x to 1.3x
3. **Rotates** slightly left and right
4. **Settles** back to normal size

**On Hover**:
- Emoji enlarges to 1.3x scale
- Tooltip shows detected mood name
- Smooth transition effect

---

## Multi-Mood Messages:

When a message contains multiple emotions, the **strongest** one is shown:

**Input**: "I'm happy but also tired"
- Detects: happy (score: 1), tired (score: 1)
- **Shows**: First detected or highest scored 😊 or 😴

**Input**: "Thank you so much! Really appreciate your help!"
- Detects: grateful (score: 4 - multiple keywords)
- **Shows**: 🙏

---

## Testing Instructions:

### Test in Your Chat:

1. **Send**: "I'm so tired today"
   - ✅ Should show 😴

2. **Send**: "Haha that's hilarious!"
   - ✅ Should show 🤣

3. **Send**: "Thanks for your help!"
   - ✅ Should show 🙏

4. **Send**: "I'm so excited about this!"
   - ✅ Should show 🎉

5. **Send**: "This is annoying"
   - ✅ Should show 😠

### What to Look For:

- Emoji appears on the **right side** of message text
- Emoji has a **bounce animation** when message loads
- Emoji **enlarges on hover**
- **Tooltip** shows mood name on hover
- Works for **both sent and received** messages
- **No emoji** shown for neutral messages like "Hello", "OK", etc.

---

## Advanced Examples:

### Complex Sentences:
**Input**: "I'm exhausted from work but happy it's Friday!"
- Detects multiple moods
- Shows primary emotion: 😴 (tired) or 😊 (happy)

### With Emojis Already:
**Input**: "Love this! 😍"
- Detects: love
- Shows: ❤️ (in addition to user's emoji)

### Questions:
**Input**: "Are you feeling okay?"
- May detect: worried 😰
- Or no mood if too neutral

### Short Messages:
**Input**: "Thanks!"
- Detects: grateful
- Shows: 🙏

**Input**: "LOL"
- Detects: laughing
- Shows: 🤣

---

## Customization:

### Want Different Emojis?
Edit `frontend/src/lib/moodDetection.js`:

```javascript
happy: {
  emoji: "😃", // Change this to any emoji
  keywords: [...] 
}
```

### Want to Add New Moods?
Add to `moodPatterns` object:

```javascript
motivated: {
  emoji: "💪",
  keywords: ["motivated", "determined", "let's go", "focused"]
}
```

---

Enjoy your emotionally intelligent chat! 🎭✨
