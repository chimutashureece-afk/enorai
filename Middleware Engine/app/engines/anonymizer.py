import re

class Anonymizer:

    def clean(self, text):

        if not text:
            return text
           
        text = re.sub(r'\b[\w\.-]+@[\w\.-]+\.\w+\b', '[EMAIL]', text)
        text = re.sub(r'\+?\d[\d\s\-]{8,14}\d', '[PHONE]', text)
        text = re.sub(r'\b\d{2}-\d{6}\s?[A-Z]\s?\d{2}\b', '[NATIONAL_ID]', text)
        text = re.sub(r'\b[A-Z]{1,2}\d{6,8}\b', '[PASSPORT]', text)
        text = re.sub(r'\b\d{2}[/-]\d{2}[/-]\d{4}\b', '[DOB]', text)
        text = re.sub(
            r'\b(Mr|Mrs|Ms|Dr|Prof)\.?\s+[A-Z][a-z]+\b',
            '[PERSON_NAME]',
            text
        )
        text = re.sub(
            r'\b[A-Z][a-z]+\s[A-Z][a-z]+\b',
            '[PERSON_NAME]',
            text
        )

        text = re.sub(r'\b(?:\d[ -]*?){13,16}\b', '[CARD_NUMBER]', text)
        text = re.sub(r'\b\d{9,18}\b', '[BANK_ACCOUNT]', text)
        text = re.sub(r'\bTXN\d{6,12}\b', '[TRANSACTION_ID]', text)
        text = re.sub(r'\bECO\d{5,12}\b', '[MOBILE_MONEY_REF]', text)


        text = re.sub(r'\bCR\d{5,10}\b', '[COMPANY_REG]', text)
        text = re.sub(r'\bEMP\d{3,8}\b', '[EMPLOYEE_ID]', text)
        text = re.sub(r'\bTKT\d{3,10}\b', '[TICKET_ID]', text)
        text = re.sub(r'\bserver-\d+\b', '[SERVER_NAME]', text)
        text = re.sub(
            r'http[s]?://internal\.\S+',
            '[INTERNAL_URL]',
            text
        )


        text = re.sub(
            r'password\s*[:=]\s*\S+',
            'password=[REDACTED]',
            text,
            flags=re.IGNORECASE
        )

        text = re.sub(
            r'\b(sk|pk|api|token)[-_]?[A-Za-z0-9]{16,}\b',
            '[API_KEY]',
            text,
            flags=re.IGNORECASE
        )

        text = re.sub(
            r'Bearer\s+[A-Za-z0-9\-_\.]+',
            '[AUTH_TOKEN]',
            text
        )

        text = re.sub(
            r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',
            '[JWT_TOKEN]',
            text
        )

        text = re.sub(
            r'-----BEGIN PRIVATE KEY-----.*?-----END PRIVATE KEY-----',
            '[PRIVATE_KEY]',
            text,
            flags=re.DOTALL
        )

        text = re.sub(
            r'\b\d{1,3}(?:\.\d{1,3}){3}\b',
            '[IP_ADDRESS]',
            text
        )

        text = re.sub(
            r'\b([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}\b',
            '[MAC_ADDRESS]',
            text
        )

        text = re.sub(
            r'-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+',
            '[GPS_LOCATION]',
            text
        )

        text = re.sub(
            r'\b\d{1,5}\s[A-Za-z0-9\s]{3,30}(Street|St|Road|Rd|Avenue|Ave|Drive|Dr)\b',
            '[ADDRESS]',
            text,
            flags=re.IGNORECASE
        )

        text = re.sub(
            r'\bMRN\d{5,10}\b',
            '[MEDICAL_RECORD]',
            text
        )

        text = re.sub(
            r'\bRX\d{5,10}\b',
            '[PRESCRIPTION_ID]',
            text
        )

        return text