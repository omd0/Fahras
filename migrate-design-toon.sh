#!/bin/bash

# Design.toon Migration Script
# This script automates the migration from gradient/shadow-based design to design.toon specifications

set -e

echo "Starting design.toon migration..."

# Array of files to migrate (remaining Phase 3-8 files)
FILES=(
  "web/src/features/projects/components/ProjectMetadata.tsx"
  "web/src/features/projects/components/ProjectFiles.tsx"
  "web/src/features/projects/components/ProjectHeader.tsx"
  "web/src/features/projects/components/ProjectInteractions.tsx"
)

# Function to migrate a single file
migrate_file() {
  local file="$1"
  echo "Migrating $file..."

  # 1. Replace professorColors import with designTokens
  sed -i "s/import { professorColors } from '@\/styles\/theme\/professorTheme';/import { designTokens } from '@\/styles\/designTokens';/g" "$file"

  # 2. Remove professor card/header style objects (they're complex multi-line, so we'll handle manually)
  # This is too complex for sed, needs manual intervention

  # 3. Replace common gradient patterns
  sed -i "s/background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'/background: 'white'/g" "$file"
  sed -i "s/background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'/background: designTokens.colors.surface[50]/g" "$file"
  sed -i "s/background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'/background: designTokens.colors.warning[50]/g" "$file"
  sed -i "s/background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'/background: designTokens.colors.primary[50]/g" "$file"

  # 4. Replace header gradients with solid color
  sed -i "s/background: isProfessor ? professorColors\.primaryGradient : 'linear-gradient(135deg, #[0-9a-f]\{6\} 0%, #[0-9a-f]\{6\} 100%)'/background: designTokens.colors.secondary[700]/g" "$file"

  # 5. Replace border radius
  sed -i "s/borderRadius: 3/borderRadius: designTokens.radii.card/g" "$file"

  # 6. Replace transform values
  sed -i "s/transform: 'translateY(-2px)'/transform: 'translateY(-1px)'/g" "$file"

  # 7. Remove boxShadow (simple cases)
  sed -i "s/boxShadow: '0 [0-9]\\+ [0-9]\\+px rgba([0-9, ]\\+)'/boxShadow: 'none'/g" "$file"

  echo "✓ Migrated $file"
}

# Migrate each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    migrate_file "$file"
  else
    echo "⚠ File not found: $file"
  fi
done

echo ""
echo "Migration complete!"
echo ""
echo "⚠ IMPORTANT: Manual review required for:"
echo "  - Complex professor style objects (professorCardStyle, professorHeaderStyle)"
echo "  - ::before and ::after pseudo-elements with gradients"
echo "  - Conditional isProfessor gradient logic"
echo "  - Avatar gradients"
echo "  - Chip sx gradients"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Manual fixes for complex patterns"
echo "3. Test build: cd web && npm run build"
echo "4. Visual testing: npm run dev"
