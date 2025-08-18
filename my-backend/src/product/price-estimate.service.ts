// src/products/price-estimate.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PriceEstimateService {
  // מודל יציב וגישה בתצורת generateContent
  private readonly geminiUrl =
    'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite-001:generateContent';
  private readonly apiKey = 'AIzaSyAVNCH4KoZB5iK7oBZFZhdY2YKYnr5ryXM';

  async estimate(description: string): Promise<{ minPrice: number; maxPrice: number }> {
    const url = `${this.geminiUrl}?key=${this.apiKey}`;
    try {
      // קריאה עם מבנה JSON תקני ל-Gemini
      const resp = await axios.post(url, {
        contents: [{
          parts: [{
            text: `Estimate price range for: ${description}. Respond only with JSON: {"minPrice": <number>, "maxPrice": <number>}`
          }]
        }],
        generationConfig: { maxOutputTokens: 64 }
      });

      // חילוץ הטקסט שהמודל החזיר
      const rawText = resp.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('No content returned from Gemini');

      // ניקוי code fences (```json ... ```)
      let clean = rawText.trim();
      if (clean.startsWith('```')) {
        clean = clean
          .replace(/^```[a-zA-Z]*\n?/, '')  // מסיר ```json\n או ```
          .replace(/```$/, '')              // מסיר ``` בסוף
          .trim();
      }

      // המרה לאובייקט JS
      let parsed: any;
      try {
        parsed = JSON.parse(clean);
      } catch (error) {
        throw new Error('Invalid JSON from Gemini after cleaning: ' + clean);
      }

      const { minPrice, maxPrice } = parsed;
      if (minPrice == null || maxPrice == null) {
        throw new Error('Missing minPrice/maxPrice in response JSON');
      }

      return { minPrice, maxPrice };
    } catch (err: any) {
      console.error('Gemini call error:', err.response?.data || err.message);
      throw new HttpException('Error fetching price estimate', HttpStatus.BAD_GATEWAY);
    }
  }
}
