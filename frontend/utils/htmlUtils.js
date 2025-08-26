// Utility function to strip HTML tags
export const stripHtml = (html) => {
    if (typeof window === 'undefined') {
      // Server-side rendering
      return html.replace(/<[^>]*>/g, '').slice(0, 120) + '...';
    }
    
    // Client-side rendering
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  
  // Utility function to truncate text
  export const truncateText = (text, length = 120) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  };
  
  // Combined function for HTML stripping and truncation
  export const getPlainTextPreview = (html, length = 120) => {
    const plainText = stripHtml(html);
    return truncateText(plainText, length);
  };