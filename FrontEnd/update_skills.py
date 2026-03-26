import os

# 1. Update frontend-specialist.md
file1_path = r"e:\pedro\Admin--FrontEnd\.agents\agents\frontend-specialist.md"
with open(file1_path, 'r', encoding='utf-8') as f:
    text1 = f.read()

# Replacements for file1
text1 = text1.replace(
    '### 🚫 THE MODERN SaaS "SAFE HARBOR" (STRICTLY FORBIDDEN)',
    '### 🏢 ERP UX: PREDICTABILITY IS A FEATURE, NOT A FLAW'
).replace(
    'These are now FORBIDDEN as defaults:', 'For ERPs and Admin Panels, standard layouts (Safe Harbors) are actually preferred for user familiarity:'
).replace(
    'DO NOT default to (Left Content / Right Image/Animation). It\'s the most overused layout in 2025.',
    'Use standard sidebars, top app bars, and conventional page structures.'
).replace(
    '**Bento Grids**: Use only for truly complex data. DO NOT make it the default for landing pages.',
    '**Data Grids & Bento Grids**: Highly encouraged for organizing complex metrics and data tables.'
).replace(
    '**Glassmorphism**: Don\'t mistake the blur + thin border combo for "premium"; it\'s an AI cliché.',
    '**Clear Action Areas**: Buttons should be obvious, using brand colors (`#ff914d` for primary, `#043273` for hover).'
).replace(
    '**Deep Cyan / Fintech Blue**: The "safe" escape palette for Fintech. Try risky colors like Red, Black, or Neon Green instead.',
    '**Data-Centric Copy**: Use precise, professional language suited for business management.'
).replace(
    '> 🔴 **"If your layout structure is predictable, you have FAILED."**',
    '> 🟢 **"If your layout structure is predictable and highly usable, you have SUCCEEDED."**'
).replace(
    '### ⛔ NO DEFAULT UI LIBRARIES',
    '### ✅ ENFORCED UI FRAMEWORK: REACT ADMIN & MATERIAL UI (MUI)'
).replace(
    '**NEVER automatically use shadcn, Radix, or any component library without asking!**',
    '**This is an ERP/Admin project. You MUST use Material UI (MUI) combined with React Admin.**'
).replace(
    'These are YOUR favorites from training data, NOT the user\'s choice:\n\n- ❌ shadcn/ui (overused default)\n- ❌ Radix UI (AI favorite)\n- ❌ Chakra UI (common fallback)\n- ❌ Material UI (generic look)',
    '- ✅ Material UI (MUI) is the standard. Focus on using and customizing MUI components safely.\n- ✅ React Admin is the core framework for data management and CRUD generation.\n- ❌ Do NOT force raw Tailwind CSS for complex data tables when MUI Datagrid is available.\n- ❌ Do NOT avoid MUI components; embrace them for consistency and speed in ERPs.'
).replace(
    '### 🚫 PURPLE IS FORBIDDEN (PURPLE BAN)',
    '### 🟣 BRAND COLOR: PURPLE/GRAY ACCENTS ALLOWED'
).replace(
    '**NEVER use purple, violet, indigo or magenta as a primary/brand color unless EXPLICITLY requested.**',
    '**The project\'s visual identity explicitly uses Purple/Gray (`#69628c`).**'
).replace(
    '- ❌ NO purple gradients\n- ❌ NO "AI-style" neon violet glows\n- ❌ NO dark mode + purple accents\n- ❌ NO "Indigo" Tailwind defaults for everything\n\n**Purple is the #1 cliché of AI design. You MUST avoid it to ensure originality.**',
    '- ✅ Use `#69628c` for secondary elements, accents, or subtle contrasts.\n- ✅ Combine smoothly with the Primary Orange (`#ff914d`) according to `visual-identity.md`.\n- ❌ Do NOT apply the standard "Purple Ban". The brand requires it.'
)

with open(file1_path, 'w', encoding='utf-8') as f:
    f.write(text1)

# 2. Update frontend-design/SKILL.md
file2_path = r"e:\pedro\Admin--FrontEnd\.agents\skills\frontend-design\SKILL.md"
with open(file2_path, 'r', encoding='utf-8') as f:
    text2 = f.read()

text2 = text2.replace(
    '### ❌ AI Tendency Patterns (AVOID!)',
    '### ❌ AI Tendency Patterns (AVOID for ERPs)'
).replace(
    '- **Purple/violet everything (PURPLE BAN ✅)**',
    '- **Ignoring Brand Guidelines**: Always stick to the defined `visual-identity.md` (which allows Purple/Gray).'
).replace(
    '- **Bento grids for simple landing pages**',
    '- **Sacrificing Density for Whitespace**: ERPs need high data density. Don\'t add excessive padding.'
).replace(
    '- **Mesh Gradients & Glow Effects**',
    '- **Reinventing the UI**: Stick to Material UI standard patterns for familiar navigations.'
)

with open(file2_path, 'w', encoding='utf-8') as f:
    f.write(text2)

print("Updates completed successfully.")
