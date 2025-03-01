export const languages = {
    en: 'English',
    fr: 'Français',
};
  
export const defaultLang = 'en';

export const ui = {
    en: {
        'documentType': {
            'privacy-policy': "Privacy Policy",
            'use-agreement': "License",
        },
        'lang': {
            'en': 'English',
            'fr': 'French'
        },
        'pathDescr': {
            "d": "📝 By Document Type",
            "lang": "🈳 By Lang",
            "latest": "🆕 Latest Documents in",
            "p": "💼 By Product or Organization",
            "tag": "🆔 Available Documents"
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
        'documentType': {
            'privacy-policy': "Politique de Confidentialité",
            'use-agreement': "License d'utilisation",
        },
        'lang': {
            'en': 'Anglais',
            'fr': 'Français'
        },
        'tag': {
            'latest': "Le + récent"
        }
    },
} as const;