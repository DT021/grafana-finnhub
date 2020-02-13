import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/data';
import { BackendSrv as BackendService } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  dataSourceName: string;
  token: string;
  baseUrl: string;
  websocketUrl: string;

  /** @ngInject */
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>, private backendSrv: BackendService) {
    super(instanceSettings);
    this.dataSourceName = instanceSettings.name;
    const config = instanceSettings.jsonData;
    this.token = config.apiToken;
    this.baseUrl = `https://finnhub.io/api/v1/stock`;
    this.websocketUrl = `wss://ws.finnhub.io?token=${this.token}`;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { targets } = options;

    const promises = targets.map(target => {
      const query = { ...defaultQuery, ...target };
      return this.get(query.queryType.value, { symbol: target.symbol?.toUpperCase() });
    });

    const data = await Promise.all(promises);
    console.log('d', data);
    return { data: this.tableResponse(data) };
  }

  tableResponse = (data: string[]) => {
    return data.map(item => {
      return {
        columns: Object.entries(item).map(([key, val]) => ({ text: key, type: typeof val === 'string' ? 'string' : 'number' })),
        rows: [Object.values(item).map(val => val)],
        type: 'table',
      };
    });
  };

  async testDatasource() {
    const resp = await this.get('profile', { symbol: 'AAPL' });
    if (resp.status === 200) {
      return { status: 'success' };
    }
    return { status: 'error' };
  }

  async get(dataType: string, params: any = {}) {
    try {
      return await this.backendSrv.get(`${this.baseUrl}/${dataType}`, { token: this.token, ...params });
    } catch (e) {
      console.error('Error retrieving data', e);
    }
  }
}
