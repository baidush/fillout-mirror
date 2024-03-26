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

    // Fetch response data
    const response = await this.responseService.fetchDataWithApiKey(id).toPromise();

    // Parse the filters string to JSON
    if(!filters) return response.data;
    const parsedFilters = JSON.parse(filters);
    // Filter response data using the provided filters
    const filteredResponses = this.responseService.filterResponses(
      response.data,
      parsedFilters,
    );

    return filteredResponses;
  }
}
