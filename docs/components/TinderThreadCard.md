# TinderThreadCard Component Documentation

## Overview
The `TinderThreadCard` component is a sophisticated swipe-based interface for email thread management. It provides a Tinder-like experience for processing email threads with AI-generated replies, allowing users to approve, reject, edit, or save threads to the knowledge base through intuitive gestures.

## Features

### Core Functionality
- **Swipe Gestures**: Touch and mouse-based swiping in 4 directions
- **AI Integration**: Displays AI-generated email summaries and replies
- **Status Management**: Tracks thread processing states (pending, approved, rejected, sent)
- **Real-time Editing**: In-place editing of AI-generated replies
- **Knowledge Base Integration**: Save extracted entities to knowledge base

### Swipe Actions
- **Swipe Right (→)**: Approve and send the AI-generated reply
- **Swipe Left (←)**: Reject and archive the thread
- **Swipe Up (↑)**: Save thread information to knowledge base
- **Swipe Down (↓)**: Enter edit mode for the AI reply

### Advanced Features
- **Auto-approval with KB**: Option to automatically save to knowledge base when approving
- **Reject with KB**: Option to save to knowledge base when rejecting
- **AI Reply Improvement**: Chat-based interface to improve replies using AI
- **Visual Feedback**: Progressive swipe indicators and animations
- **Thread Expansion**: Detailed view of full email thread
- **Responsive Design**: Works on desktop and mobile devices

## Props Interface

```typescript
export interface TinderThreadCardProps {
  thread: EmailThread;           // The email thread to display
  reply?: string;               // AI-generated reply text
  isEditing?: boolean;          // Whether in edit mode
  editedReply?: string;         // User-edited reply text
  onAction: (action: ActionType) => void;  // Callback for user actions
  onChangeReply?: (text: string) => void;  // Callback for reply changes
  showExpand: boolean;          // Whether to show expanded thread view
  setShowExpand: (show: boolean) => void;
  showImprove: boolean;         // Whether to show AI improvement interface
  setShowImprove: (show: boolean) => void;
  jumpTarget: 'summary' | 'reply';  // Which section to highlight
  setJumpTarget: (target: 'summary' | 'reply') => void;
  messages: Email[];            // Email messages in the thread
}
```

## Action Types

```typescript
type ActionType = 
  | 'approve'                    // Send the reply as-is
  | 'reject'                     // Archive without sending
  | 'edit'                       // Enter/exit edit mode
  | 'save_kb'                    // Save to knowledge base only
  | 'cancel_edit'                // Cancel editing
  | 'auto_approve_with_kb'       // Approve + save to KB
  | 'reject_archive'             // Reject and archive
  | 'reject_with_kb'             // Reject + save to KB
  | 'generate_new';              // Generate a new AI reply
```

## Component Structure

### 1. Thread Summary Section
- AI-generated summary of the email thread
- Importance indicator (urgent, high, medium, low)
- Participant information and thread metadata
- Collapsible/expandable interface

### 2. AI Reply Section
- Generated reply text with formatting
- Edit mode with textarea for modifications
- AI improvement chat interface
- Action buttons (approve, reject, edit, etc.)

### 3. Swipe Detection System
- Touch and mouse event handling
- Progress indicators during swipe
- Threshold-based action triggering
- Visual feedback with color coding

### 4. Animation System
- Smooth transitions between states
- Swipe progress animations
- State change animations
- Loading and processing indicators

## State Management

### Local State
- `swipeDir`: Current swipe direction (left, right, up, down)
- `swipeProgress`: Percentage of swipe completion (0-100)
- `locked`: Prevents multiple actions during processing
- `editMode`: Whether in reply editing mode
- `chatInput`: User input for AI improvement suggestions
- `streamingReply`: AI-improved reply being generated
- `showRejectDialog`: Confirmation dialog for reject actions

### Swipe Threshold
```typescript
const SWIPE_THRESHOLD = 0.33; // 33% of card width/height
```

## Usage Examples

### Basic Usage
```tsx
<TinderThreadCard
  thread={currentThread}
  reply={aiGeneratedReply}
  onAction={handleAction}
  showExpand={false}
  setShowExpand={setShowExpand}
  showImprove={false}
  setShowImprove={setShowImprove}
  jumpTarget="summary"
  setJumpTarget={setJumpTarget}
  messages={threadMessages}
/>
```

### With Editing
```tsx
<TinderThreadCard
  thread={currentThread}
  reply={aiGeneratedReply}
  isEditing={true}
  editedReply={userEditedText}
  onAction={handleAction}
  onChangeReply={handleReplyChange}
  // ... other props
/>
```

## Action Handling

```typescript
const handleAction = (action: ActionType) => {
  switch (action) {
    case 'approve':
      // Send reply and mark thread as approved
      break;
    case 'reject':
      // Archive thread without sending
      break;
    case 'save_kb':
      // Extract entities and save to knowledge base
      break;
    // ... handle other actions
  }
};
```

## Styling and Animations

### CSS Classes
- `.swipe-card`: Main card container
- `.swipe-progress`: Progress indicator overlay
- `.swipe-left`, `.swipe-right`, etc.: Direction-specific styling

### Animation Library
Uses Framer Motion for smooth animations:
- Card positioning and rotation during swipes
- Fade in/out transitions
- Spring-based animations for natural feel

## Accessibility

### Keyboard Navigation
- Tab navigation through action buttons
- Enter/Space for button activation
- Escape to cancel operations

### Screen Reader Support
- ARIA labels for all interactive elements
- Status announcements for state changes
- Descriptive button labels

### Focus Management
- Focus trapped within active elements
- Visual focus indicators
- Logical tab order

## Performance Considerations

### Optimization Techniques
- Debounced swipe detection to prevent excessive calculations
- Lazy loading of thread messages
- Memoized calculations for progress indicators
- Efficient event listener management

### Memory Management
- Cleanup of event listeners on unmount
- Proper state reset between threads
- Garbage collection of animation frames

## Error Handling

### Network Errors
- Graceful degradation when AI services fail
- Retry mechanisms for failed operations
- User feedback for error states

### Validation
- Input validation for edited replies
- Swipe gesture validation
- State consistency checks

## Integration Points

### AI Services
- Reply generation via OpenAI API
- Reply improvement through streaming
- Entity extraction for knowledge base

### Storage Systems
- Thread state persistence
- Draft reply storage
- Knowledge base updates

### Analytics
- Swipe gesture tracking
- Performance metrics
- User interaction patterns

## Common Issues and Solutions

### Swipe Not Detecting
- Check touch event support
- Verify threshold values
- Ensure proper event propagation

### Animation Performance
- Reduce animation complexity on low-end devices
- Use transform properties for better performance
- Implement frame rate monitoring

### State Synchronization
- Use callback pattern for state updates
- Implement proper loading states
- Handle race conditions in async operations

## Future Enhancements

### Planned Features
- Gesture customization
- Bulk processing mode
- Advanced filtering options
- Collaborative review features

### Technical Improvements
- WebGL-based animations
- Service worker integration
- Advanced caching strategies
- Real-time collaboration support

---

This component represents a complex interaction pattern that combines modern UX principles with AI-powered functionality, providing an efficient and engaging way to process email threads. 