import React from 'react';

import { DataTable } from '../../components';
import { GetOwnershipContactData_ownershipContactTable_data as ContactData } from '../../generated/GetOwnershipContactData';

type Props = {
  data?: Array<ContactData>;
};

export default function ContactsTable(props: Props) {
  let { data = [] } = props;
  return (
    <DataTable>
      <DataTable.HeaderRow>
        <DataTable.HeaderCell width={260}>Name</DataTable.HeaderCell>
        <DataTable.HeaderCell align="right">Title</DataTable.HeaderCell>
        <DataTable.HeaderCell align="right">Phone</DataTable.HeaderCell>
        <DataTable.HeaderCell align="right">Email</DataTable.HeaderCell>
      </DataTable.HeaderRow>
      <DataTable.Body>
        {data.map((row, index) => {
          let { name, email, phone, title } = row;
          return (
            <DataTable.Row key={index}>
              <DataTable.Cell width={260}>{name}</DataTable.Cell>
              <DataTable.Cell align="right">{title}</DataTable.Cell>
              <DataTable.Cell align="right">{phone}</DataTable.Cell>
              <DataTable.Cell align="right">{email}</DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable.Body>
    </DataTable>
  );
}
