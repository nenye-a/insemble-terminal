import React from 'react';

import { View } from '../../core-ui';
import { GetTerminal_terminal_pinnedFeeds as PinnedFeeds } from '../../generated/GetTerminal';
import {
  TableType,
  PerformanceTableType,
  OwnershipType,
} from '../../generated/globalTypes';
// import OverallPerformanceResult from '../results/OverallPerformanceResult';
import LatestNewsResult from '../results/LatestNewsResult';
// import PerformanceByCategoryResult from '../results/PerformanceByCategoryResult';
// import PerformanceByBrand from '../results/PerformanceByBrandResult';
// import PerformanceByLocationResult from '../results/PerformanceByLocationResult';
import PerformanceResult from '../results/PerformanceResult';
import CustomerActivityResult from '../results/CustomerActivityResult';
import PropertyContactsResult from '../results/PropertyContactsResult';
import CompanyContactsResult from '../results/CompanyContactsResult';
import PropertyOwnerInformationResult from '../results/PropertyOwnerInformationResult';
import CompanyInformationResult from '../results/CompanyInformationResult';
import CoverageResult from '../results/CoverageResult';

type Props = {
  data: Array<PinnedFeeds>;
};
export default function TerminalDataResult(props: Props) {
  let { data } = props;
  return (
    <View>
      {data.map(
        ({ tableType, performanceTableType, ownershipTableType, tableId }) => {
          let props = {
            tableId,
          };
          if (tableType === TableType.PERFORMANCE) {
            if (performanceTableType === PerformanceTableType.OVERALL) {
              return (
                <PerformanceResult
                  {...props}
                  title="Overall Performance"
                  performanceType={performanceTableType}
                />
              );
            } else if (performanceTableType === PerformanceTableType.BRAND) {
              return (
                <PerformanceResult
                  {...props}
                  title="By Brand"
                  performanceType={performanceTableType}
                />
              );
            } else if (performanceTableType === PerformanceTableType.CATEGORY) {
              return (
                <PerformanceResult
                  {...props}
                  title="By Category"
                  performanceType={performanceTableType}
                />
              );
            } else if (performanceTableType === PerformanceTableType.ADDRESS) {
              return (
                <PerformanceResult
                  {...props}
                  title="By Location"
                  performanceType={performanceTableType}
                  showNumLocation={false}
                  headerTitle="By Address"
                />
              );
            }
          } else if (tableType === TableType.NEWS) {
            return <LatestNewsResult {...props} />;
          } else if (tableType === TableType.ACTIVITY) {
            return <CustomerActivityResult {...props} />;
          } else if (tableType === TableType.OWNERSHIP_CONTACT) {
            if (ownershipTableType === OwnershipType.PROPERTY) {
              return <PropertyContactsResult {...props} />;
            } else if (ownershipTableType === OwnershipType.COMPANY) {
              return <CompanyContactsResult {...props} />;
            }
          } else if (tableType === TableType.OWNERSHIP_INFO) {
            if (ownershipTableType === OwnershipType.PROPERTY) {
              return <PropertyOwnerInformationResult {...props} />;
            } else if (ownershipTableType === OwnershipType.COMPANY) {
              return <CompanyInformationResult {...props} />;
            }
          } else if (tableType === TableType.COVERAGE) {
            return <CoverageResult {...props} />;
          }
          return null;
        },
      )}
    </View>
  );
}
