import { useState } from "react";

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
}

const Comments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: comments.length + 1,
      author: "You",
      content: newComment,
      timestamp: new Date(),
      resolved: false,
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  const handleResolveComment = (id: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === id
          ? { ...comment, resolved: !comment.resolved }
          : comment
      )
    );
  };

  const handleDeleteComment = (id: number) => {
    setComments(comments.filter((comment) => comment.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Comments</h3>
        <p className="text-sm text-gray-400 mt-1">
          {comments.length === 0
            ? "No comments yet. Add your first comment below."
            : `${comments.length} comment${comments.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Comments List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <p className="text-sm">No comments yet</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-[#2b2b2b] p-3 rounded-lg border ${
                comment.resolved
                  ? "border-green-600 opacity-60"
                  : "border-gray-700"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {comment.author}
                  </span>
                  {comment.resolved && (
                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                      Resolved
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleResolveComment(comment.id)}
                    className="text-gray-400 hover:text-green-500 transition-colors"
                    title={comment.resolved ? "Unresolve" : "Resolve"}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-300">{comment.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {comment.timestamp.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input - Fixed at Bottom */}
      <div className="p-4 bg-[#252526] border-t border-gray-700">
        <div className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (Press Enter to send, Shift+Enter for new line)"
            className="w-full bg-[#3c3c3c] text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 text-sm placeholder-gray-500 resize-none"
            rows={3}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comments;
