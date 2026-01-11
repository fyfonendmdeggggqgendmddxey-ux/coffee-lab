
export const GRINDER_TABLE = {
    models: {
        "C40_MK4": [17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 30],
        "C40_MK4_REDCLIX": [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
        "K_ULTRA": [54, 55, 57, 59, 61, 63, 64, 66, 68, 70, 72, 73, 75, 77, 79, 81, 82, 84, 86, 88, 90, 91, 93, 95, 97, 99, 100],
        "K6": [60, 62, 64, 67, 69, 71, 73, 75, 78, 80, 82, 84, 86, 89, 91, 93, 95, 97, 100, 102, 104, 106, 108, 111, 113, 115, 117],
        "TIMEMORE_C2": [15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 31],
        "TIMEMORE_C3": [11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 19, 20, 20, 21, 21, 22, 22],
        "X_LITE": [7, 7.5, 8, 8.5, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 17.5, 18],
        "S3": [2.6, 2.8, 3.1, 3.3, 3.6, 3.8, 4.1, 4.3, 4.6, 4.8, 5.1, 5.3, 5.6, 5.8, 6.1, 6.3, 6.6, 6.8, 7.1, 7.3, 7.6, 7.8, 8.1, 8.3, 8.6, 8.8, null],
        "EPEIOS_GO": [34, 35, 37, 38, 39, 41, 42, 44, 45, 46, 48, 49, 51, 52, 53, 55, 56, 58, 59, 60, 62, 63, 65, 66, 67, 69, 70]
    }
} as const;

// Grind Size Mapping based on user request:
// Fine(4), Mid-Fine(5), Medium(6), Mid-Coarse(6), Coarse(6).
// The value represents the index in the GRINDER_TABLE array for that specific grind size category.
const GRIND_SIZE_INDEX_MAP: Record<string, number> = {
    "Fine": 4,
    "Medium-Fine": 5, // Mapping "Mid-Fine" to "Medium-Fine" as per likely app usage
    "Medium": 6,
    "Medium-Coarse": 6, // Mapping "Mid-Coarse"
    "Coarse": 6
};

// Default index if unknown
const DEFAULT_INDEX = 6;

export function getGrinderClicks(model: string, grindSize: string): number | string | null {
    if (!model || !grindSize) return null;

    // Normalize model name to match table keys if necessary, 
    // assuming model strings coming from app match keys or close to it.
    // For now, direct lookup.

    // @ts-ignore - allowing dynamic access for now
    const modelData = GRINDER_TABLE.models[model];

    if (!modelData) return null;

    const index = GRIND_SIZE_INDEX_MAP[grindSize] ?? DEFAULT_INDEX;

    if (index >= modelData.length) return null;

    return modelData[index];
}
