/**
 * SMS Parser for Mongolian Banks
 * Automatically extracts payment info from bank SMS messages
 */

const bankPatterns = {
    // Khan Bank patterns
    khanBank: {
        incoming: [
            /\+([\d,\.]+)\s*MNT.*?(?:from|аас)\s*([A-Za-zА-Яа-яөүӨҮ\s]+)/i,
            /Орлого[:\s]*([\d,\.]+)\s*₮.*?Илгээгч[:\s]*([A-Za-zА-Яа-яөүӨҮ\s]+)/i,
            /received?\s*([\d,\.]+)\s*MNT/i,
            /\+([\d,\.]+)\s*₮/i
        ],
        transactionId: /(?:Гүйлгээ|Txn|Trans)[:\s#]*([A-Z0-9]+)/i
    },
    // Golomt Bank patterns
    golomtBank: {
        incoming: [
            /Орлого[:\s]*([\d,\.]+)/i,
            /\+([\d,\.]+)\s*₮/i
        ],
        transactionId: /(?:Лавлах|Ref)[:\s#]*([A-Z0-9]+)/i
    },
    // TDB (Trade and Development Bank) patterns
    tdbBank: {
        incoming: [
            /Орлого[:\s]*([\d,\.]+)\s*₮/i,
            /Credit[:\s]*([\d,\.]+)/i
        ],
        transactionId: /(?:Ref|Reference)[:\s#]*([A-Z0-9]+)/i
    },
    // State Bank patterns
    stateBank: {
        incoming: [
            /Орлого[:\s]*([\d,\.]+)/i
        ],
        transactionId: /(?:Гүйлгээний дугаар)[:\s#]*([A-Z0-9]+)/i
    },
    // Generic patterns (fallback)
    generic: {
        incoming: [
            /\+([\d,]+(?:\.\d{2})?)\s*(?:MNT|₮|tugrik)/i,
            /(?:received?|орлого|credit)[:\s]*([\d,]+(?:\.\d{2})?)/i,
            /([\d,]+(?:\.\d{2})?)\s*(?:MNT|₮)\s*(?:орсон|received|credited)/i,
            /Орлого[:\s]*([\d,\.]+)/i,
            /\+([\d,\.]+)/i
        ],
        transactionId: /(?:Txn|Trans|Ref|Гүйлгээ|Лавлах)[:\s#]*([A-Z0-9]+)/i
    }
};

function parsePaymentSMS(message, senderNumber = '') {
    if (!message) return null;
    
    let amount = null;
    let transactionId = null;
    let senderName = null;
    let bankName = 'Unknown';

    // Detect bank from sender number or message content
    const msgLower = message.toLowerCase();
    const senderLower = senderNumber.toLowerCase();
    
    if (senderLower.includes('khan') || msgLower.includes('khan') || msgLower.includes('хаан')) {
        bankName = 'Khan Bank';
    } else if (senderLower.includes('golomt') || msgLower.includes('golomt') || msgLower.includes('голомт')) {
        bankName = 'Golomt Bank';
    } else if (senderLower.includes('tdb') || msgLower.includes('tdb') || msgLower.includes('ххб')) {
        bankName = 'TDB';
    } else if (msgLower.includes('төрийн банк') || msgLower.includes('state bank')) {
        bankName = 'State Bank';
    } else if (msgLower.includes('xac') || msgLower.includes('хас')) {
        bankName = 'XacBank';
    }

    // Try all patterns to extract amount
    const allPatterns = [
        ...bankPatterns.khanBank.incoming,
        ...bankPatterns.golomtBank.incoming,
        ...bankPatterns.tdbBank.incoming,
        ...bankPatterns.stateBank.incoming,
        ...bankPatterns.generic.incoming
    ];

    for (const pattern of allPatterns) {
        const match = message.match(pattern);
        if (match) {
            // Amount is usually in first capture group
            const amountStr = match[1].replace(/,/g, '').replace(/'/g, '');
            const parsedAmount = parseFloat(amountStr);
            if (!isNaN(parsedAmount) && parsedAmount > 0) {
                amount = parsedAmount;
                
                // Sender name might be in second capture group
                if (match[2]) {
                    senderName = match[2].trim();
                }
                break;
            }
        }
    }

    // Try to extract transaction ID
    const txnPatterns = [
        bankPatterns.khanBank.transactionId,
        bankPatterns.golomtBank.transactionId,
        bankPatterns.tdbBank.transactionId,
        bankPatterns.stateBank.transactionId,
        bankPatterns.generic.transactionId
    ];

    for (const pattern of txnPatterns) {
        const match = message.match(pattern);
        if (match) {
            transactionId = match[1];
            break;
        }
    }

    // Try to extract sender name if not found yet
    if (!senderName) {
        const senderPatterns = [
            /(?:from|аас|Илгээгч|sender)[:\s]*([A-Za-zА-Яа-яөүӨҮЁё\s]{2,30})/i,
            /([A-ZА-ЯӨҮЁ][a-zа-яөүё]+\s+[A-ZА-ЯӨҮЁ][a-zа-яөүё]+)/  // Name pattern
        ];
        
        for (const pattern of senderPatterns) {
            const match = message.match(pattern);
            if (match) {
                senderName = match[1].trim();
                break;
            }
        }
    }

    if (amount && amount > 0) {
        return {
            amount,
            transactionId,
            senderName,
            bankName,
            isValid: true
        };
    }

    return null;
}

module.exports = { parsePaymentSMS };
