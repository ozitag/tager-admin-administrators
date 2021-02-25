import { i18n } from '@tager/admin-services';

import EN from './locales/en';
import RU from './locales/ru';

i18n.addTranslations('en', 'administrators', EN);
i18n.addTranslations('ru', 'administrators', RU);

export * from './constants/routes';
export * from './services/requests';
export * from './utils/paths';
