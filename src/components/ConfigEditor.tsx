import React, { FC, ChangeEvent } from 'react';
import { Forms, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

export const ConfigEditor: FC<Props> = ({ options, onOptionsChange, ...props }) => {
  const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        apiToken: event.target.value,
      },
    });
  };

  const { jsonData } = options;

  return (
    <Forms.Field label="API Token">
      <Input value={jsonData.apiToken || ''} placeholder="Token for the Finnhub API" onChange={onAPIKeyChange} />
    </Forms.Field>
  );
};
