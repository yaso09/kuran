"use client";

import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Heart } from "lucide-react";

interface CommentItemProps {
    comment: any;
    verseKey?: string;
    onReply: (id: string, name: string) => void;
    onDelete: (id: string) => void;
    onLike: (id: string) => void;
    likedComments: Set<string>;
    currentUserId?: string;
    depth?: number;
}

const CommentItem = ({
    comment,
    verseKey,
    onReply,
    onDelete,
    onLike,
    likedComments,
    currentUserId,
    depth = 0
}: CommentItemProps) => {
    return (
        <div className={`flex gap-4 ${depth > 0 ? 'ml-8 sm:ml-12 mt-4' : 'mt-6'}`}>
            <div className={`shrink-0 ${depth > 0 ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-slate-800 border border-slate-700 overflow-hidden`}>
                {comment.userImage ? (
                    <img src={comment.userImage} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-500 font-bold text-xs uppercase">
                        {comment.userName?.[0]}
                    </div>
                )}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">{comment.userName}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(comment.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                    </span>
                </div>
                <div className="bg-[#1a1c23] p-3 rounded-2xl rounded-tl-none border border-slate-800 text-sm text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {comment.text}
                    </ReactMarkdown>
                </div>
                <div className="flex items-center gap-4 px-1">
                    <button
                        onClick={() => onReply(comment.id, comment.userName)}
                        className="text-[10px] font-bold text-slate-500 hover:text-amber-500 uppercase tracking-wider transition-colors"
                    >
                        Yanıtla
                    </button>
                    <button
                        onClick={() => onLike(comment.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${likedComments.has(comment.id) ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                    >
                        <Heart size={10} className={likedComments.has(comment.id) ? "fill-red-500" : ""} />
                        <span>{comment.likes || 0} Beğeni</span>
                    </button>
                    {currentUserId === comment.userId && (
                        <button
                            onClick={() => { if (confirm('Silmek istediğine emin misin?')) onDelete(comment.id); }}
                            className="text-[10px] font-bold text-slate-600 hover:text-red-500 uppercase tracking-wider transition-colors"
                        >
                            Sil
                        </button>
                    )}
                </div>

                {/* Render Replies Recursive */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-4">
                        {comment.replies.map((reply: any) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                verseKey={verseKey}
                                onReply={onReply}
                                onDelete={onDelete}
                                onLike={onLike}
                                likedComments={likedComments}
                                currentUserId={currentUserId}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
