//
export const ui = {
    en: {
        'documentType': {
            'children-security-norms': "Norms Related to the Security of Children",
            'general-conditions-sales': "General Conditions of Sales",
            'privacy-policy': "Privacy Policy",
            'use-agreement': "License"
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
            'ivy-community': "Ivy (Ivy B2B)",
            qalisa: "Qalisa"
        },
        'tag': {
            'latest': "Latest"
        }
    },
    fr: {
        'documentType': {
            'children-security-norms': "Normes Liées à la Sécurité des Enfants",
            'general-conditions-sales': "Conditions Générales de Vente",
            'privacy-policy': "Politique de Confidentialité",
            'use-agreement': "Contrat de License"
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

//
export const defaultLang = 'en' satisfies keyof typeof ui;

//
export const languages = {
    en: ui.en.lang.en,
    fr: ui.fr.lang.fr,
} as const satisfies { [key in keyof typeof ui]: string }

