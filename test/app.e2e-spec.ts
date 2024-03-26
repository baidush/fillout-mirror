import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppController } from '../src/app.controller';
import { RequestService } from '../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let requestServiceMock: Partial<RequestService>;

  beforeEach(async () => {
    requestServiceMock = {
      fetchDataWithApiKey: jest.fn(),
      filterResponses: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: RequestService, useValue: requestServiceMock }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / should return "Hello World!"', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK)
      .expect('Hello World!');
  });
  it('GET /:id/filteredResponses should return filtered responses', async () => {
    const responseData = [{ id: '1', name: 'Response 1' }, { id: '2', name: 'Response 2' }];
    const id = '123';
    const filters = JSON.stringify([{ id: 'someId', condition: 'equals', value: 'someValue' }]);
  
    (requestServiceMock.fetchDataWithApiKey as jest.Mock).mockResolvedValueOnce({ data: responseData });
  
    const expectedResult = [{ id: '1', name: 'Response 1' }]; // Mocked filtered responses
  
    const response = await request(app.getHttpServer())
      .get(`/${id}/filteredResponses`)
      .query({ filters })
      .expect(HttpStatus.OK);
  
    expect(response.body).toEqual(expectedResult);
    expect(requestServiceMock.fetchDataWithApiKey).toHaveBeenCalledWith(id);
    expect(requestServiceMock.filterResponses).toHaveBeenCalledWith(responseData, [{ id: 'someId', condition: 'equals', value: 'someValue' }]);
  });
  

  it('GET /:id/filteredResponses should return unfiltered responses if filters are not provided', async () => {
    const responseData = [{ id: '1', name: 'Response 1' }, { id: '2', name: 'Response 2' }];
    const id = '123';

    (requestServiceMock.fetchDataWithApiKey as jest.Mock).mockResolvedValueOnce({ data: responseData });

    const response = await request(app.getHttpServer())
      .get(`/${id}/filteredResponses`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(responseData);
    expect(requestServiceMock.fetchDataWithApiKey).toHaveBeenCalledWith(id);
    expect(requestServiceMock.filterResponses).not.toHaveBeenCalled();
  });
});
