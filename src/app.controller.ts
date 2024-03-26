import { Controller, Get, Param, Query } from '@nestjs/common';
import { RequestService } from './app.service';

export class FilterRequestDto {
  limit?: number;
  afterDate?: string;
  beforeDate?: string;
  offset?: number;
  status?: string;
  includeEditLink?: boolean;
  sort?: 'asc' | 'desc';
}

@Controller()
export class AppController {
  constructor(private readonly responseService: RequestService) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get(':id/filteredResponses')
  async filterResponse(
    @Param('id') id: string,
    @Query('filters') filters: string,
    @Query() filterRequestDto: FilterRequestDto,
  ) {

    // Fetch response data
    try {
      const response = await this.responseService.fetchDataWithApiKey(id, filterRequestDto).toPromise();
      console.log(response.data);
      // Parse the filters string to JSON
      if (!filters) return response.data;
      const parsedFilters = JSON.parse(filters);
      
      // Filter response data using the provided filters
      const filteredResponses = this.responseService.filterResponses(
        response.data,
        parsedFilters
      );
    
      return filteredResponses;
    } catch (error) {
      // Handle errors here
      console.error('An error occurred:', error);
      throw new Error('An error occurred while fetching or filtering responses.');
    }
  }
}
