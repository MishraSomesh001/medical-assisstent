'use client';

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export default function MessageContent({ content, isUser }: MessageContentProps) {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  // Format AI responses with better styling
  const formatAIResponse = (text: string) => {
    // Clean up the text first - remove extra spaces and normalize line breaks
    const cleanText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
      .trim();
    
    // Split by double newlines to create paragraphs
    const paragraphs = cleanText.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      if (!trimmedParagraph) return null;
      
      // Handle numbered lists (1., 2., etc.)
      if (trimmedParagraph.match(/^\d+\./)) {
        const items = trimmedParagraph.split(/(?=\d+\.)/);
        return (
          <ol key={index} className="space-y-3 my-4">
            {items.filter(item => item.trim()).map((item, itemIndex) => {
              const match = item.match(/^(\d+)\.\s*(.*)$/);
              if (!match) return null;
              const [, number, cleanItem] = match;
              if (!cleanItem.trim()) return null;
              return (
                <li key={itemIndex} className="text-gray-800 leading-relaxed flex items-start">
                  <span className="text-blue-600 font-semibold mr-3 mt-0 flex-shrink-0">{number}.</span>
                  <span>{formatInlineText(cleanItem.trim())}</span>
                </li>
              );
            })}
          </ol>
        );
      }
      
      // Handle bullet points (•, -, *)
      if (trimmedParagraph.match(/^[•\-\*]/)) {
        const items = trimmedParagraph.split(/(?=[•\-\*])/);
        return (
          <ul key={index} className="space-y-2 my-4">
            {items.filter(item => item.trim()).map((item, itemIndex) => {
              const cleanItem = item.replace(/^[���\-\*]\s*/, '').trim();
              if (!cleanItem) return null;
              return (
                <li key={itemIndex} className="text-gray-800 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-3 mt-1 flex-shrink-0">•</span>
                  <span>{formatInlineText(cleanItem)}</span>
                </li>
              );
            })}
          </ul>
        );
      }
      
      // Handle headings (text with ** around it at start of line)
      if (trimmedParagraph.match(/^\*\*.*\*\*$/)) {
        const headingText = trimmedParagraph.replace(/\*\*/g, '').trim();
        return (
          <h3 key={index} className="font-semibold text-gray-900 text-lg mt-6 mb-3 flex items-center border-b border-gray-200 pb-2">
            {formatInlineText(headingText)}
          </h3>
        );
      }
      
      // Handle sub-headings (bold text at start of line)
      if (trimmedParagraph.match(/^\*\*[^*]+\*\*/)) {
        return (
          <h4 key={index} className="font-medium text-gray-900 text-base mt-4 mb-2">
            {formatInlineText(trimmedParagraph)}
          </h4>
        );
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="text-gray-800 leading-relaxed my-3">
          {formatInlineText(trimmedParagraph)}
        </p>
      );
    }).filter(Boolean); // Remove null elements
  };

  const formatInlineText = (text: string) => {
    // Clean up the text first
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Split text by bold markers and emojis - improved regex
    const parts = cleanText.split(/(\*\*[^*]+\*\*|[\u{1F300}-\u{1F9FF}])/u);
    
    return parts.map((part, index) => {
      if (!part) return null;
      
      // Handle bold text
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.replace(/\*\*/g, '').trim();
        if (!boldText) return null;
        return (
          <strong key={index} className="font-semibold text-gray-900 bg-blue-50 px-1 py-0.5 rounded">
            {boldText}
          </strong>
        );
      }
      
      // Handle emojis - give them some spacing
      if (/[\u{1F300}-\u{1F9FF}]/u.test(part)) {
        return (
          <span key={index} className="inline-block mx-1 text-lg">
            {part}
          </span>
        );
      }
      
      // Handle regular text - clean up any remaining formatting issues
      const cleanPart = part
        .replace(/\s+/g, ' ') // Multiple spaces to single space
        .replace(/\n/g, ' ') // Line breaks to spaces
        .trim();
      
      return cleanPart || null;
    }).filter(Boolean);
  };

  return (
    <div className="ai-response">
      {formatAIResponse(content)}
    </div>
  );
}