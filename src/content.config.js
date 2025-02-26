// https://docs.astro.build/en/guides/content-collections/

// 1. Import utilities from `astro:content`
// 2. Import loader(s)
import { file, glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

// 3. Define your collection(s)
const legalstamped = defineCollection({ 
    loader: glob({ base: "./legalstamped/generated", pattern: "**/*.md" }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { legalstamped };