import { Test, TestingModule } from '@nestjs/testing';
import { RequestService } from './app.service';
import { of } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpModule, HttpService } from '@nestjs/axios';

type ResponseType = {
  id: string;
  name: string;
  questions: any[]; // Define your question type here
  calculations: any[];
  urlParameters: any[];
  documents: any[];
};

type FilterClauseType = {
  id: string;
  condition: 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
  value: number | string;
};

describe('RequestService', () => {
  let service: RequestService;
  let httpServiceMock: any;

  beforeEach(async () => {
    httpServiceMock = {
      get: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [RequestService, {
        provide: HttpService,
        useValue: httpServiceMock,
      },],
    }).compile();

    service = module.get<RequestService>(RequestService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchDataWithApiKey', () => {
    it('should return data from API', async () => {
      const formId = 'testFormId';
      const responseData = { data: 'testData' };
      const axiosResponse: AxiosResponse<any> = { data: responseData, status: 200, statusText: 'OK', headers: {}, config: {} as InternalAxiosRequestConfig<any>};
      httpServiceMock.get.mockReturnValue(of(axiosResponse));

      const result = await service.fetchDataWithApiKey(formId, {}).toPromise();

      expect(result).toEqual(axiosResponse);
      expect(httpServiceMock.get).toHaveBeenCalledWith(`https://api.fillout.com/v1/api/forms/${formId}?`, { headers: expect.any(Object) });
    });
  });

  describe('filterResponses', () => {
    it('should filter responses based on filters', () => {
      const responses: ResponseType[] = [
        { id: '1', name: 'Response 1', questions: [{ id: '1', value: 'foo' }], calculations: [], urlParameters: [], documents: [] },
        { id: '2', name: 'Response 2', questions: [{ id: '1', value: 'bar' }], calculations: [], urlParameters: [], documents: [] },
      ];
      const filters: FilterClauseType[] = [{ id: '1', condition: 'equals', value: 'foo' }];

      const filteredResponses = service.filterResponses(responses, filters);

      expect(filteredResponses).toHaveLength(1);
      expect(filteredResponses[0].id).toEqual('1');
    });
  });
});
