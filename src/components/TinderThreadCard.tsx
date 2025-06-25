import React from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import type { EmailThread } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export interface TinderThreadCardProps {
  thread: EmailThread;
  reply?: string;
  isEditing?: boolean;
  editedReply?: string;
  onAction: (action: 'approve' | 'reject' | 'edit' | 'save_kb') => void;
  onChangeReply?: (text: string) => void;
}

// Basic rigid drag / swipe threshold
const SWIPE_THRESHOLD = 120;

export default function TinderThreadCard({ thread, reply, isEditing = false, editedReply = '', onAction, onChangeReply }: TinderThreadCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  // Overlay opacities
  const approveOpacity = useTransform(x, [50, SWIPE_THRESHOLD], [0, 1]);
  const rejectOpacity = useTransform(x, [-SWIPE_THRESHOLD, -50], [1, 0]);
  const editOpacity = useTransform(y, [SWIPE_THRESHOLD, SWIPE_THRESHOLD + 40], [1, 0]);
  const saveOpacity = useTransform(y, [-SWIPE_THRESHOLD - 40, -SWIPE_THRESHOLD], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    const { offset } = info;
    if (offset.x > SWIPE_THRESHOLD) {
      // Approve — swipe right
      onAction('approve');
    } else if (offset.x < -SWIPE_THRESHOLD) {
      // Reject — swipe left
      onAction('reject');
    } else if (offset.y > SWIPE_THRESHOLD) {
      // Edit — swipe down
      onAction('edit');
    } else if (offset.y < -SWIPE_THRESHOLD) {
      // Save to KB — swipe up
      onAction('save_kb');
    }
  };

  // Simplified content of the card
  return (
    <AnimatePresence>
      {thread && (
        <motion.div
          key={thread.id}
          className="relative w-full max-w-xl mx-auto cursor-grab active:cursor-grabbing"
          drag
          dragElastic={0.2}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          style={{ x, y, rotate }}
          onDragEnd={handleDragEnd}
        >
          {/* Overlays */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: approveOpacity }}
          >
            <span className="text-4xl font-bold text-green-600">Approve</span>
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: rejectOpacity }}
          >
            <span className="text-4xl font-bold text-red-600">Reject</span>
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-start justify-center pt-6 pointer-events-none"
            style={{ opacity: saveOpacity }}
          >
            <span className="text-3xl font-semibold text-blue-600">Save to KB</span>
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none"
            style={{ opacity: editOpacity }}
          >
            <span className="text-3xl font-semibold text-amber-600">Edit</span>
          </motion.div>

          {/* Card content */}
          <Card className="p-6 h-[520px] flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="mb-3">
              <h2 className="text-xl font-bold text-gray-900 line-clamp-2 mb-1">{thread.subject}</h2>
              <p className="text-xs text-gray-500">
                {thread.participants.slice(0, 3).join(', ')}
                {thread.participants.length > 3 && ` +${thread.participants.length - 3}`}
              </p>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-4">
              {thread.summary && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 text-sm">AI Summary</h4>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{thread.summary}</p>
                </div>
              )}

              {isEditing ? (
                <textarea
                  value={editedReply}
                  onChange={(e)=> onChangeReply && onChangeReply(e.target.value)}
                  className="w-full border rounded p-2 text-sm h-40"
                />
              ) : reply && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 text-sm">AI Reply</h4>
                  <p className="text-sm whitespace-pre-wrap text-gray-800">{reply}</p>
                </div>
              )}
            </div>

            {/* Footer badges */}
            <div className="flex gap-2 items-center">
              {thread.importance && (
                <Badge variant="outline" className="uppercase text-[10px] tracking-wide">
                  {thread.importance}
                </Badge>
              )}
              {thread.status && (
                <Badge className="text-[10px]">{thread.status}</Badge>
              )}
              {reply && <Badge className="bg-amber-100 text-amber-800 text-[10px]">Draft</Badge>}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 