import { Injectable } from '@nestjs/common';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { Product, ProductDocument } from '../../models/ProductSchema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BaseScoutService {
  private aiClient: any;
  private endpoint: string = "https://models.github.ai/inference";
  private model: string = "openai/gpt-4.1-mini";

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
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

If any field is missing from the source page, fill it with "n/a". 

CRITICAL: Return ONLY the raw JSON object. Do NOT wrap it in markdown code blocks, do NOT add any explanations, comments, or additional text. Just return the pure JSON object starting with { and ending with }. Always ensure the values for currency, category, and discount follow the allowed options.`;

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
    
    const aiResponse = response.body.choices[0].message.content;
    console.log("AI Response from GPT-4.1 mini:", aiResponse);
    console.log("****************************************");

    try {
      // Clean the AI response by removing markdown code blocks
      let cleanedResponse = aiResponse.trim();
      
      // Remove ```json and ``` if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log("Cleaned response for parsing:", cleanedResponse);
      
      // Parse the JSON response from AI
      const productData = JSON.parse(cleanedResponse);
      console.log("Parsed product data:", productData);

      // Create new product document
      const newProduct = new this.productModel({
        url: productData.url || productLink,
        productName: productData.productName || 'n/a',
        price: productData.price || 'n/a',
        currency: productData.currency || 'n/a',
        color: productData.color || 'n/a',
        availableSizes: Array.isArray(productData.availableSizes) ? productData.availableSizes : [],
        description: productData.description || 'n/a',
        images: Array.isArray(productData.images) ? productData.images : [],
        category: productData.category || 'Other',
        brand: productData.brand || 'n/a',
        availability: productData.availability || 'n/a',
        discount: productData.discount || 'no',
        scrapedAt: productData.scrapedAt || new Date().toISOString(),
      });

      // Save to database
      const savedProduct = await newProduct.save();
      console.log("Product saved to database with ID:", savedProduct._id);

      return {
        success: true,
        productId: savedProduct._id,
        productData: savedProduct
      };

    } catch (parseError) {
      console.error("Error parsing AI response or saving to database:", parseError);
      
      // If JSON parsing fails, still try to save basic info
      const fallbackProduct = new this.productModel({
        url: productLink,
        productName: 'Failed to extract',
        price: 'n/a',
        currency: 'n/a',
        color: 'n/a',
        availableSizes: [],
        description: aiResponse, // Store raw AI response as description
        images: [],
        category: 'Other',
        brand: 'n/a',
        availability: 'n/a',
        discount: 'no',
        scrapedAt: new Date().toISOString(),
      });

      try {
        const savedFallback = await fallbackProduct.save();
        return {
          success: false,
          error: 'JSON parsing failed but basic data saved',
          productId: savedFallback._id,
          rawResponse: aiResponse
        };
      } catch (dbError) {
        return {
          success: false,
          error: 'Both parsing and database save failed',
          rawResponse: aiResponse,
          dbError: dbError.message
        };
      }
    }
  }
}
