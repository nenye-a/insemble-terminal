import { objectType } from 'nexus';
import { prisma } from '../prisma';
import { PerformanceType, OwnershipType } from '@prisma/client';

export let PinnedFeed = objectType({
  name: 'PinnedFeed',
  definition(t) {
    t.model.id();
    t.model.tableId();
    t.model.tableType();
    t.field('performanceTableType', {
      type: 'PerformanceTableType',
      resolve: async ({ tableType, tableId }) => {
        let performanceTableType: PerformanceType | null = null;
        if (tableType === 'PERFORMANCE') {
          let performance = await prisma.performance.findOne({
            where: {
              id: tableId,
            },
          });
          if (performance) {
            performanceTableType = performance.type;
          }
        }
        return performanceTableType;
      },
      nullable: true,
    });
    t.field('ownershipTableType', {
      type: 'OwnershipType',
      resolve: async ({ tableType, tableId }) => {
        let ownershipType: OwnershipType | null = null;
        if (tableType === 'OWNERSHIP_CONTACT') {
          let ownershipContact = await prisma.ownershipContact.findOne({
            where: {
              id: tableId,
            },
          });
          if (ownershipContact) {
            ownershipType = ownershipContact.type;
          }
        }
        if (tableType === 'OWNERSHIP_INFO') {
          let ownershipInfo = await prisma.ownershipInfo.findOne({
            where: {
              id: tableId,
            },
          });
          if (ownershipInfo) {
            ownershipType = ownershipInfo.type;
          }
        }
        return ownershipType;
      },
      nullable: true,
    });
  },
});
