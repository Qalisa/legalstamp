export const languages = {
    en: 'English',
    fr: 'Français',
};
  
export const defaultLang = 'en';

export const ui = {
    en: {
        'lang': {
            'en': 'English',
            'fr': 'French'
        },
        'documentType': {
            'privacy-policy': "Privacy Policy",
            'use-agreement': "License",
        },
        'productOrOrganization': {
            budivy: "BudIvy (Ivy C2C)",
            'ivy-community': "Ivy (Ivy B2B)"
        },
        'tag': {
            'latest': "Latest"
        }
    },
    fr: {
        'lang': {
            'en': 'Anglais',
            'fr': 'Français'
        },
        'documentType': {
            'privacy-policy': "Politique de Confidentialité",
            'use-agreement': "License d'utilisation",
        },
        'productOrOrganization': {
            'budivy': "",
            'ivy-community': ""
        },
        'tag': {
            'latest': "Le + récent"
        }
    },
} as const;