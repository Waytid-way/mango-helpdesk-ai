
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - The potentially unsafe HTML string
 * @returns {string} - The sanitized HTML string safe for rendering
 */
export const sanitize = (dirty) => {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
            'code', 'pre', 'h1', 'h2', 'h3', 'blockquote', 'div', 'span',
            'table', 'thead', 'tbody', 'tr', 'td', 'th'
        ],
        ALLOWED_ATTR: ['href', 'target', 'class', 'style', 'rel'],
    });
};
