# AI Toast Feedback System

## Overview
The AI trading assistant now has the ability to provide user feedback through toast notifications. This enhances the user experience by providing immediate, actionable feedback for important events.

## How It Works

### 1. AI Response Format
The AI can include special toast markers in its responses using the following format:
```
[TOAST_TYPE:Title:Message]
```

### 2. Supported Toast Types
- `[TOAST_SUCCESS:Title:Message]` - Success notifications (green)
- `[TOAST_ERROR:Title:Message]` - Error notifications (red)
- `[TOAST_WARNING:Title:Message]` - Warning notifications (orange)
- `[TOAST_INFO:Title:Message]` - Information notifications (blue)

### 3. Examples

#### Success Toast
```
[TOAST_SUCCESS:Code Ready:Your Pine Script code is ready to use in TradingView.]
```

#### Error Toast
```
[TOAST_ERROR:Code Issue:Please check the syntax on line 15.]
```

#### Warning Toast
```
[TOAST_WARNING:Test Required:Always backtest your strategy before live trading.]
```

#### Info Toast
```
[TOAST_INFO:Optimization Tip:Consider adding a stop-loss for better risk management.]
```

## Implementation Details

### Frontend Processing
1. **Parsing**: The `parseToastMessages()` function extracts toast markers from AI responses
2. **Cleaning**: The `removeToastMarkers()` function removes toast markers from displayed content
3. **Display**: Toast messages are shown using the existing toast system

### AI System Prompt
The AI has been instructed to use toast notifications for:
- Code generation success
- Error detection and reporting
- Optimization suggestions
- Risk warnings
- Strategy insights
- Alternative suggestions

## Usage Examples

### When Code is Generated
The AI will show:
```
[TOAST_SUCCESS:Strategy Generated!:Your Pine Script code is ready to use in TradingView.]
```

### When Errors are Detected
The AI will show:
```
[TOAST_ERROR:Syntax Error:Missing variable declaration on line 8.]
```

### When Suggestions are Made
The AI will show:
```
[TOAST_INFO:Risk Management:Consider adding a 2% stop-loss for better protection.]
```

## Benefits
1. **Immediate Feedback**: Users get instant notifications about important events
2. **Clear Communication**: Toast messages are concise and actionable
3. **Error Prevention**: Warnings help users avoid common mistakes
4. **Enhanced UX**: Makes the AI feel more responsive and helpful

## Technical Notes
- Toast markers are automatically removed from the displayed chat content
- Multiple toasts can be included in a single AI response
- The system gracefully handles cases where no toast markers are present
- Error handling includes specific toast messages for different error types 