import { Injectable } from '@nestjs/common';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

@Injectable()
export class BaseScoutService {
    private aiClient: any;
  private endpoint: string = "https://models.github.ai/inference";
  private model: string = "openai/gpt-4.1-mini";

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    this.aiClient = ModelClient(this.endpoint, new AzureKeyCredential(token));
  }

  async askBaseScout(productLink: string): Promise<any> {
const systemMessage = `You are a product data extraction assistant. Your only task is to visit the given product page URL and return structured product data as JSON. You must always include the following fields in your response: 
- url
- productName
- price
- currency (choose from: USD, EUR, GBP, JPY, AUD; if not listed, use "n/a")
- color
- availableSizes (array)
- description
- images (array of full image URLs)
- category (choose from: Clothing, Electronics, Home, Beauty, Sports, Other; if not listed, use "Other")
- brand
- availability
- discount (yes or no)
- scrapedAt (current ISO date/time).

If any field is missing from the source page, fill it with "n/a". Output must be valid JSON only, with no explanations, comments, or additional text outside the JSON object. Always ensure the values for currency, category, and discount follow the allowed options.`;

    const response = await this.aiClient.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: `Product Link: ${productLink}` }
        ],
        temperature: 0.3,
        top_p: 0.9,
        model: this.model
      }
    });

    if (isUnexpected(response)) throw response.body.error;

    const answer = response.body.choices[0].message.content;
    console.log("AI Response:***base buddy service file***", answer);

    // Return parsed JSON if valid, otherwise raw text
    try {
      return JSON.parse(answer);
    } catch (e) {
      return { raw: answer };
    }
  }
}
