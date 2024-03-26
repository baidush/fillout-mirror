import { Controller, Get, Param, Query } from '@nestjs/common';
import { RequestService } from './app.service';

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
  ) {
    // Parse the filters string to JSON
    const parsedFilters = JSON.parse(filters);

    // Fetch response data
    const response = await this.responseService.fetchDataWithApiKey(id).toPromise();
    console.log(response.data, 'response.data');
    response.data.questions = [{
      id: '4KC356y4M6W8jHPKx9QfEy',
      name: "Anything else you'd like to share before your call?",
      type: 'equals',
      value: '2025-02-22T05:01:47.691Z'
    }];
    // Filter response data using the provided filters
    const filteredResponses = this.responseService.filterResponses(
      response.data,
      parsedFilters,
    );

    return filteredResponses;
  }
}
