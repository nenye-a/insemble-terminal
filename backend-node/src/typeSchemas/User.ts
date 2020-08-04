import { objectType } from 'nexus';
import { prisma } from '../prisma';

export let Tenant = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.email();
    t.model.firstName();
    t.model.lastName();
    t.model.avatar();
    t.model.company();
    t.model.description();
    t.model.title();
    t.model.address();
    t.model.pendingEmail();
    t.model.role();
    t.field('license', {
      type: 'Boolean',
      resolve: async ({ id }) => {
        /**
         * This for checking license if it's exist or not.
         */
        let user = await prisma.user.findOne({
          where: { id },
          include: { license: true },
        });
        if (user?.license || user?.role === 'ADMIN') {
          /**
           * This part is if the user ADMIN then they won't to need any license.
           */
          return true;
        }
        return false;
      },
    });
  },
});
