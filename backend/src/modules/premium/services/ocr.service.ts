import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class OCRService {
    private readonly logger = new Logger(OCRService.name);

    constructor(private configService: ConfigService) { }

    /**
     * Extract text from identity document using Tesseract OCR
     */
    async extractTextFromDocument(imageUrl: string): Promise<{
        text: string;
        confidence: number;
        extractedData: any;
    }> {
        try {
            this.logger.log(`Starting OCR for image: ${imageUrl}`);

            // Perform OCR
            const result = await Tesseract.recognize(imageUrl, 'fra+eng', {
                logger: (m) => this.logger.debug(m),
            });

            const text = result.data.text;
            const confidence = result.data.confidence;

            // Extract structured data from text
            const extractedData = this.parseDocumentText(text);

            this.logger.log(`OCR completed with confidence: ${confidence}%`);

            return {
                text,
                confidence,
                extractedData,
            };
        } catch (error: any) {
            this.logger.error('OCR extraction failed:', error);
            return {
                text: '',
                confidence: 0,
                extractedData: {},
            };
        }
    }

    /**
     * Parse extracted text to find structured data
     */
    private parseDocumentText(text: string): any {
        const data: any = {};

        // Extract document number (various patterns)
        const docNumberPatterns = [
            /N[°o]\s*:?\s*([A-Z0-9]{6,})/i,
            /(?:ID|PASSPORT|PERMIS)\s*:?\s*([A-Z0-9]{6,})/i,
            /([A-Z]{2}\d{6,})/,
        ];

        for (const pattern of docNumberPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.documentNumber = match[1].trim();
                break;
            }
        }

        // Extract name
        const namePatterns = [
            /(?:NOM|NAME|SURNAME)\s*:?\s*([A-ZÀ-Ÿ\s]{2,})/i,
            /(?:PRENOM|GIVEN\s*NAME|FIRST\s*NAME)\s*:?\s*([A-ZÀ-Ÿ\s]{2,})/i,
        ];

        const names: string[] = [];
        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match) {
                names.push(match[1].trim());
            }
        }

        if (names.length > 0) {
            data.fullName = names.join(' ');
        }

        // Extract date of birth
        const dobPatterns = [
            /(?:NÉ|BORN|DOB|DATE\s*OF\s*BIRTH)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
            /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/,
        ];

        for (const pattern of dobPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.dateOfBirth = match[1].trim();
                break;
            }
        }

        // Extract expiry date
        const expiryPatterns = [
            /(?:EXPIRE|EXPIRY|VALID\s*UNTIL)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        ];

        for (const pattern of expiryPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.expiryDate = match[1].trim();
                break;
            }
        }

        // Extract nationality
        const nationalityPatterns = [
            /(?:NATIONALITÉ|NATIONALITY)\s*:?\s*([A-ZÀ-Ÿ]{3,})/i,
        ];

        for (const pattern of nationalityPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.nationality = match[1].trim();
                break;
            }
        }

        return data;
    }

    /**
     * Validate extracted data quality
     */
    validateExtractedData(data: any, confidence: number): {
        isValid: boolean;
        flags: string[];
    } {
        const flags: string[] = [];

        // Check confidence threshold
        if (confidence < 70) {
            flags.push('low_ocr_confidence');
        }

        // Check required fields
        if (!data.documentNumber) {
            flags.push('missing_document_number');
        }

        if (!data.fullName) {
            flags.push('missing_name');
        }

        if (!data.dateOfBirth) {
            flags.push('missing_dob');
        }

        // Check date formats
        if (data.dateOfBirth && !this.isValidDate(data.dateOfBirth)) {
            flags.push('invalid_dob_format');
        }

        if (data.expiryDate && !this.isValidDate(data.expiryDate)) {
            flags.push('invalid_expiry_format');
        }

        // Check if document is expired
        if (data.expiryDate && this.isExpired(data.expiryDate)) {
            flags.push('document_expired');
        }

        return {
            isValid: flags.length === 0,
            flags,
        };
    }

    /**
     * Check if date string is valid
     */
    private isValidDate(dateStr: string): boolean {
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date.getTime());
    }

    /**
     * Check if document is expired
     */
    private isExpired(expiryDateStr: string): boolean {
        try {
            const expiryDate = new Date(expiryDateStr);
            return expiryDate < new Date();
        } catch {
            return false;
        }
    }
}
