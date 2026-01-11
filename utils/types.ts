export type RecipeStep = {
    id: string;
    name: string;
    waterPercentage: number; // e.g. 20 for 20%
    duration: number; // seconds
};

export type Recipe = {
    id?: string;
    name?: string; // e.g. "Standard V60", "Hot Bloom"
    beanWeight: number; // grams
    ratio: number; // 1:x
    temperature: number; // Celsius
    grindSize: string; // Text description
    grinderModel?: string; // e.g. "Comandante C40"
    isStarred?: boolean; // New: Favorite status for recipe
    steps: RecipeStep[];
};

export type Bean = {
    id: string;
    name: string;
    roaster: string;
    origin?: string;
    variety?: string; // e.g. Geisha, Bourbon
    roastLevel: string; // Light, Medium, Dark
    process: string; // Washed, Natural, Honey
    roastDate: string; // ISO Date string
    isStarred?: boolean; // New: Favorite/Pin status
    recipeOverride?: Recipe; // Kept for backward compatibility or "active" state
    recipes?: Recipe[]; // New: List of saved recipes
};

// Default Recipe Template
export const DEFAULT_RECIPE: Recipe = {
    beanWeight: 15,
    ratio: 16,
    temperature: 93,
    grindSize: "Medium-Fine",
    grinderModel: "S3",
    steps: [
        { id: '1', name: 'Bloom', waterPercentage: 20, duration: 45 },
        { id: '2', name: 'First Pour', waterPercentage: 40, duration: 45 },
        { id: '3', name: 'Second Pour', waterPercentage: 40, duration: 45 },
    ]
};
