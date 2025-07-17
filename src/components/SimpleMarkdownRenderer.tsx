import React from 'react';
import { Copy } from 'lucide-react';

interface SimpleMarkdownRendererProps {
  content: string;
}

// Custom code block component
const CodeBlock = ({ code, lang }: { code: string; lang?: string }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="relative my-4 rounded-lg overflow-x-auto p-4 font-mono border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      <button
        className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-xs shadow hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        onClick={handleCopy}
        title="Copy code"
      >
        <Copy className="w-4 h-4" />
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
      {lang && <div className="absolute bottom-2 right-2 text-xs text-gray-400">{lang}</div>}
    </div>
  );
};

// Parse markdown content into tokens
const parseMarkdown = (content: string) => {
  const tokens: Array<{ type: string; content: string; lang?: string }> = [];
  let currentIndex = 0;
  
  // Regex patterns
  const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
  const boldRegex = /\*\*(.*?)\*\*/g;
  const italicRegex = /\*(.*?)\*/g;
  const inlineCodeRegex = /`([^`]+)`/g;
  
  // Find code blocks first (they have priority)
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > currentIndex) {
      const textBefore = content.slice(currentIndex, match.index);
      if (textBefore.trim()) {
        tokens.push({ type: 'text', content: textBefore });
      }
    }
    
    // Add code block
    tokens.push({ 
      type: 'code', 
      content: match[2], 
      lang: match[1] || undefined 
    });
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (currentIndex < content.length) {
    const remainingText = content.slice(currentIndex);
    if (remainingText.trim()) {
      tokens.push({ type: 'text', content: remainingText });
    }
  }
  
  // Process text tokens for inline formatting
  const processedTokens: Array<{ type: string; content: string; lang?: string }> = [];
  
  tokens.forEach(token => {
    if (token.type === 'code') {
      processedTokens.push(token);
    } else {
      // Process inline formatting in text
      let text = token.content;
      let lastIndex = 0;
      const textTokens: Array<{ type: string; content: string }> = [];
      
      // Find all inline formatting
      const allMatches: Array<{ type: string; match: RegExpMatchArray; index: number }> = [];
      
      // Bold matches
      let boldMatch;
      while ((boldMatch = boldRegex.exec(text)) !== null) {
        allMatches.push({ type: 'bold', match: boldMatch, index: boldMatch.index });
      }
      
      // Italic matches
      let italicMatch;
      while ((italicMatch = italicRegex.exec(text)) !== null) {
        allMatches.push({ type: 'italic', match: italicMatch, index: italicMatch.index });
      }
      
      // Inline code matches
      let inlineCodeMatch;
      while ((inlineCodeMatch = inlineCodeRegex.exec(text)) !== null) {
        allMatches.push({ type: 'inlineCode', match: inlineCodeMatch, index: inlineCodeMatch.index });
      }
      
      // Sort matches by position
      allMatches.sort((a, b) => a.index - b.index);
      
      // Process matches
      allMatches.forEach(({ type, match, index }) => {
        // Add text before match
        if (index > lastIndex) {
          const textBefore = text.slice(lastIndex, index);
          if (textBefore) {
            textTokens.push({ type: 'text', content: textBefore });
          }
        }
        
        // Add formatted content
        if (type === 'bold') {
          textTokens.push({ type: 'bold', content: match[1] });
        } else if (type === 'italic') {
          textTokens.push({ type: 'italic', content: match[1] });
        } else if (type === 'inlineCode') {
          textTokens.push({ type: 'inlineCode', content: match[1] });
        }
        
        lastIndex = index + match[0].length;
      });
      
      // Add remaining text
      if (lastIndex < text.length) {
        const remainingText = text.slice(lastIndex);
        if (remainingText) {
          textTokens.push({ type: 'text', content: remainingText });
        }
      }
      
      // If no formatting found, add as plain text
      if (textTokens.length === 0) {
        textTokens.push({ type: 'text', content: text });
      }
      
      processedTokens.push(...textTokens);
    }
  });
  
  return processedTokens;
};

const SimpleMarkdownRenderer = ({ content }: SimpleMarkdownRendererProps) => {
  const tokens = parseMarkdown(content);
  
  return (
    <div className="w-full">
      {tokens.map((token, index) => {
        switch (token.type) {
          case 'code':
            return <CodeBlock key={index} code={token.content} lang={token.lang} />;
          case 'bold':
            return <strong key={index} className="font-bold text-foreground">{token.content}</strong>;
          case 'italic':
            return <em key={index} className="italic text-foreground">{token.content}</em>;
          case 'inlineCode':
            return <code key={index} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{token.content}</code>;
          case 'text':
            return <span key={index} className="whitespace-pre-wrap break-words">{token.content}</span>;
          default:
            return <span key={index}>{token.content}</span>;
        }
      })}
    </div>
  );
};

export default SimpleMarkdownRenderer; 