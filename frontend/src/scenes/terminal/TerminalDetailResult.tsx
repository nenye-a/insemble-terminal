import React from 'react';
import { useHistory } from 'react-router-dom';

import { View } from '../../core-ui';
import { GetTerminal_terminal_pinnedFeeds as PinnedFeeds } from '../../generated/GetTerminal';
import {
  TableType,
  PerformanceTableType,
  OwnershipType,
} from '../../generated/globalTypes';
import { PerformanceRowPressParam } from '../../types/types';
import PerformanceResult from '../results/PerformanceResult';
import LatestNewsResult from '../results/LatestNewsResult';
import CustomerActivityResult from '../results/CustomerActivityResult';
import CoverageResult from '../results/CoverageResult';
import ContactsResult from '../results/ContactsResult';
import OwnershipInformationResult from '../results/OwnershipInformationResult';

import NoteResult from './NoteResult';
import AddNoteButton from './AddNoteButton';

type Props = {
  data: Array<PinnedFeeds>;
  readOnly?: boolean;
};

export default function TerminalDataResult(props: Props) {
  let { data, readOnly } = props;
  let history = useHistory();

  let onPerformanceRowPress = (params: PerformanceRowPressParam) => {
    let { newTag, prevTag, comparisonTag } = params;
    let { name, locationType, businessType } = newTag;
    if (locationType) {
      history.push('/results', {
        search: {
          businessTagWithId: comparisonTag
            ? comparisonTag.businessTag?.id
            : prevTag?.businessTag?.id,
          locationTag: {
            params: name,
            type: locationType,
          },
        },
      });
    } else if (businessType) {
      history.push('/results', {
        search: {
          businessTag: {
            params: name,
            type: businessType,
          },
          locationTag: comparisonTag
            ? comparisonTag.locationTag
            : prevTag?.locationTag,
        },
      });
    }
  };
  return (
    <View>
      {data.map(
        (
          {
            tableType,
            performanceTableType,
            ownershipTableType,
            tableId,
            id: pinTableId,
          },
          key,
        ) => {
          let props = {
            tableId,
            key,
            pinTableId,
            readOnly,
          };
          if (tableType === TableType.PERFORMANCE) {
            if (performanceTableType === PerformanceTableType.OVERALL) {
              return (
                <PerformanceResult
                  {...props}
                  title="Overall Performance"
                  performanceType={performanceTableType}
                  onPerformanceRowPress={onPerformanceRowPress}
                />
              );
            } else if (performanceTableType === PerformanceTableType.BRAND) {
              return (
                <PerformanceResult
                  {...props}
                  title="By Brand"
                  performanceType={performanceTableType}
                  onPerformanceRowPress={onPerformanceRowPress}
                />
              );
            } else if (performanceTableType === PerformanceTableType.CATEGORY) {
              return (
                <PerformanceResult
                  {...props}
                  title="By Category"
                  performanceType={performanceTableType}
                  headerTitle="Category"
                  onPerformanceRowPress={onPerformanceRowPress}
                />
              );
            } else if (performanceTableType === PerformanceTableType.ADDRESS) {
              return (
                <PerformanceResult
                  {...props}
                  title="By Location"
                  performanceType={performanceTableType}
                  showNumLocation={false}
                  headerTitle="Address"
                  onPerformanceRowPress={onPerformanceRowPress}
                />
              );
            } else if (performanceTableType === PerformanceTableType.STATE) {
              return (
                <PerformanceResult
                  {...props}
                  title="By State"
                  performanceType={performanceTableType}
                  headerTitle="State"
                  onPerformanceRowPress={onPerformanceRowPress}
                />
              );
            } else if (performanceTableType === PerformanceTableType.CITY) {
              return (
                <PerformanceResult
                  {...props}
                  title="By City"
                  performanceType={performanceTableType}
                  headerTitle="City"
                  onPerformanceRowPress={onPerformanceRowPress}
                />
              );
            }
          } else if (tableType === TableType.NEWS) {
            return <LatestNewsResult {...props} />;
          } else if (tableType === TableType.ACTIVITY) {
            return <CustomerActivityResult {...props} />;
          } else if (tableType === TableType.OWNERSHIP_CONTACT) {
            if (ownershipTableType === OwnershipType.PROPERTY) {
              return (
                <ContactsResult
                  {...props}
                  title="Property Contacts"
                  ownershipType={ownershipTableType}
                />
              );
            } else if (ownershipTableType === OwnershipType.COMPANY) {
              return (
                <ContactsResult
                  {...props}
                  title="Company Contacts"
                  ownershipType={ownershipTableType}
                />
              );
            }
          } else if (tableType === TableType.OWNERSHIP_INFO) {
            if (ownershipTableType === OwnershipType.PROPERTY) {
              return (
                <OwnershipInformationResult
                  {...props}
                  title="Property Information"
                  ownershipType={ownershipTableType}
                />
              );
            } else if (ownershipTableType === OwnershipType.COMPANY) {
              return (
                <OwnershipInformationResult
                  {...props}
                  title="Company Information"
                  ownershipType={ownershipTableType}
                />
              );
            }
          } else if (tableType === TableType.COVERAGE) {
            return <CoverageResult {...props} />;
          } else if (tableType === 'NOTE') {
            return <NoteResult {...props} />;
          }
          return null;
        },
      )}
      <AddNoteButton />
    </View>
  );
}
