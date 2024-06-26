import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { FilterRequestDto } from './app.controller';
import { stringify } from 'querystring'; // Import the querystring module
import * as dotenv from 'dotenv'; 

type FilterClauseType = {
  id: string;
  condition: 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
  value: number | string;
}

type ResponseFiltersType = FilterClauseType[];

type ResponseType = {
  id: string;
  name: string;
  questions: any[]; // Define your question type here
  calculations: any[];
  urlParameters: any[];
  documents: any[];
}

@Injectable()
export class RequestService {
  private readonly apiKey: string; // Define apiKey property
  constructor(private httpService: HttpService) {
    // Load environment variables from .env file
    dotenv.config();
    // Assign API key from environment variables
    this.apiKey = process.env.API_KEY;
  }

  fetchDataWithApiKey(formId: string, filterRequestDto: FilterRequestDto): Observable<AxiosResponse<any>> {
    // Ensure API key is defined
    if (!this.apiKey) {
      throw new Error('API_KEY is not defined in the environment variables');
    }
    // Convert FilterRequestDto to object with string keys and string values
    const queryParams: { [key: string]: string | string[] } = {};
    for (const [key, value] of Object.entries(filterRequestDto)) {
      queryParams[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }

    const apiUrl = `https://api.fillout.com/v1/api/forms/${formId}?${stringify(queryParams)}`;

    // Set headers with API key
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    // Send GET request with headers
    return this.httpService.get(apiUrl, { headers });
  }

  filterResponses(responses: ResponseType[] | ResponseType, filters: ResponseFiltersType): ResponseType[] {
    // Convert responses to an array if it's not already an array
    const responseArray = Array.isArray(responses) ? responses : [responses];
    return responseArray.filter(response => {
      return filters.every(filter => {
        const question = response.questions.find(question => question.id === filter.id);

        if (!question) return true;

        switch (filter.condition) {
          case 'equals':
            return question.value === filter.value;
          case 'does_not_equal':
            return question.value !== filter.value;
          case 'greater_than':
            if (new Date(question.value) instanceof Date && typeof filter.value === 'string') {
              const filterDate = new Date(filter.value);
              const questionDate = new Date(question.value);
              return questionDate.getTime() > filterDate.getTime();
            }
            return false;
          case 'less_than':
            if (new Date(question.value) instanceof Date && typeof filter.value === 'string') {
              const filterDate = new Date(filter.value);
              const questionDate = new Date(question.value);
              return questionDate.getTime() < filterDate.getTime();
            }
            return false;
          default:
            return true;
        }
      });
    });
  }
}