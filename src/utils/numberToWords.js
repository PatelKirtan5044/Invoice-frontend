/**
 * Converts a numerical amount into Indian Rupee words format.
 * E.g., 50525.00 -> "Indian Rupee Fifty Thousand Five Hundred Twenty-Five Only"
 */
export function numberToWords(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    function convertLessThanThousand(num) {
        if (num === 0) return '';
        
        let str = '';
        if (num >= 100) {
            str += ones[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        
        if (num >= 20) {
            str += tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ones[num % 10] : '') + ' ';
        } else if (num > 0) {
            str += ones[num] + ' ';
        }
        
        return str.trim();
    }

    // Split major parts
    const roundedAmt = parseFloat(amount).toFixed(2);
    const parts = roundedAmt.split('.');
    let rupees = parseInt(parts[0], 10);
    const paise = parseInt(parts[1], 10);

    if (rupees === 0 && paise === 0) {
        return 'Indian Rupee Zero Only';
    }

    let words = '';

    // Indian Numbering System: Crores, Lakhs, Thousands, Hundreds
    if (rupees >= 10000000) { // Crore
        const crore = Math.floor(rupees / 10000000);
        words += convertLessThanThousand(crore) + ' Crore ';
        rupees %= 10000000;
    }

    if (rupees >= 100000) { // Lakh
        const lakh = Math.floor(rupees / 100000);
        words += convertLessThanThousand(lakh) + ' Lakh ';
        rupees %= 100000;
    }

    if (rupees >= 1000) { // Thousand
        const thousand = Math.floor(rupees / 1000);
        words += convertLessThanThousand(thousand) + ' Thousand ';
        rupees %= 1000;
    }

    if (rupees > 0) {
        words += convertLessThanThousand(rupees) + ' ';
    }

    words = words.trim();

    let output = 'Indian Rupee ' + words;

    if (paise > 0) {
        const paiseWords = convertLessThanThousand(paise);
        output += ' and ' + paiseWords + ' Paise';
    }

    output += ' Only';
    
    // Clean double spaces
    return output.replace(/\s+/g, ' ');
}
