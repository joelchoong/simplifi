import fs from 'fs';

const files = [
    "src/features/auth/data/useAuth.tsx",
    "src/features/tier/presentation/IncomeTierChart.tsx",
    "src/shared/components/ui/badge.tsx",
    "src/shared/components/ui/button.tsx",
    "src/shared/components/ui/form.tsx",
    "src/shared/components/ui/navigation-menu.tsx",
    "src/shared/components/ui/sidebar.tsx",
    "src/shared/components/ui/sonner.tsx",
    "src/shared/components/ui/toggle.tsx"
];

const ADD = '/* eslint-disable react-refresh/only-export-components */\n';

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.startsWith(ADD)) {
        fs.writeFileSync(file, ADD + content);
    }
}
console.log("Prepended eslint-disable to files.");
