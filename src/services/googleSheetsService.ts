import { Article } from "../types/article";

const SPREADSHEET_ID = "1rctu_xg4P0KkMWKbzu7-mgJp-HjCu-cT8DZqNAzln-s";
const API_KEY = "AIzaSyDvJ23IolKwjdxAnTv7l8DwLuwGRZ_tIR8"; // This is a public API key for Google Sheets API
const RANGE_A = "A:A"; // Article numbers
const RANGE_B = "B:B"; // Article content

export async function fetchArticleNumbers(): Promise<string[]> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE_A}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch article numbers: ${response.status}`);
    }

    const data = await response.json();
    const values = data.values || [];
    
    // Filter out empty rows and extract article numbers
    return values
      .map((row: string[]) => row[0] || "")
      .filter((value: string) => value !== "");
  } catch (error) {
    console.error("Error fetching article numbers:", error);
    return [];
  }
}

export async function fetchArticleContent(articleNumber?: string): Promise<Article[]> {
  try {
    // Fetch both columns
    const [numbersResponse, contentResponse] = await Promise.all([
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE_A}?key=${API_KEY}`),
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE_B}?key=${API_KEY}`)
    ]);

    if (!numbersResponse.ok || !contentResponse.ok) {
      throw new Error('Failed to fetch article content');
    }

    const numbersData = await numbersResponse.json();
    const contentData = await contentResponse.json();

    const numbers = numbersData.values || [];
    const contents = contentData.values || [];

    // Process data into articles with titles
    const articles: Article[] = [];
    
    const maxLength = Math.max(numbers.length, contents.length);
    
    for (let i = 0; i < maxLength; i++) {
      const numValue = numbers[i] && numbers[i][0] ? numbers[i][0] : "";
      const contentValue = contents[i] && contents[i][0] ? contents[i][0] : "";
      
      // Skip empty rows
      if (!numValue && !contentValue) continue;
      
      const isTitle = !!contentValue && !numValue;
      
      articles.push({
        number: numValue,
        content: contentValue,
        isTitle
      });
    }

    if (articleNumber) {
      return articles.filter(article => article.number === articleNumber);
    }

    return articles;
  } catch (error) {
    console.error("Error fetching article content:", error);
    return [];
  }
}

export async function searchArticles(query: string): Promise<Article[]> {
  try {
    const articles = await fetchArticleContent();
    
    // If query is a number, search by article number
    if (!isNaN(Number(query))) {
      return articles.filter(article => article.number === query);
    }
    
    // Otherwise, search by content
    return articles.filter(article => 
      article.content.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching articles:", error);
    return [];
  }
}
