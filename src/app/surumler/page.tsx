import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { GitCommit, Calendar, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
    title: 'Sürüm Geçmişi | Kuran',
    description: 'Projenin gelişim sürecini ve güncellemeleri takip edin.',
};

interface GitHubCommit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            email: string;
            date: string;
        };
    };
    author: {
        login: string;
        avatar_url: string;
        html_url: string;
    } | null;
    html_url: string;
}

async function getCommits(): Promise<GitHubCommit[]> {
    try {
        // Read repository URL from githubrepo.txt
        const repoPath = path.join(process.cwd(), 'githubrepo.txt');
        const repoUrl = fs.readFileSync(repoPath, 'utf-8').trim();

        // Extract owner and repo from URL (e.g., https://github.com/yaso09/kuran)
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
        if (!match) throw new Error('Invalid GitHub URL');

        const [, owner, repo] = match;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`;

        const res = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                // Add GitHub token if available to increase rate limit
                ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            console.error('GitHub API error:', res.status, res.statusText);
            return [];
        }

        return res.json();
    } catch (error) {
        console.error('Failed to fetch commits:', error);
        return [];
    }
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export default async function SurumlerPage() {
    const commits = await getCommits();

    return (
        <div className="min-h-screen bg-[#0b0c0f]">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                        <GitCommit size={16} className="text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">SÜRÜM GEÇMİŞİ</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Gelişim Süreci
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Projenin her güncellemesini ve iyileştirmesini buradan takip edebilirsiniz.
                    </p>
                </div>

                {/* Commits Timeline */}
                {commits.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500">Commit geçmişi yüklenemedi veya bulunamadı.</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-800" />

                        <div className="space-y-8">
                            {commits.map((commit, index) => {
                                const message = commit.commit.message.split('\n')[0]; // First line only
                                const shortSha = commit.sha.substring(0, 7);

                                return (
                                    <div key={commit.sha} className="relative pl-20">
                                        {/* Timeline Dot */}
                                        <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-emerald-500 border-4 border-[#0b0c0f] z-10" />

                                        {/* Commit Card */}
                                        <div className="bg-[#15171c] rounded-2xl border border-slate-800 p-6 hover:border-emerald-500/30 transition-colors group">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors">
                                                        {message}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} />
                                                            <span>{formatDate(commit.commit.author.date)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <User size={14} />
                                                            <span>{commit.commit.author.name}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Author Avatar */}
                                                {commit.author && (
                                                    <Link
                                                        href={commit.author.html_url}
                                                        target="_blank"
                                                        className="flex-shrink-0"
                                                    >
                                                        <img
                                                            src={commit.author.avatar_url}
                                                            alt={commit.author.login}
                                                            className="w-10 h-10 rounded-full border-2 border-slate-700 hover:border-emerald-500 transition-colors"
                                                        />
                                                    </Link>
                                                )}
                                            </div>

                                            {/* Commit Hash & Link */}
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                                <code className="text-xs text-slate-600 font-mono bg-slate-900/50 px-2 py-1 rounded">
                                                    {shortSha}
                                                </code>
                                                <Link
                                                    href={commit.html_url}
                                                    target="_blank"
                                                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                                                >
                                                    GitHub'da Gör <ExternalLink size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
