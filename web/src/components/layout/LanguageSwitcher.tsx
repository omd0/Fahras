import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useLanguage, type Language } from '@/providers/LanguageContext';
import { languageOptions } from '@/i18n/translations';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value as Language;
    setLanguage(value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <LanguageIcon sx={{ color: 'text.secondary' }} />
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="language-switcher-label">{t('Language')}</InputLabel>
        <Select
          labelId="language-switcher-label"
          id="language-switcher"
          value={language}
          label={t('Language')}
          onChange={handleChange}
          sx={{ textTransform: 'capitalize' }}
        >
          {(languageOptions || []).map(option => (
            <MenuItem key={option.code} value={option.code}>
              {language === 'ar' ? option.labelAr : option.labelEn}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};


