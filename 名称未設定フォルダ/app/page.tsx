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

    // Sync with localStorage
    useEffect(() => {
        const saved = localStorage.getItem('kugcc_beans');
        if (saved) {
            setBeans(JSON.parse(saved));
        }
    }, []);

    const selectedBean = beans.find(b => b.id === selectedBeanId);

    // Determine active recipe: Bean Override -> Custom Session Recipe -> Default
    const activeRecipe = selectedBean?.recipeOverride || customRecipe || DEFAULT_RECIPE;

    const handleRecipeSave = (newRecipe: Recipe, scope: 'default' | 'bean') => {
        if (scope === 'bean' && selectedBeanId) {
            const updatedBeans = beans.map(b => {
                if (b.id === selectedBeanId) {
                    // Logic:
                    // 1. Always update recipeOverride to be the "Active" recipe
                    // 2. If it has a name, ALSO add/update it in the 'recipes' list
                    let updatedRecipes = b.recipes || [];

                    if (newRecipe.name && newRecipe.name.trim() !== "") {
                        // Check if recipe with same name exists, update it. OR generate ID?
                        // Ideally we use ID, but for now name matching or new ID.
                        const existingIndex = updatedRecipes.findIndex(r => r.name === newRecipe.name);
                        if (existingIndex >= 0) {
                            updatedRecipes = [
                                ...updatedRecipes.slice(0, existingIndex),
                                newRecipe,
                                ...updatedRecipes.slice(existingIndex + 1)
                            ];
                        } else {
                            updatedRecipes = [...updatedRecipes, { ...newRecipe, id: Date.now().toString() }];
                        }
                    }

                    return {
                        ...b,
                        recipeOverride: newRecipe,
                        recipes: updatedRecipes
                    };
                }
                return b;
            });
            setBeans(updatedBeans);
            localStorage.setItem('kugcc_beans', JSON.stringify(updatedBeans));
            // Also set custom recipe to null so we use the override
            setCustomRecipe(null);
        } else {
            // "Save Default" behavior -> Just sets session custom recipe for now, 
            // OR we could update DEFAULT_RECIPE if we had a global store. 
            // For this session-based app, 'default' usually meant 'not attached to bean'.
            setCustomRecipe(newRecipe);
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
        if (selectedBeanId) {
            const updatedBeans = beans.map(b => {
                if (b.id === selectedBeanId && b.recipes) {
                    // Toggle star for the matching recipe
                    const updatedRecipes = b.recipes.map(r => {
                        // Match by ID if present, otherwise by Name+GrindSize+Structure or simply reference if we are lucky (but we map, so ref lost usually)
                        // Since we are iterating the bean's own recipe list, we can rely on index matching? No, passed recipe might be from sorted list.
                        // Best effort match: ID > Name
                        if (r.id && r.id === recipe.id) return { ...r, isStarred: !r.isStarred };
                        if (!r.id && r.name && r.name === recipe.name) return { ...r, isStarred: !r.isStarred };
                        // Fallback for exactly matching object structure if needed, but Name should suffice for this scope
                        return r;
                    });
                    return { ...b, recipes: updatedRecipes };
                }
                return b;
            });
            setBeans(updatedBeans);
            localStorage.setItem('kugcc_beans', JSON.stringify(updatedBeans));
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
