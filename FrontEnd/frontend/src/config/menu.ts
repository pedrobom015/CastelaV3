/**
 * Retrocompatibilidade — tudo foi migrado para src/config/modules.tsx.
 * Não edite este arquivo para adicionar menus; edite modules.tsx.
 */
export type { MenuItem } from "./modules";

import { MODULES } from "./modules";
export const MENU = MODULES.find((m) => m.id === "plano")?.menu ?? [];
