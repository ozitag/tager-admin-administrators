import { MenuItemType } from '@tager/admin-layout';

import {
  getAdminFormUrl,
  getAdminListUrl,
  getRoleFormUrl,
  getRoleListUrl,
} from '../utils/paths';

export const PAGES_MENU_ITEM: MenuItemType = {
  id: 'admins',
  text: 'Администраторы',
  icon: 'viewList',
  children: [
    { url: getRoleListUrl(), text: 'Roles' },
    { text: 'Create role', url: getRoleFormUrl({ roleId: 'create' }) },
    { url: getAdminListUrl(), text: 'Admins' },
    { text: 'Create admin', url: getAdminFormUrl({ adminId: 'create' }) },
  ],
};
