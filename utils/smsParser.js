/**
 * SMS Parser for Mongolian Bank Payment Notifications
 * 
 * Parses incoming SMS from Mongolian banks to extract:
 * - Amount (from "X dungeer" or "X төгрөг")
 * - Payment code/reference (from "Utga:" field)
 * - Bank name
 * - Date
 * 
 * Example SMS format:
 * "210*****82 dansand 2,000.00 dungeer orlogiin guilgee hiigdlee. Ognoo: 2026-01-07, Utga: ORD-A7X9 Uldegdel: 183,055.09"
 */

// Bank detection patterns
const BANK_PATTERNS = {
    'Khan Bank': /khan\s*bank|хаан\s*банк|5765|5765\d{4}/i,
    'Golomt Bank': /golomt|голомт/i,
    'TDB': /tdb|худалдаа.*хөгжил|худалдаа\s*хогжлийн/i,
    'XacBank': /xac\s*bank|хас\s*банк/i,
    'State Bank': /төрийн\s*банк|state\s*bank/i,
    'Capitron': /capitron|капитрон/i
};

// Amount extraction patterns (Mongolian format uses comma for thousands)
const AMOUNT_PATTERNS = [
    // "2,000.00 dungeer" or "2000.00 dungeer" - incoming transaction
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*dungeer/i,
    // "2,000.00 төгрөг" format
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*төгрөг/i,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*togrog/i,
    // Generic amount patterns
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*MNT/i,
    // Fallback: any decimal number that looks like currency
    /орлого[:\s]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /amount[:\s]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
];

// Payment code/reference extraction from "Utga:" field
const PAYMENT_CODE_PATTERNS = [
    // "Utga: ORD-A7X9" or "Utga: SOME-TEXT"
    /Utga:\s*([A-Z0-9-]+)/i,
    // "Утга:" in Cyrillic
    /Утга:\s*([A-Z0-9-]+)/i,
    // Reference patterns
    /ref[:\s]*([A-Z0-9-]+)/i,
    /reference[:\s]*([A-Z0-9-]+)/i
];

// Date extraction
const DATE_PATTERNS = [
    /Ognoo:\s*(\d{4}-\d{2}-\d{2})/i,
    /Огноо:\s*(\d{4}-\d{2}-\d{2})/i,
    /(\d{4}[-\/]\d{2}[-\/]\d{2})/,
    /(\d{2}[-\/]\d{2}[-\/]\d{4})/
];

/**
 * Parse a payment SMS message
 * @param {string} message - The SMS message text
 * @param {string} from - The sender phone number or ID
 * @returns {object} Parsed payment information
 */
function parsePaymentSMS(message, from = '') {
    const result = {
        isValid: false,
        isIncoming: false,
        amount: null,
        paymentCode: null,
        bankName: null,
        date: null,
        rawMessage: message,
        from: from
    };

    if (!message || typeof message !== 'string') {
        return result;
    }

    // Clean up the message
    const cleanMessage = message.trim();

    // Check if this is an incoming transaction (орлого/orlog/dungeer)
    // "dungeer" indicates incoming money in Mongolian
    const isIncoming = /dungeer|orlog|орлого|received|credited/i.test(cleanMessage);
    result.isIncoming = isIncoming;

    // If it's an outgoing transaction, we don't want to process it
    if (/zarlaga|зарлага|debit|sent|paid|payment\s*to/i.test(cleanMessage) && !isIncoming) {
        return result;
    }

    // Detect bank
    for (const [bankName, pattern] of Object.entries(BANK_PATTERNS)) {
        if (pattern.test(cleanMessage) || pattern.test(from)) {
            result.bankName = bankName;
            break;
        }
    }

    // Extract amount
    for (const pattern of AMOUNT_PATTERNS) {
        const match = cleanMessage.match(pattern);
        if (match) {
            // Remove commas and parse as float
            const amountStr = match[1].replace(/,/g, '');
            const amount = parseFloat(amountStr);
            if (!isNaN(amount) && amount > 0) {
                result.amount = amount;
                break;
            }
        }
    }

    // Extract payment code from "Utga:" field
    for (const pattern of PAYMENT_CODE_PATTERNS) {
        const match = cleanMessage.match(pattern);
        if (match) {
            result.paymentCode = match[1].toUpperCase().trim();
            break;
        }
    }

    // Extract date
    for (const pattern of DATE_PATTERNS) {
        const match = cleanMessage.match(pattern);
        if (match) {
            result.date = match[1];
            break;
        }
    }

    // Mark as valid if we have at least an amount and it's incoming
    result.isValid = result.isIncoming && result.amount !== null && result.amount > 0;

    return result;
}

/**
 * Generate a unique payment code for an order
 * Format: ORD-XXXX (4 alphanumeric characters)
 * @returns {string} Unique payment code
 */
function generatePaymentCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0,O,1,I
    let code = 'ORD-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

module.exports = { parsePaymentSMS, generatePaymentCode };
