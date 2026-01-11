"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BeanLibrary from '@/components/features/BeanLibrary';
import Timer from '@/components/features/Timer';
import RightPanel from '@/components/features/RightPanel';
import RecipeEditor from '@/components/features/RecipeEditor';
import { Bean, Recipe, DEFAULT_RECIPE } from '@/utils/types';

export default function Home() {
    const [selectedBeanId, setSelectedBeanId] = useState<string | null>(null);
    const [beans, setBeans] = useState<Bean[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [customRecipe, setCustomRecipe] = useState<Recipe | null>(null);

    // Sync with localStorage & Initialize
    useEffect(() => {
        const saved = localStorage.getItem('kugcc_beans');
        if (saved) {
            setBeans(JSON.parse(saved));
        } else {
            // Default seeds (Moved from BeanLibrary)
            const seeds: Bean[] = [
                { id: '1', name: 'Ethiopia Yirgacheffe', roaster: 'Kurasu', origin: 'Ethiopia', roastLevel: 'Light', process: 'Washed', roastDate: new Date().toISOString(), recipeOverride: DEFAULT_RECIPE },
                { id: '2', name: 'Colombia Huila', roaster: 'Onibus', origin: 'Colombia', roastLevel: 'Medium', process: 'Honey', roastDate: new Date().toISOString(), recipeOverride: DEFAULT_RECIPE },
                { id: '3', name: 'Kenya AA', roaster: 'Glitch', origin: 'Kenya', roastLevel: 'Light', process: 'Washed', roastDate: new Date().toISOString(), recipeOverride: DEFAULT_RECIPE },
            ];
            setBeans(seeds);
            localStorage.setItem('kugcc_beans', JSON.stringify(seeds));
        }
    }, []);

    // Centralized update handler
    const handleBeansUpdate = (newBeans: Bean[]) => {
        setBeans(newBeans);
        localStorage.setItem('kugcc_beans', JSON.stringify(newBeans));
    };

    const selectedBean = beans.find(b => b.id === selectedBeanId);

    // Determine active recipe: Bean Override -> Custom Session Recipe -> Default
    const activeRecipe = selectedBean?.recipeOverride || customRecipe || DEFAULT_RECIPE;

    const handleRecipeSave = (newRecipe: Recipe, scope: 'default' | 'bean', mode: 'update' | 'create' = 'update') => {
        console.log("[Debug] handleRecipeSave called", { newRecipe, scope, selectedBeanId, mode });

        // Generate ID:
        // - If 'create' mode: ALWAYS allow generating a new ID (force new)
        // - If 'update' mode: Use existing ID if present, else generate new
        const finalRecipe = {
            ...newRecipe,
            id: (mode === 'create' || !newRecipe.id) ? Date.now().toString() : newRecipe.id
        };

        if (scope === 'bean' && selectedBeanId) {
            console.log("[Debug] Saving to Bean...", finalRecipe);
            const updatedBeans = beans.map(b => {
                if (b.id === selectedBeanId) {
                    let updatedRecipes = b.recipes || [];

                    if (mode === 'update') {
                        // Update existing logic
                        const existingIndexById = updatedRecipes.findIndex(r => r.id === finalRecipe.id);
                        if (existingIndexById >= 0) {
                            console.log("[Debug] Updating existing recipe by ID", existingIndexById);
                            updatedRecipes = [
                                ...updatedRecipes.slice(0, existingIndexById),
                                finalRecipe,
                                ...updatedRecipes.slice(existingIndexById + 1)
                            ];
                        } else {
                            // Fallback: If we tried to update but couldn't find it, treat as new (should rarely happen if UI is correct)
                            console.log("[Debug] Update target not found, preventing implicit create. Just adding.");
                            updatedRecipes = [...updatedRecipes, finalRecipe];
                        }
                    } else {
                        // Create mode: Always append
                        console.log("[Debug] Creating new recipe copy");
                        updatedRecipes = [...updatedRecipes, finalRecipe];
                    }

                    return {
                        ...b,
                        recipeOverride: finalRecipe,
                        recipes: updatedRecipes
                    };
                }
                return b;
            });
            setBeans(updatedBeans);
            localStorage.setItem('kugcc_beans', JSON.stringify(updatedBeans));
            console.log("[Debug] Bean updated and saved to localStorage");

            setCustomRecipe(null);
        } else {
            console.log("[Debug] Saving as Custom Session Recipe (Not persisted to bean)");
            setCustomRecipe(finalRecipe);
        }
        setIsEditing(false);
    };

    const handleLoadRecipe = (recipe: Recipe) => {
        if (selectedBeanId) {
            // Set as active override for this bean
            const updatedBeans = beans.map(b => b.id === selectedBeanId ? { ...b, recipeOverride: recipe } : b);
            setBeans(updatedBeans);
            localStorage.setItem('kugcc_beans', JSON.stringify(updatedBeans));
        } else {
            setCustomRecipe(recipe);
        }
    };

    const handleToggleRecipeStar = (recipe: Recipe) => {
        if (selectedBeanId && recipe.id) {
            const updatedBeans = beans.map(b => {
                if (b.id === selectedBeanId && b.recipes) {
                    const updatedRecipes = b.recipes.map(r => {
                        if (r.id === recipe.id) return { ...r, isStarred: !r.isStarred };
                        return r;
                    });

                    // Also update the override if it matches, so the UI star updates immediately if visible there
                    const updatedOverride = (b.recipeOverride && b.recipeOverride.id === recipe.id)
                        ? { ...b.recipeOverride, isStarred: !b.recipeOverride.isStarred }
                        : b.recipeOverride;

                    return { ...b, recipes: updatedRecipes, recipeOverride: updatedOverride };
                }
                return b;
            });
            setBeans(updatedBeans);
            localStorage.setItem('kugcc_beans', JSON.stringify(updatedBeans));
        } else {
            console.warn("[Debug] Cannot toggle star: Missing Bean ID or Recipe ID", { selectedBeanId, recipeId: recipe.id });
        }
    }

    const handleDeleteRecipe = (recipe: Recipe) => {
        console.log("[Delete Debug] Function Called", { recipeName: recipe.name, selectedBeanId });

        if (!selectedBeanId) {
            console.error("[Delete Debug] Aborting: No selectedBeanId");
            return;
        }

        // Move confirm after logging to ensure we track the attempt
        if (!confirm("Are you sure you want to delete this recipe?")) {
            return;
        }

        const updatedBeans = beans.map(b => {
            if (b.id === selectedBeanId && b.recipes) {
                const updatedRecipes = b.recipes.filter((r) => {
                    // Aggressive Matching Logic:
                    const isRefMatch = r === recipe;
                    const isIdMatch = !!(r.id && recipe.id && r.id === recipe.id);
                    const isNameMatch = !!(r.name && recipe.name && r.name === recipe.name);
                    // Legacy Fallback: Match if both are nameless/ID-less "ghosts"
                    const isGhostMatch = !r.id && !r.name && !recipe.id && !recipe.name;

                    if (isRefMatch || isIdMatch || isNameMatch || isGhostMatch) {
                        return false;
                    }
                    return true;
                });
                return { ...b, recipes: updatedRecipes };
            }
            return b;
        });
        setBeans(updatedBeans);
        localStorage.setItem('kugcc_beans', JSON.stringify(updatedBeans));
    };

    return (
        <DashboardLayout
            left={
                <BeanLibrary
                    beans={beans}
                    onBeansUpdate={handleBeansUpdate}
                    selectedId={selectedBeanId}
                    onSelect={(id) => setSelectedBeanId(id)}
                />
            }
            center={
                isEditing
                    ? <RecipeEditor
                        initialRecipe={activeRecipe}
                        onSave={handleRecipeSave}
                        onCancel={() => setIsEditing(false)}
                    />
                    : <Timer
                        recipe={activeRecipe}
                        onEdit={() => setIsEditing(true)}
                    />
            }
            right={<RightPanel bean={selectedBean} recipe={activeRecipe} onLoadRecipe={handleLoadRecipe} onToggleStar={handleToggleRecipeStar} onDeleteRecipe={handleDeleteRecipe} />}
        />
    );
}
