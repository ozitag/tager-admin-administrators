import { i18n } from "@tager/admin-services";

import { EN } from "./en";
import { RU } from "./ru";

export function applyTranslations() {
  i18n.addTranslations("en", "administrators", EN);
  i18n.addTranslations("ru", "administrators", RU);
}
