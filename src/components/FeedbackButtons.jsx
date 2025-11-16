import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const FeedbackButtons = ({ likeCount, dislikeCount, userVote, onFeedback }) => {
  return (
    <div className="flex items-center gap-3 mt-2">
      <button 
        onClick={() => onFeedback('like')} 
        className={twMerge(
          "flex items-center gap-1.5 p-1 rounded-md hover:bg-light-surface dark:hover:bg-dark-surface",
          userVote === 'like' && 'text-light-accent dark:text-dark-accent bg-light-accent/10 dark:bg-dark-accent/20'
        )} 
        aria-label="Like response"
      >
        <ThumbsUp className="h-4 w-4" />
        {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
      </button>
      <button 
        onClick={() => onFeedback('dislike')} 
        className={twMerge(
          "flex items-center gap-1.5 p-1 rounded-md hover:bg-light-surface dark:hover:bg-dark-surface",
          userVote === 'dislike' && 'text-red-500 bg-red-500/10'
        )} 
        aria-label="Dislike response"
      >
        <ThumbsDown className="h-4 w-4" />
        {dislikeCount > 0 && <span className="text-xs">{dislikeCount}</span>}
      </button>
    </div>
  );
};

export default FeedbackButtons;
