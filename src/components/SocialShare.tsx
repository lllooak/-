import React from 'react';
import { Facebook, Twitter, Linkedin, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
}

export function SocialShare({ url, title, description }: SocialShareProps) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-[#1877f2] hover:bg-[#166fe5]',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'bg-[#1da1f2] hover:bg-[#1a94da]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      color: 'bg-[#0a66c2] hover:bg-[#095196]',
    },
  ];

  return (
    <div className="flex space-x-2">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${link.color} text-white p-2 rounded-full transition-colors`}
          title={`Share on ${link.name}`}
        >
          <link.icon className="h-5 w-5" />
        </a>
      ))}
      <button
        onClick={handleCopyLink}
        className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors"
        title="Copy link"
      >
        <Link2 className="h-5 w-5" />
      </button>
    </div>
  );
}
