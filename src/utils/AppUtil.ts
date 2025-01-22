import axios from "axios";

 
export default class AppUtil {
 
  
  static generateRandomString(length: number): string {
    return crypto.randomUUID();
  }
  static getRandomInt(): number {
    const min = 1;
    const max = 999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
 
  
}
