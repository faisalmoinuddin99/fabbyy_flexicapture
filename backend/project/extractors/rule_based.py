# project/extractors/rule_based.py
import re

class RuleBasedExtractor:
    def extract(self, text, ocr_data):
        fields = {}
        # Example rule-based extraction for invoice-like fields
        # Find "Invoice No" via regex and proximity
        invoice_no_match = re.search(r'Invoice\s*No\s*:\s*(\w+)', text, re.IGNORECASE)
        if invoice_no_match:
            value = invoice_no_match.group(1)
            # Find approximate coords (simplified)
            coords = {'x': 0, 'y': 0, 'w': 0, 'h': 0}  # TODO: Extract from ocr_data
            fields['invoice_no'] = (value, 0.9, coords)

        total_match = re.search(r'Total\s*Amount\s*:\s*\$?(\d+\.\d{2})', text, re.IGNORECASE)
        if total_match:
            value = total_match.group(1)
            coords = {'x': 0, 'y': 0, 'w': 0, 'h': 0}
            fields['total_amount'] = (value, 0.85, coords)

        # Add more rules as needed
        return fields