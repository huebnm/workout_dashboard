ts
// @ts-nocheck
import React, { useState, useMemo, useEffect } from "react";
import { Dumbbell, Timer, RotateCcw, Copy, Check, X } from "lucide-react";

/* ============================================================
   DATEN — reduzierte Version der uebungsdatenbank.json
   ============================================================ */
const EXERCISES = [
  { id: "back-squat", family: "squat", name: "Back Squat", category: "strength", pattern: "squat", equipment: ["barbell", "rack"], difficulty: "intermediate", muscles: ["quads", "glutes", "core"], role: "strength", timePerRep: 3, repRange: { min: 5, max: 10 }, tags: ["compound"], injuryFlags: ["lower_back", "knee"], scaling: { weight: { male: { min: 60, max: 90 }, female: { min: 40, max: 60 } }, beginnerMovement: "Bodyweight Squat" } },
  { id: "deadlift", name: "Deadlift", category: "strength", pattern: "hinge", equipment: ["barbell"], difficulty: "intermediate", muscles: ["hamstrings", "glutes", "lower_back"], role: "strength", timePerRep: 2, repRange: { min: 5, max: 12 }, tags: ["compound"], injuryFlags: ["lower_back"], scaling: { weight: { male: { min: 70, max: 130 }, female: { min: 45, max: 80 } }, beginnerMovement: "Kettlebell Deadlift" } },
  { id: "shoulder-press", name: "Shoulder Press", category: "strength", pattern: "push", equipment: ["barbell"], difficulty: "intermediate", muscles: ["shoulders", "triceps"], role: "strength", timePerRep: 2, repRange: { min: 6, max: 12 }, tags: ["compound"], injuryFlags: ["shoulder_overhead"], scaling: { weight: { male: { min: 30, max: 50 }, female: { min: 20, max: 35 } }, beginnerMovement: "Dumbbell Shoulder Press" } },
  { id: "front-rack-lunge", family: "lunge", name: "Front Rack Lunge", category: "strength", pattern: "squat", equipment: ["barbell"], difficulty: "intermediate", muscles: ["quads", "glutes"], role: "strength", timePerRep: 2, repRange: { min: 8, max: 16 }, tags: [], injuryFlags: ["knee"], scaling: { weight: { male: { min: 30, max: 50 }, female: { min: 20, max: 35 } }, beginnerMovement: "Bodyweight Lunge" } },
  { id: "goblet-squat", family: "squat", name: "Goblet Squat", category: "strength", pattern: "squat", equipment: ["kettlebell"], difficulty: "beginner", muscles: ["quads", "glutes"], role: "strength", timePerRep: 1.5, repRange: { min: 10, max: 18 }, tags: [], injuryFlags: ["knee"], scaling: { weight: { male: { min: 16, max: 28 }, female: { min: 10, max: 18 } }, beginnerMovement: "Bodyweight Squat" } },
  { id: "kb-clean-press", name: "KB Clean & Press", category: "strength", pattern: "olympic", equipment: ["kettlebell"], difficulty: "intermediate", muscles: ["shoulders", "glutes", "core"], role: "both", timePerRep: 2.5, repRange: { min: 8, max: 15 }, tags: [], injuryFlags: ["shoulder_overhead", "lower_back"], scaling: { weight: { male: { min: 16, max: 28 }, female: { min: 10, max: 18 } }, beginnerMovement: "Kettlebell Swing (leicht)" } },
  { id: "kb-swing", name: "Kettlebell Swing", category: "monostructural", pattern: "hinge", equipment: ["kettlebell"], difficulty: "beginner", muscles: ["glutes", "hamstrings", "core"], role: "both", timePerRep: 1.5, repRange: { min: 12, max: 21 }, tags: [], injuryFlags: ["lower_back"], scaling: { weight: { male: { min: 16, max: 24 }, female: { min: 12, max: 16 } }, beginnerMovement: "Russian Swing (leichtes Gewicht)" } },
  { id: "wall-ball", name: "Wall Ball Shot", category: "monostructural", pattern: "squat", equipment: ["medicine_ball", "wall"], difficulty: "beginner", muscles: ["quads", "shoulders"], role: "conditioning", timePerRep: 2, repRange: { min: 12, max: 20 }, tags: [], injuryFlags: ["knee", "shoulder_overhead"], scaling: { weight: { male: "9kg", female: "6kg" }, beginnerMovement: "Air Squat + Ball Raise" } },
  { id: "burpee", family: "burpee", name: "Burpee", category: "monostructural", pattern: "core", equipment: ["bodyweight"], difficulty: "beginner", muscles: ["full_body"], role: "conditioning", timePerRep: 3, repRange: { min: 8, max: 15 }, tags: [], injuryFlags: ["shoulder_overhead", "wrist"], scaling: { beginnerMovement: "Step-Back Burpee (ohne Sprung)" } },
  { id: "box-jump", name: "Box Jump", category: "monostructural", pattern: "squat", equipment: ["box"], difficulty: "intermediate", muscles: ["quads", "glutes", "calves"], role: "conditioning", timePerRep: 3, repRange: { min: 10, max: 18 }, tags: [], injuryFlags: ["knee", "ankle"], scaling: { beginnerMovement: "Step-Up" } },
  { id: "row-erg", name: "Rudergerät", category: "monostructural", pattern: "hinge", equipment: ["rower"], difficulty: "beginner", muscles: ["full_body"], role: "conditioning", unit: "calories", timePerRep: 3, repRange: { min: 10, max: 20 }, tags: [], injuryFlags: ["lower_back"] },
  { id: "assault-bike", name: "Assault Bike", category: "monostructural", pattern: "push", equipment: ["bike"], difficulty: "beginner", muscles: ["full_body"], role: "conditioning", unit: "calories", timePerRep: 3, repRange: { min: 10, max: 20 }, tags: [], injuryFlags: [] },
  { id: "double-under", name: "Double Under", category: "monostructural", pattern: "core", equipment: ["jump_rope"], difficulty: "intermediate", muscles: ["calves", "core"], role: "conditioning", timePerRep: 0.6, repRange: { min: 30, max: 50 }, tags: [], injuryFlags: ["ankle"], scaling: { beginnerMovement: "Single Under (2x Reps)" } },
  { id: "pull-up", family: "pull-up", name: "Pull-Up", category: "gymnastics", pattern: "pull", equipment: ["pullup_bar"], difficulty: "intermediate", muscles: ["lats", "biceps", "core"], role: "both", timePerRep: 1.5, repRange: { min: 6, max: 12 }, tags: [], injuryFlags: ["shoulder_overhead"], scaling: { beginnerMovement: "Ring Row" } },
  { id: "push-up", name: "Push-Up", category: "gymnastics", pattern: "push", equipment: ["bodyweight"], difficulty: "beginner", muscles: ["chest", "triceps"], role: "both", timePerRep: 1, repRange: { min: 12, max: 20 }, tags: [], injuryFlags: ["shoulder_overhead", "wrist"], scaling: { beginnerMovement: "Knee Push-Up" } },
  { id: "toes-to-bar", name: "Toes-to-Bar", category: "gymnastics", pattern: "core", equipment: ["pullup_bar"], difficulty: "advanced", muscles: ["core", "lats"], role: "both", timePerRep: 2, repRange: { min: 5, max: 12 }, tags: [], injuryFlags: ["shoulder_overhead", "lower_back"], scaling: { beginnerMovement: "Hanging Knee Tucks" } },
  { id: "ring-dip", name: "Ring Dip", category: "gymnastics", pattern: "push", equipment: ["rings"], difficulty: "advanced", muscles: ["chest", "triceps"], role: "both", timePerRep: 1, repRange: { min: 5, max: 12 }, tags: [], injuryFlags: ["shoulder_overhead", "wrist"], scaling: { beginnerMovement: "Bench Dip" } },
  { id: "plank", family: "plank", name: "Plank", category: "gymnastics", pattern: "core", equipment: ["bodyweight"], difficulty: "beginner", muscles: ["core", "shoulders"], role: "strength", unit: "seconds", tags: [], injuryFlags: ["shoulder_overhead", "lower_back"], scaling: { beginnerMovement: "Knee Plank" } },
  { id: "db-bench-press", name: "Dumbbell Bench Press", category: "strength", pattern: "push", equipment: ["dumbbells", "bench"], difficulty: "intermediate", muscles: ["chest", "triceps", "shoulders"], role: "strength", timePerRep: 2, repRange: { min: 8, max: 15 }, tags: ["compound"], injuryFlags: ["shoulder_overhead", "wrist"], scaling: { weight: { male: { min: 15, max: 25 }, female: { min: 8, max: 15 } }, beginnerMovement: "Push-Up" } },
  { id: "db-snatch", family: "snatch", name: "Dumbbell Snatch", category: "strength", pattern: "olympic", equipment: ["dumbbells"], difficulty: "intermediate", muscles: ["shoulders", "glutes", "core"], role: "both", timePerRep: 2, repRange: { min: 6, max: 12 }, tags: [], injuryFlags: ["shoulder_overhead", "lower_back"], scaling: { weight: { male: { min: 16, max: 30 }, female: { min: 10, max: 20 } }, beginnerMovement: "Kettlebell Swing" } },
  { id: "renegade-row", name: "Renegade Row", category: "strength", pattern: "pull", equipment: ["dumbbells"], difficulty: "intermediate", muscles: ["lats", "core", "shoulders"], role: "strength", timePerRep: 1.5, repRange: { min: 8, max: 14 }, tags: [], injuryFlags: ["wrist", "shoulder_overhead"], scaling: { weight: { male: { min: 12, max: 22 }, female: { min: 8, max: 15 } }, perDumbbell: true, beginnerMovement: "Plank Row (ohne Gewicht)" } },
  { id: "bulgarian-split-squat", family: "squat", name: "Bulgarian Split Squat", category: "strength", pattern: "squat", equipment: ["dumbbells", "bench"], difficulty: "intermediate", muscles: ["quads", "glutes"], role: "strength", timePerRep: 1.5, repRange: { min: 8, max: 16 }, tags: [], injuryFlags: ["knee"], scaling: { weight: { male: { min: 12, max: 22 }, female: { min: 8, max: 14 } }, perDumbbell: true, beginnerMovement: "Bodyweight Split Squat" } },
  { id: "box-step-up", name: "Box Step-Up", category: "monostructural", pattern: "squat", equipment: ["box"], difficulty: "beginner", muscles: ["quads", "glutes"], role: "conditioning", timePerRep: 3, repRange: { min: 12, max: 20 }, tags: [], injuryFlags: ["knee", "ankle"], scaling: { beginnerMovement: "Step-Up, niedrigere Box, ohne Zusatzgewicht" } },
  { id: "bench-press", name: "Bench Press", category: "strength", pattern: "push", equipment: ["barbell", "bench"], difficulty: "intermediate", muscles: ["chest", "triceps", "shoulders"], role: "strength", timePerRep: 2, repRange: { min: 8, max: 15 }, tags: ["compound"], injuryFlags: ["shoulder_overhead", "wrist"], scaling: { weight: { male: { min: 50, max: 75 }, female: { min: 30, max: 45 } }, beginnerMovement: "Push-Up" } },
  { id: "burpee-box-jump", family: "burpee", name: "Burpee Box Jump", category: "monostructural", pattern: "core", equipment: ["box"], difficulty: "intermediate", muscles: ["full_body"], role: "conditioning", timePerRep: 4, repRange: { min: 8, max: 14 }, tags: [], injuryFlags: ["knee", "ankle", "shoulder_overhead", "wrist"], scaling: { beginnerMovement: "Burpee + Step-Up" } },
  { id: "burpee-box-jump-over", family: "burpee", name: "Burpee Box Jump Over", category: "monostructural", pattern: "core", equipment: ["box"], difficulty: "advanced", muscles: ["full_body"], role: "conditioning", timePerRep: 4, repRange: { min: 8, max: 14 }, tags: [], injuryFlags: ["knee", "ankle", "shoulder_overhead", "wrist"], scaling: { beginnerMovement: "Burpee + Step-Over" } },
  { id: "bar-facing-burpee", family: "burpee", name: "Bar Facing Burpee", category: "monostructural", pattern: "core", equipment: ["barbell"], difficulty: "intermediate", muscles: ["full_body"], role: "conditioning", timePerRep: 4, repRange: { min: 8, max: 15 }, tags: [], injuryFlags: ["shoulder_overhead", "wrist", "ankle"], scaling: { beginnerMovement: "Burpee ohne Überqueren" } },
  { id: "lateral-burpee", family: "burpee", name: "Lateral Burpee", category: "monostructural", pattern: "core", equipment: ["bodyweight"], difficulty: "beginner", muscles: ["full_body"], role: "conditioning", timePerRep: 3, repRange: { min: 8, max: 15 }, tags: [], injuryFlags: ["shoulder_overhead", "wrist", "ankle"], scaling: { beginnerMovement: "Step-Back Burpee seitlich" } },
  { id: "ski-erg", name: "SkiErg", category: "monostructural", pattern: "pull", equipment: ["ski_erg"], difficulty: "beginner", muscles: ["full_body", "lats"], role: "conditioning", unit: "calories", timePerRep: 4, repRange: { min: 10, max: 20 }, tags: [], injuryFlags: ["shoulder_overhead", "lower_back"] },
  { id: "power-snatch", family: "snatch", name: "Power Snatch", category: "strength", pattern: "olympic", equipment: ["barbell"], difficulty: "advanced", muscles: ["shoulders", "glutes", "hamstrings", "core"], role: "both", timePerRep: 3, repRange: { min: 4, max: 8 }, tags: [], injuryFlags: ["shoulder_overhead", "lower_back"], scaling: { weight: { male: { min: 40, max: 70 }, female: { min: 27.5, max: 47.5 } }, beginnerMovement: "Dumbbell Snatch" } },
  { id: "squat-snatch", family: "snatch", name: "Squat Snatch", category: "strength", pattern: "olympic", equipment: ["barbell"], difficulty: "advanced", muscles: ["shoulders", "glutes", "hamstrings", "core", "quads"], role: "both", timePerRep: 4, repRange: { min: 3, max: 6 }, tags: [], injuryFlags: ["shoulder_overhead", "lower_back", "knee"], scaling: { weight: { male: { min: 40, max: 70 }, female: { min: 27.5, max: 47.5 } }, beginnerMovement: "Dumbbell Snatch" } },
  { id: "power-clean", family: "clean", name: "Power Clean", category: "strength", pattern: "olympic", equipment: ["barbell"], difficulty: "intermediate", muscles: ["glutes", "hamstrings", "shoulders", "core"], role: "both", timePerRep: 3, repRange: { min: 5, max: 10 }, tags: [], injuryFlags: ["lower_back", "shoulder_overhead"], scaling: { weight: { male: { min: 40, max: 100 }, female: { min: 30, max: 65 } }, beginnerMovement: "Kettlebell Clean & Press" } },
  { id: "squat-clean", family: "clean", name: "Squat Clean", category: "strength", pattern: "olympic", equipment: ["barbell"], difficulty: "advanced", muscles: ["glutes", "hamstrings", "quads", "shoulders", "core"], role: "both", timePerRep: 4, repRange: { min: 4, max: 8 }, tags: [], injuryFlags: ["lower_back", "shoulder_overhead", "knee"], scaling: { weight: { male: { min: 40, max: 100 }, female: { min: 30, max: 65 } }, beginnerMovement: "Kettlebell Clean & Press" } },
  { id: "push-jerk", family: "jerk", name: "Push Jerk", category: "strength", pattern: "push", equipment: ["barbell"], difficulty: "intermediate", muscles: ["shoulders", "triceps", "core"], role: "strength", timePerRep: 2, repRange: { min: 6, max: 12 }, tags: ["compound"], injuryFlags: ["shoulder_overhead"], scaling: { weight: { male: { min: 35, max: 55 }, female: { min: 25, max: 40 } }, beginnerMovement: "Dumbbell Shoulder Press" } },
  { id: "push-press", name: "Push Press", category: "strength", pattern: "push", equipment: ["barbell"], difficulty: "intermediate", muscles: ["shoulders", "triceps", "core"], role: "strength", timePerRep: 2, repRange: { min: 6, max: 12 }, tags: ["compound"], injuryFlags: ["shoulder_overhead"], scaling: { weight: { male: { min: 30, max: 50 }, female: { min: 20, max: 35 } }, beginnerMovement: "Dumbbell Shoulder Press" } },
  { id: "butterfly-pull-up", family: "pull-up", name: "Butterfly Pull-up", category: "gymnastics", pattern: "pull", equipment: ["pullup_bar"], difficulty: "advanced", muscles: ["lats", "biceps", "core"], role: "both", timePerRep: 1.5, repRange: { min: 8, max: 15 }, tags: [], injuryFlags: ["shoulder_overhead"], scaling: { beginnerMovement: "Ring Row" } },
  { id: "chest-to-bar-pull-up", family: "pull-up", name: "Chest-to-Bar Pull-up", category: "gymnastics", pattern: "pull", equipment: ["pullup_bar"], difficulty: "advanced", muscles: ["lats", "biceps", "core"], role: "both", timePerRep: 2, repRange: { min: 6, max: 12 }, tags: [], injuryFlags: ["shoulder_overhead"], scaling: { beginnerMovement: "Ring Row" } },
  { id: "clean-and-jerk", family: "clean", name: "Clean and Jerk", category: "strength", pattern: "olympic", equipment: ["barbell"], difficulty: "advanced", muscles: ["glutes", "hamstrings", "shoulders", "core", "quads"], role: "both", timePerRep: 3, repRange: { min: 4, max: 8 }, tags: ["compound"], injuryFlags: ["shoulder_overhead", "lower_back", "knee"], scaling: { weight: { male: { min: 40, max: 100 }, female: { min: 28, max: 70 } }, beginnerMovement: "Kettlebell Clean & Press" } },
  { id: "devil-press", name: "Devil Press", category: "monostructural", pattern: "olympic", equipment: ["dumbbells"], difficulty: "advanced", muscles: ["full_body"], role: "conditioning", timePerRep: 5, repRange: { min: 6, max: 12 }, tags: [], injuryFlags: ["shoulder_overhead", "lower_back", "wrist"], scaling: { weight: { male: { min: 15, max: 25 }, female: { min: 8, max: 15 } }, beginnerMovement: "Burpee + Dumbbell Swing" } },
  { id: "farmers-carry", name: "Farmers Carry", category: "monostructural", pattern: "carry", equipment: ["dumbbells"], difficulty: "beginner", muscles: ["core", "full_body"], role: "conditioning", unit: "meters", timePerMeter: 1, tags: [], injuryFlags: ["lower_back"], scaling: { weight: { male: { min: 20, max: 32 }, female: { min: 12, max: 20 } } } },
  { id: "front-squat", family: "squat", name: "Front Squat", category: "strength", pattern: "squat", equipment: ["barbell", "rack"], difficulty: "intermediate", muscles: ["quads", "glutes", "core"], role: "strength", timePerRep: 3, repRange: { min: 5, max: 10 }, tags: ["compound"], injuryFlags: ["knee", "lower_back"], scaling: { weight: { male: { min: 45, max: 70 }, female: { min: 30, max: 45 } }, beginnerMovement: "Bodyweight Squat" } },
  { id: "good-morning", name: "Good Morning", category: "strength", pattern: "hinge", equipment: ["barbell"], difficulty: "intermediate", muscles: ["hamstrings", "lower_back", "glutes"], role: "strength", timePerRep: 2, repRange: { min: 8, max: 15 }, tags: [], injuryFlags: ["lower_back"], scaling: { weight: { male: { min: 30, max: 50 }, female: { min: 20, max: 30 } }, beginnerMovement: "Kettlebell Deadlift" } },
  { id: "handstand-push-up", name: "Handstand Push-up", category: "gymnastics", pattern: "push", equipment: ["wall"], difficulty: "advanced", muscles: ["shoulders", "triceps", "core"], role: "strength", timePerRep: 2, repRange: { min: 3, max: 8 }, tags: [], injuryFlags: ["shoulder_overhead", "wrist"], scaling: { beginnerMovement: "Pike Push-Up" } },
  { id: "handstand-walk", name: "Handstand Walk", category: "gymnastics", pattern: "push", equipment: ["wall"], difficulty: "advanced", muscles: ["shoulders", "core"], role: "both", unit: "meters", timePerMeter: 2, tags: [], injuryFlags: ["shoulder_overhead", "wrist"] },
  { id: "hanging-knee-raise", name: "Hanging Knee Raise", category: "gymnastics", pattern: "core", equipment: ["pullup_bar"], difficulty: "intermediate", muscles: ["core", "hip_flexors"], role: "strength", timePerRep: 1.8, repRange: { min: 8, max: 15 }, tags: [], injuryFlags: ["shoulder_overhead", "lower_back"], scaling: { beginnerMovement: "Knee Raise im Stehen" } },
  { id: "kipping-pull-up", family: "pull-up", name: "Kipping Pull-up", category: "gymnastics", pattern: "pull", equipment: ["pullup_bar"], difficulty: "intermediate", muscles: ["lats", "biceps", "core"], role: "both", timePerRep: 1.3, repRange: { min: 8, max: 15 }, tags: [], injuryFlags: ["shoulder_overhead"], scaling: { beginnerMovement: "Ring Row" } },
  { id: "lunge", family: "lunge", name: "Lunge", category: "monostructural", pattern: "squat", equipment: ["bodyweight"], difficulty: "beginner", muscles: ["quads", "glutes"], role: "conditioning", timePerRep: 4, repRange: { min: 12, max: 20 }, tags: [], injuryFlags: ["knee"] },
  { id: "dumbbell-lunge", family: "lunge", name: "Dumbbell Lunge", category: "strength", pattern: "squat", equipment: ["dumbbells"], difficulty: "intermediate", muscles: ["quads", "glutes", "core"], role: "both", timePerRep: 3, repRange: { min: 10, max: 16 }, tags: [], injuryFlags: ["knee"], scaling: { weight: { male: { min: 12, max: 22 }, female: { min: 8, max: 14 } }, perDumbbell: true, beginnerMovement: "Bodyweight Lunge" } },
  { id: "man-maker", name: "Man Maker", category: "monostructural", pattern: "olympic", equipment: ["dumbbells"], difficulty: "advanced", muscles: ["full_body"], role: "conditioning", timePerRep: 8, repRange: { min: 5, max: 10 }, tags: [], injuryFlags: ["shoulder_overhead", "wrist", "lower_back"], scaling: { weight: { male: { min: 15, max: 25 }, female: { min: 8, max: 15 } }, beginnerMovement: "Devil Press (ohne Ausfallschritt)" } },
  { id: "mountain-climber", name: "Mountain Climber", category: "monostructural", pattern: "core", equipment: ["bodyweight"], difficulty: "beginner", muscles: ["core", "full_body"], role: "conditioning", timePerRep: 0.5, repRange: { min: 20, max: 40 }, tags: [], injuryFlags: ["wrist"] },
  { id: "muscle-up", family: "pull-up", name: "Muscle-up", category: "gymnastics", pattern: "pull", equipment: ["pullup_bar"], difficulty: "advanced", muscles: ["lats", "triceps", "core", "shoulders"], role: "both", timePerRep: 4, repRange: { min: 2, max: 6 }, tags: [], injuryFlags: ["shoulder_overhead", "wrist"], scaling: { beginnerMovement: "Chest-to-Bar Pull-up + Dip" } },
  { id: "overhead-squat", family: "squat", name: "Overhead Squat", category: "strength", pattern: "squat", equipment: ["barbell"], difficulty: "advanced", muscles: ["quads", "glutes", "shoulders", "core"], role: "both", timePerRep: 3, repRange: { min: 6, max: 12 }, tags: [], injuryFlags: ["shoulder_overhead", "knee", "lower_back"], scaling: { weight: { male: { min: 30, max: 50 }, female: { min: 20, max: 35 } }, beginnerMovement: "Goblet Squat" } },
  { id: "pistol-squat", family: "squat", name: "Pistol Squat", category: "gymnastics", pattern: "squat", equipment: ["bodyweight"], difficulty: "advanced", muscles: ["quads", "glutes", "core"], role: "both", timePerRep: 3, repRange: { min: 5, max: 10 }, tags: [], injuryFlags: ["knee", "ankle"], scaling: { beginnerMovement: "Box Pistol Squat" } },
  { id: "ring-muscle-up", family: "pull-up", name: "Ring Muscle-up", category: "gymnastics", pattern: "pull", equipment: ["rings"], difficulty: "advanced", muscles: ["lats", "triceps", "core", "shoulders"], role: "both", timePerRep: 4, repRange: { min: 2, max: 5 }, tags: [], injuryFlags: ["shoulder_overhead", "wrist"], scaling: { beginnerMovement: "Ring Dip + Ring Row" } },
  { id: "rope-climb", name: "Rope Climb", category: "gymnastics", pattern: "pull", equipment: ["climbing_rope"], difficulty: "advanced", muscles: ["lats", "biceps", "core"], role: "both", unit: "meters", timePerMeter: 4, tags: [], injuryFlags: ["shoulder_overhead", "wrist"] },
  { id: "sandbag-carry", name: "Sandbag Carry", category: "monostructural", pattern: "carry", equipment: ["sandbag"], difficulty: "beginner", muscles: ["core", "full_body"], role: "conditioning", unit: "meters", timePerMeter: 1, tags: [], injuryFlags: ["lower_back"], scaling: { weight: { male: { min: 30, max: 50 }, female: { min: 20, max: 30 } } } },
  { id: "sit-up", family: "sit-up", name: "Sit-up", category: "gymnastics", pattern: "core", equipment: ["bodyweight"], difficulty: "beginner", muscles: ["core"], role: "both", timePerRep: 2, repRange: { min: 15, max: 25 }, tags: [], injuryFlags: ["lower_back"] },
  { id: "butterfly-sit-up", family: "sit-up", name: "Butterfly Sit-up", category: "gymnastics", pattern: "core", equipment: ["bodyweight"], difficulty: "intermediate", muscles: ["core", "hip_flexors"], role: "both", timePerRep: 1, repRange: { min: 15, max: 25 }, tags: [], injuryFlags: ["lower_back"], scaling: { beginnerMovement: "Sit-up" } },
  { id: "split-jerk", family: "jerk", name: "Split Jerk", category: "strength", pattern: "push", equipment: ["barbell"], difficulty: "advanced", muscles: ["shoulders", "triceps", "legs", "core"], role: "strength", timePerRep: 3, repRange: { min: 5, max: 10 }, tags: ["compound"], injuryFlags: ["shoulder_overhead", "knee"], scaling: { beginnerMovement: "Push Jerk" } },
  { id: "sumo-deadlift-high-pull", name: "Sumo Deadlift High Pull", category: "strength", pattern: "hinge", equipment: ["barbell"], difficulty: "intermediate", muscles: ["hamstrings", "glutes", "shoulders", "lower_back"], role: "strength", timePerRep: 2, repRange: { min: 10, max: 18 }, tags: [], injuryFlags: ["lower_back", "shoulder_overhead"], scaling: { weight: { male: { min: 35, max: 55 }, female: { min: 20, max: 35 } }, beginnerMovement: "Kettlebell Swing" } },
  { id: "thruster", name: "Thruster", category: "strength", pattern: "squat", equipment: ["barbell"], difficulty: "advanced", muscles: ["quads", "glutes", "shoulders", "core"], role: "both", timePerRep: 3, repRange: { min: 6, max: 12 }, tags: ["compound"], injuryFlags: ["shoulder_overhead", "knee", "lower_back"], scaling: { weight: { male: { min: 35, max: 55 }, female: { min: 25, max: 40 } }, beginnerMovement: "Goblet Squat + Press" } },
  { id: "air-squat", family: "squat", name: "Air Squat", category: "monostructural", pattern: "squat", equipment: ["bodyweight"], difficulty: "beginner", muscles: ["quads", "glutes"], role: "both", timePerRep: 1.2, repRange: { min: 15, max: 25 }, tags: [], injuryFlags: ["knee"] },
  { id: "run", name: "Run", category: "monostructural", pattern: "hinge", equipment: ["bodyweight"], difficulty: "beginner", muscles: ["full_body"], role: "conditioning", unit: "meters", timePerMeter: 0.3, tags: [], injuryFlags: ["knee", "ankle"] },
];

const EXERCISE_BY_ID = Object.fromEntries(EXERCISES.map((ex) => [ex.id, ex]));

const EQUIPMENT_OPTIONS = [
  { id: "bodyweight", label: "Nur Körpergewicht" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "barbell", label: "Langhantel" },
  { id: "rack", label: "Rack" },
  { id: "dumbbells", label: "Kurzhanteln" },
  { id: "bench", label: "Bank" },
  { id: "weight_vest", label: "Gewichtsweste" },
  { id: "pullup_bar", label: "Klimmzugstange" },
  { id: "box", label: "Box" },
  { id: "rower", label: "Rudergerät" },
  { id: "bike", label: "Bike" },
  { id: "wall", label: "Wand" },
  { id: "medicine_ball", label: "Medizinball" },
  { id: "jump_rope", label: "Springseil" },
  { id: "rings", label: "Ringe" },
  { id: "ski_erg", label: "SkiErg" },
  { id: "climbing_rope", label: "Kletterseil" },
  { id: "sandbag", label: "Sandsack" },
  { id: "sled", label: "Schlitten" },
];

// Kondition-Tab braucht nur eine Teilmenge — Langhantel,
// Rack, Bank, Wand, Ringe und Kletterseil sind für keine HYROX-Station relevant.
const KONDITION_EXCLUDED_EQUIPMENT = new Set(["barbell", "rack", "bench", "rings", "climbing_rope"]);
const KONDITION_EQUIPMENT_OPTIONS = EQUIPMENT_OPTIONS.filter((opt) => !KONDITION_EXCLUDED_EQUIPMENT.has(opt.id));

const EXCLUDE_OPTIONS = [
  { id: "shoulder_overhead", label: "Schulter (Overhead)" },
  { id: "lower_back", label: "Unterer Rücken" },
  { id: "knee", label: "Knie" },
  { id: "wrist", label: "Handgelenk" },
  { id: "ankle", label: "Sprunggelenk" },
];

const FORMAT_OPTIONS = [
  { id: "amrap", label: "AMRAP" },
  { id: "for_time", label: "For Time" },
  { id: "emom", label: "EMOM" },
  { id: "chipper", label: "Chipper" },
  { id: "ladder", label: "Ladder" },
  { id: "descending", label: "21-15-9" },
  { id: "tabata", label: "Tabata" },
  { id: "death_by", label: "Death By" },
  { id: "fgb", label: "Fight Gone Bad" },
  { id: "sprint", label: "Sprint" },
  { id: "varying_rounds", label: "Variable Runden" },
];

const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };
const INTENSITY_PROFILES = {
  strength: { min: 1, max: 6, rest: "lang (2-4 Min)", load: "70-90 % 1RM" },
  conditioning: { min: 10, max: 20, rest: "kurz / keine", load: "moderat, wiederholbar" },
  combination: { min: 5, max: 15, rest: "gemischt", load: "Strength hoch, Rest moderat" },
};

// Rohbewegungszeit (Reps × timePerRep) → reale Workout-Zeit. Niemand bewegt
// sich ohne Pause/Übergänge/Ermüdung — Beginner brauchen anteilig mehr Puffer.
const LEVEL_PACE_FACTOR = { beginner: 1.9, intermediate: 1.5, advanced: 1.2 };

// Welcher Anteil des Time Caps als Zielzeit angepeilt wird
const INTENSITY_TARGET_FRACTION = { locker: 0.65, normal: 0.85, brutal: 1.0 };
const INTENSITY_OPTIONS = [
  { id: "locker", label: "locker" },
  { id: "normal", label: "normal" },
  { id: "brutal", label: "brutal" },
];

// Level-Auswahl im Dashboard beeinflusst NICHT mehr die Last (die Tabelle
// liefert nur ein "Standardgewicht" pro Geschlecht, keine Rx/Scaled-Stufen).
// Für Level "Einsteiger" wird stattdessen — falls hinterlegt — eine
// Skalierungsbewegung statt eines Gewichts angezeigt.

// Distanzbasierte Übungen (Carry, Climb, Walk) rechnen über Meter statt Reps.
// Damit die vorhandenen Rep-Bereiche (INTENSITY_PROFILES, repRange)
// auch für Meter plausible Werte liefern, werden sie mit diesem Faktor skaliert.
const METERS_MULTIPLIER = 12;

// Zeit-Halteübungen (Plank etc.) rechnen über Sekunden statt Reps. Ohne diesen
// Faktor + eine Mindesthaltezeit könnten aus generischen Rep-Bereichen (z.B.
// 1-6 bei Fokus "Kraft") absurd kurze Zeiten wie "3 Sekunden Plank" entstehen,
// die trainingswirksam wertlos sind.
const SECONDS_MULTIPLIER = 5;
const MIN_HOLD_SECONDS = 15;

function isDistanceBased(ex) {
  return ex.unit === "meters";
}

function isTimeBased(ex) {
  return ex.unit === "seconds";
}

function isCalorieBased(ex) {
  return ex.unit === "calories";
}

/** Zeit pro Einheit (Rep, Meter, Sekunde oder Kalorie) einer Übung — zentrale Stelle statt ex.timePerRep direkt zu lesen. */
function unitTime(ex) {
  if (isDistanceBased(ex)) return ex.timePerMeter;
  if (isTimeBased(ex)) return 1; // 1 Einheit = 1 Sekunde Arbeit, per Definition
  return ex.timePerRep; // gilt auch für "calories": timePerRep = Sekunden pro Kalorie
}

/** "12x" für Reps, "144m" für Distanz-, "45s" für Zeit-, "12 Cal" für Kalorien-Übungen. */
function formatAmount(ex, qty) {
  if (isDistanceBased(ex)) return `${qty}m`;
  if (isTimeBased(ex)) return `${qty}s`;
  if (isCalorieBased(ex)) return `${qty} Cal`;
  return `${qty}x`;
}

/** Reps/Meter/Sekunden aus einem Intensitätsprofil ziehen, mit passender Skalierung + Mindestwert je Einheit. */
function pickQty(ex, profile) {
  const raw = pickReps(profile);
  if (isDistanceBased(ex)) return raw * METERS_MULTIPLIER;
  if (isTimeBased(ex)) return Math.max(MIN_HOLD_SECONDS, raw * SECONDS_MULTIPLIER);
  return raw;
}

/**
 * Wie pickQty, nutzt aber — falls hinterlegt — den recherchierten, übungs-
 * spezifischen Rep-/Kalorien-Bereich (ex.repRange) statt des generischen
 * Fokus-Profils. Ein Sit-up braucht z.B. deutlich mehr Wiederholungen pro
 * Runde als ein Snatch, auch wenn beide unter "Kombination" fallen — das
 * generische Profil allein kann das nicht abbilden. Fällt auf pickQty()
 * zurück, wenn für die Übung kein eigener Bereich hinterlegt ist.
 */
function pickQtyForExercise(ex, profile) {
  if (ex.repRange) {
    const { min, max } = ex.repRange;
    return Math.round(min + Math.random() * (max - min));
  }
  return pickQty(ex, profile);
}

/** Sinnvoller Mindestwert je Einheitstyp, für Zeit-Cap-Skalierung & Zeitbudget-Formate (EMOM/FGB/Tabata). Nutzt bevorzugt den recherchierten repRange der Übung. */
function qtyFloor(ex) {
  if (ex.repRange) return ex.repRange.min;
  if (isDistanceBased(ex)) return 10;
  if (isTimeBased(ex)) return MIN_HOLD_SECONDS;
  if (isCalorieBased(ex)) return 10;
  return 3;
}

/** Min/Max für zeitbudget-basierte Formate (EMOM/FGB/Tabata), je Einheitstyp. Nutzt bevorzugt den recherchierten repRange der Übung. */
function qtyBounds(ex) {
  if (ex.repRange) return { min: ex.repRange.min, max: ex.repRange.max };
  if (isDistanceBased(ex)) return { min: 10, max: 400 };
  if (isTimeBased(ex)) return { min: MIN_HOLD_SECONDS, max: 90 };
  if (isCalorieBased(ex)) return { min: 10, max: 40 };
  return { min: 5, max: 40 };
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Text robust in die Zwischenablage kopieren, mit Fallback-Kette:
 * 1) navigator.clipboard (moderner Weg, braucht HTTPS/localhost)
 * 2) document.execCommand('copy') über verstecktes Textfeld
 * 3) window.prompt() mit vormarkiertem Text als letzter Ausweg
 * Ruft onSuccess()/onFailure() je nach Ergebnis auf.
 */
function copyToClipboard(text, onSuccess, onFailure) {
  const legacyCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  };
  const promptFallback = () => {
    window.prompt("Kopieren nicht automatisch möglich — Text ist markiert, mit Strg+C / Cmd+C manuell kopieren:", text);
    onFailure();
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
      if (legacyCopy()) onSuccess();
      else promptFallback();
    });
  } else if (legacyCopy()) {
    onSuccess();
  } else {
    promptFallback();
  }
}


/** Rohbewegungszeit (Sekunden), die ein Workout laut Cap/Level/Intensität füllen soll. */
function targetRawSeconds(capMin, level, intensity) {
  const targetElapsed = capMin * 60 * (INTENSITY_TARGET_FRACTION[intensity] ?? 0.85);
  const pace = LEVEL_PACE_FACTOR[level] ?? 1.5;
  return targetElapsed / pace;
}

/**
 * Lastvorgabe für eine Übung: bei Level "Einsteiger" bevorzugt die hinterlegte
 * Skalierungsbewegung (falls vorhanden), sonst das Standardgewicht fürs
 * gewählte Geschlecht. Übungen ohne scaling-Daten liefern null.
 */
const WEIGHT_ROUND_STEP = 2.5; // kg — übliche Plattenabstufung, auch als grobe Näherung für KB/DB-Sprünge

/**
 * Löst einen scaling.weight-Eintrag zu einem Anzeige-String auf. Zwei Formen:
 * - Fixer String (z.B. "9kg"): Übung wird laut Recherche praktisch immer mit
 *   demselben Gewicht gefahren (z.B. Wall Ball 20/14lb) — unverändert übernehmen.
 * - { min, max }: übliche WOD-Ladung variiert real spürbar — bei jeder
 *   Generierung wird neu gewürfelt, auf 2.5kg gerundet.
 */
function resolveWeightValue(entry, perDumbbell) {
  if (typeof entry === "string") return entry;
  if (!entry) return null;
  const raw = entry.min + Math.random() * (entry.max - entry.min);
  const rounded = Math.round(raw / WEIGHT_ROUND_STEP) * WEIGHT_ROUND_STEP;
  const clean = Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
  return perDumbbell ? `2×${clean}kg` : `${clean}kg`;
}

function getLoadDisplay(ex, level, gender) {
  const s = ex.scaling;
  if (!s) return null;
  if (level === "beginner" && s.beginnerMovement) {
    return { kind: "movement", value: s.beginnerMovement };
  }
  if (s.weight && s.weight[gender]) {
    return { kind: "weight", value: resolveWeightValue(s.weight[gender], s.perDumbbell) };
  }
  return null;
}

/* ============================================================
   LOGIK — portiert aus filter_exercises.py / workout_builder.py
   ============================================================ */
function filterExercises(pool, input) {
  let result = pool;
  if (input.equipment?.length) {
    const avail = new Set(input.equipment);
    result = result.filter((ex) => ex.equipment.every((e) => avail.has(e)));
  }
  if (input.exclude?.length) {
    const excl = new Set(input.exclude);
    result = result.filter((ex) => !ex.injuryFlags.some((f) => excl.has(f)) && !excl.has(ex.id));
  }
  if (input.level) {
    const maxLevel = DIFFICULTY_ORDER[input.level];
    result = result.filter((ex) => DIFFICULTY_ORDER[ex.difficulty] <= maxLevel);
  }
  if (input.focus && input.focus !== "combination") {
    result = result.filter((ex) => ex.role === input.focus || ex.role === "both");
  }
  return result;
}

function muscleOverlap(a, b) {
  return a.muscles.some((m) => b.muscles.includes(m));
}

/**
 * Gewichtsweste ist kein exklusives Equipment für bestimmte Übungen — sie
 * lässt sich bei praktisch jeder Übung als Zusatzlast tragen. Deshalb
 * schränkt sie den Übungspool nicht ein; stattdessen wird sie als globaler
 * Hinweis ans Workout angehängt, wenn der Nutzer sie ausgewählt hat.
 */
function vestNote(hasVest) {
  return hasVest ? " Optional: Gewichtsweste für Zusatzlast bei allen Übungen tragen." : "";
}

function pickBalanced(pool, n, categoryHint) {
  const thresholds = [
    { overlap: 2, pattern: 2, family: true },
    { overlap: 3, pattern: 3, family: true },
    { overlap: 999, pattern: 999, family: false },
  ];
  let relaxed = false;

  for (let stage = 0; stage < thresholds.length; stage++) {
    const { overlap: maxOverlap, pattern: maxPattern, family: enforceFamily } = thresholds[stage];
    const selected = [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    const passes = (candidate) => {
      const overlapCount = selected.filter((ex) => muscleOverlap(ex, candidate)).length;
      if (overlapCount >= maxOverlap) return false;
      const patternCount = selected.filter((ex) => ex.pattern === candidate.pattern).length;
      if (patternCount >= maxPattern) return false;
      // Bewegungsfamilien (z.B. alle Burpee- oder Pull-Up-Varianten) zählen als
      // 1 Übung mit vielen Gesichtern — höchstens eine pro Workout, sonst wirkt
      // es wie "zweimal dieselbe Übung" (z.B. Burpee + Lateral Burpee).
      if (enforceFamily && candidate.family && selected.some((ex) => ex.family === candidate.family)) return false;
      return true;
    };

    if (categoryHint) {
      for (const cat of categoryHint) {
        if (selected.length >= n) break;
        const candidate = shuffled.find((ex) => ex.category === cat && !selected.includes(ex) && passes(ex));
        if (candidate) selected.push(candidate);
      }
    }
    for (const ex of shuffled) {
      if (selected.length >= n) break;
      if (!selected.includes(ex) && passes(ex)) selected.push(ex);
    }
    if (selected.length >= n || selected.length >= pool.length) {
      if (stage > 0) relaxed = true;
      return { selected, relaxed };
    }
  }
  return { selected: [], relaxed: true };
}

function pickReps(profile) {
  return Math.round(profile.min + Math.random() * (profile.max - profile.min));
}

/**
 * Wählt n Übungen mit möglichst unterschiedlichem movement_pattern.
 * Erste Runde: max. 1 Übung pro Pattern. Reicht der Pool nicht, wird mit
 * verbleibenden Übungen (auch mit wiederkehrendem Pattern) aufgefüllt.
 * Genutzt für EMOM (Schritt 3: unterschiedliche Pattern pro Minute) und
 * Chipper (Schritt 3: große Bewegungsvielfalt).
 */
function pickDiversePatterns(pool, n) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = [];
  const usedPatterns = new Set();
  const usedFamilies = new Set();

  for (const ex of shuffled) {
    if (selected.length >= n) break;
    if (!usedPatterns.has(ex.pattern) && !(ex.family && usedFamilies.has(ex.family))) {
      selected.push(ex);
      usedPatterns.add(ex.pattern);
      if (ex.family) usedFamilies.add(ex.family);
    }
  }
  // Reicht der Pool nicht: erst Familienzwang lockern (Pattern-Diversität bleibt bevorzugt)...
  if (selected.length < n) {
    for (const ex of shuffled) {
      if (selected.length >= n) break;
      if (!selected.includes(ex) && !usedPatterns.has(ex.pattern)) {
        selected.push(ex);
        usedPatterns.add(ex.pattern);
      }
    }
  }
  // ...und erst ganz zum Schluss auch Pattern-Wiederholungen zulassen.
  if (selected.length < n) {
    for (const ex of shuffled) {
      if (selected.length >= n) break;
      if (!selected.includes(ex)) selected.push(ex);
    }
  }
  return selected;
}

// Rep-Vorgaben je Kategorie für den Chipper, gestaffelt nach gewähltem Umfang
// Umfang-Regler für Chipper: relativer Multiplikator auf den recherchierten
// repRange jeder Übung (ersetzt die frühere pauschale Kategorie-Tabelle).
const CHIPPER_VOLUME_FACTOR = { niedrig: 0.7, mittel: 1.0, hoch: 1.4 };

// Sinnvolle Options für das EMOM-Stationsintervall
const EMOM_INTERVALS = [30, 45, 60, 90];

// --- Stage 1/3: Rep-Schema- & Struktur-Templates ---

// "21-15-9"-Familie: klassische absteigende Rep-Schemata (CrossFit-Signatur-Format)
const REP_SCHEMES = [
  { id: "21-15-9", label: "21-15-9", reps: [21, 15, 9] },
  { id: "15-12-9", label: "15-12-9", reps: [15, 12, 9] },
  { id: "9-7-5", label: "9-7-5", reps: [9, 7, 5] },
  { id: "27-21-15-9", label: "27-21-15-9", reps: [27, 21, 15, 9] },
  { id: "21-18-15-12-9-6-3", label: "21-18-15-12-9-6-3", reps: [21, 18, 15, 12, 9, 6, 3] },
  { id: "50-40-30-20-10", label: "50-40-30-20-10", reps: [50, 40, 30, 20, 10] },
];

// Tabata: fixes Protokoll, 8 Runden à 20s Arbeit / 10s Pause = 4 Min pro Übung
const TABATA_WORK_SEC = 20;
const TABATA_REST_SEC = 10;
const TABATA_ROUNDS = 8;
const TABATA_BLOCK_REST_SEC = 60;

// Fight Gone Bad: 3 Runden à 5 Stationen à 1 Min, 1 Min Pause zwischen Runden
const FGB_STATION_SEC = 60;

/* ============================================================
   KONDITION-TAB — HYROX-Stationen (Stage: Compromised Running)
   Quelle: offizielles HYROX-Regelwerk (Season 25/26), FitnessVolt,
   PUMA HYROX-Guide, RITFIT, ROXFIT. Eigene Datenstruktur, da die
   Open/Pro-Divisionen unabhängig vom Level-System der anderen Tabs
   skalieren sollen (siehe Absprache).
   ============================================================ */
// Anzeigenamen der beiden Belastungsstufen (interne Schlüssel open/pro = Renngewichte der jeweiligen Vorlage)
const HYROX_DIVISIONS = { open: "Standard", pro: "Schwer" };

// Richtwert-Lauftempo für zwischengeschaltete Läufe (~4:30/km)
const HYROX_RUN_PACE_SEC_PER_M = 0.27;

// Cardiogeräte (SkiErg, Rudern, Assault Bike) laufen über Kalorien statt Meter —
// realistischer Trainings-Range statt der vollen 1000m-Renndistanz.
const HYROX_CARDIO_CAL_RANGE = [20, 40];

/**
 * Jede Station hat "variants": die offizielle Ausführung zuerst (isSubstitute:
 * false), danach Ersatzübungen in absteigender Priorität (isSubstitute: true).
 * Die erste Variante, deren requiredEquipment vollständig im ausgewählten
 * Equipment enthalten ist, wird verwendet. Die letzte Variante ist praktisch
 * immer bodyweight-only (leeres requiredEquipment) und greift damit garantiert
 * als Fallback — außer bei SkiErg/Rudern, wo als letzter Fallback bewusst
 * Burpees statt "Laufen" stehen, damit nach dem verbindenden Lauf nicht noch
 * ein zweiter Lauf als "Station" folgt.
 * timePerMeter/timePerRep sind eigene Schätzwerte (kalibriert an den
 * recherchierten Gesamtzeiten: Elite Pro ~25-30 Min für alle 8 Stationen,
 * Intermediate Open ~35-45 Min) — keine offiziellen HYROX-Splits.
 */
const HYROX_STATIONS = [
  {
    id: "hyrox-skierg", trainingFraction: [0.15, 0.3], weightVaries: false,
    variants: [
      { name: "SkiErg", unit: "calories", timePerRep: { open: 3.4, pro: 3.0 }, hasWeight: false, requiredEquipment: ["ski_erg"], isSubstitute: false },
      { name: "Assault Bike", unit: "calories", timePerRep: { open: 3.2, pro: 2.9 }, hasWeight: false, requiredEquipment: ["bike"], isSubstitute: true },
      { name: "Burpee", unit: "reps", ownRange: [20, 30], timePerRep: { open: 3.5, pro: 3.0 }, hasWeight: false, requiredEquipment: [], isSubstitute: true },
    ],
  },
  {
    id: "hyrox-sled-push", trainingFraction: [0.4, 0.65], weightVaries: true,
    variants: [
      { name: "Sled Push", unit: "meters", distance: 50, timePerMeter: { open: 4.5, pro: 6.5 }, hasWeight: true, perHand: false, requiredEquipment: ["sled"], weight: { open: { male: 152, female: 102 }, pro: { male: 202, female: 152 } }, isSubstitute: false },
      { name: "Farmers Carry", unit: "meters", distance: 100, timePerMeter: { open: 0.8, pro: 1.0 }, hasWeight: true, perHand: true, requiredEquipment: ["dumbbells"], weight: { open: { male: 24, female: 16 }, pro: { male: 32, female: 24 } }, isSubstitute: true },
      { name: "Weighted Lunge (Gewichtsweste)", unit: "meters", distance: 60, timePerMeter: { open: 3.0, pro: 3.6 }, hasWeight: true, perHand: false, requiredEquipment: ["weight_vest"], weight: { open: { male: 15, female: 10 }, pro: { male: 20, female: 15 } }, isSubstitute: true },
      { name: "Lunge", unit: "meters", distance: 60, timePerMeter: { open: 2.6, pro: 3.0 }, hasWeight: false, requiredEquipment: [], isSubstitute: true },
    ],
  },
  {
    id: "hyrox-sled-pull", trainingFraction: [0.4, 0.65], weightVaries: true,
    variants: [
      { name: "Sled Pull", unit: "meters", distance: 50, timePerMeter: { open: 3.5, pro: 5.0 }, hasWeight: true, perHand: false, requiredEquipment: ["sled"], weight: { open: { male: 103, female: 78 }, pro: { male: 153, female: 103 } }, isSubstitute: false },
      { name: "Sandbag Lunges", unit: "meters", distance: 60, timePerMeter: { open: 3.2, pro: 4.2 }, hasWeight: true, perHand: false, requiredEquipment: ["sandbag"], weight: { open: { male: 20, female: 10 }, pro: { male: 30, female: 20 } }, isSubstitute: true },
      { name: "Kettlebell Swing", unit: "reps", ownRange: [20, 40], timePerRep: { open: 1.6, pro: 1.4 }, hasWeight: true, perHand: false, requiredEquipment: ["kettlebell"], weightOptions: [24, 28], isSubstitute: true },
      { name: "Burpee", unit: "reps", ownRange: [20, 30], timePerRep: { open: 3.5, pro: 3.0 }, hasWeight: false, requiredEquipment: [], isSubstitute: true },
    ],
  },
  {
    id: "hyrox-burpee-broad-jump", trainingFraction: [0.3, 0.6], weightVaries: false,
    variants: [{ name: "Burpee Broad Jump", unit: "meters", distance: 80, timePerMeter: { open: 3.0, pro: 2.6 }, hasWeight: false, requiredEquipment: [], isSubstitute: false }],
  },
  {
    // Gleichwertige Konditions-Station wie die übrigen: nur verfügbar, wenn ein Springseil ausgewählt ist
    // (kein bodyweight-Fallback). 50-100 Wiederholungen, Zeit pro Wdh. ist ein eigener Schätzwert.
    id: "hyrox-jump-rope", trainingFraction: [0.5, 1], weightVaries: false,
    variants: [{ name: "Springseil", unit: "reps", ownRange: [50, 100], timePerRep: { open: 0.7, pro: 0.6 }, hasWeight: false, requiredEquipment: ["jump_rope"], isSubstitute: false }],
  },
  {
    id: "hyrox-row", trainingFraction: [0.15, 0.3], weightVaries: false,
    variants: [
      { name: "Rowing", unit: "calories", timePerRep: { open: 3.3, pro: 2.9 }, hasWeight: false, requiredEquipment: ["rower"], isSubstitute: false },
      { name: "SkiErg", unit: "calories", timePerRep: { open: 3.4, pro: 3.0 }, hasWeight: false, requiredEquipment: ["ski_erg"], isSubstitute: true },
      { name: "Burpee", unit: "reps", ownRange: [20, 30], timePerRep: { open: 3.5, pro: 3.0 }, hasWeight: false, requiredEquipment: [], isSubstitute: true },
    ],
  },
  {
    id: "hyrox-farmers-carry", trainingFraction: [0.3, 0.6], weightVaries: true,
    variants: [
      { name: "Farmers Carry", unit: "meters", distance: 200, timePerMeter: { open: 0.75, pro: 0.95 }, hasWeight: true, perHand: true, requiredEquipment: ["dumbbells"], weight: { open: { male: 24, female: 16 }, pro: { male: 32, female: 24 } }, isSubstitute: false },
      { name: "Farmers Carry (Kettlebell)", unit: "meters", distance: 200, timePerMeter: { open: 0.75, pro: 0.95 }, hasWeight: true, perHand: true, requiredEquipment: ["kettlebell"], weightOptions: [24, 28], isSubstitute: true },
      { name: "Sandbag Carry", unit: "meters", distance: 200, timePerMeter: { open: 0.8, pro: 1.0 }, hasWeight: true, perHand: false, requiredEquipment: ["sandbag"], weight: { open: { male: 40, female: 25 }, pro: { male: 50, female: 32 } }, isSubstitute: true },
      { name: "Lunge", unit: "meters", distance: 100, timePerMeter: { open: 4.0, pro: 4.0 }, hasWeight: false, requiredEquipment: [], isSubstitute: true },
    ],
  },
  {
    id: "hyrox-sandbag-lunges", trainingFraction: [0.3, 0.6], weightVaries: true,
    variants: [
      { name: "Sandbag Lunges", unit: "meters", distance: 100, timePerMeter: { open: 3.2, pro: 4.2 }, hasWeight: true, perHand: false, requiredEquipment: ["sandbag"], weight: { open: { male: 20, female: 10 }, pro: { male: 30, female: 20 } }, isSubstitute: false },
      { name: "Dumbbell Lunge", unit: "meters", distance: 100, timePerMeter: { open: 3.6, pro: 4.6 }, hasWeight: true, perHand: true, requiredEquipment: ["dumbbells"], weight: { open: { male: 20, female: 12 }, pro: { male: 26, female: 16 } }, isSubstitute: true },
      { name: "Front Rack Lunge", unit: "meters", distance: 100, timePerMeter: { open: 3.6, pro: 4.6 }, hasWeight: true, perHand: false, requiredEquipment: ["barbell"], weight: { open: { male: 40, female: 25 }, pro: { male: 50, female: 32 } }, isSubstitute: true },
      { name: "Lunge", unit: "meters", distance: 100, timePerMeter: { open: 4.0, pro: 4.0 }, hasWeight: false, requiredEquipment: [], isSubstitute: true },
    ],
  },
  {
    id: "hyrox-wall-balls", trainingFraction: [0.2, 0.35], weightVaries: false,
    variants: [
      { name: "Wall Balls", unit: "reps", distance: 100, timePerRep: { open: 2.2, pro: 2.6 }, hasWeight: true, perHand: false, requiredEquipment: ["medicine_ball", "wall"], weight: { open: { male: 6, female: 4 }, pro: { male: 9, female: 6 } }, isSubstitute: false },
      { name: "Kettlebell Swing", unit: "reps", ownRange: [20, 40], timePerRep: { open: 1.6, pro: 1.4 }, hasWeight: true, perHand: false, requiredEquipment: ["kettlebell"], weightOptions: [24, 28], isSubstitute: true },
      { name: "Air Squat", unit: "reps", distance: 100, timePerRep: { open: 1.4, pro: 1.2 }, hasWeight: false, requiredEquipment: [], isSubstitute: true },
    ],
  },
];

/** Erste Variante, deren Equipment-Bedarf vollständig verfügbar ist. */
function pickHyroxVariant(station, equipmentSet, excludedNames) {
  const found = station.variants.find(
    (v) => v.requiredEquipment.every((eq) => equipmentSet.has(eq)) && !(excludedNames && excludedNames.has(v.name))
  );
  // Die offiziellen Stationen enden alle mit einer bodyweight-Variante und sind damit immer
  // auflösbar. Eine Station fällt nur weg (null), wenn alle ihre Optionen abgewählt sind oder
  // ihr Equipment fehlt (z.B. Springseil).
  return found ?? null;
}

/**
 * Löst eine Stationsliste zu konkreten Übungen auf. Abgewählte Übungen (nach
 * Namen) werden übersprungen — die Station rutscht dann auf ihre nächste
 * Ausweichübung. Bleibt gar nichts übrig, werden die Ausschlüsse ignoriert,
 * damit nie ein leeres Workout entsteht.
 */
function resolveHyroxStations(stations, equipmentSet, excludedNames) {
  const resolve = (excl) =>
    stations.map((station) => ({ station, variant: pickHyroxVariant(station, equipmentSet, excl) })).filter((r) => r.variant);
  const withExclusions = resolve(excludedNames);
  return withExclusions.length > 0 ? withExclusions : resolve(new Set());
}

function hyroxUnitSeconds(variant, division) {
  return variant.unit === "meters" ? variant.timePerMeter[division] : variant.timePerRep[division];
}

function hyroxAmountLabel(variant, qty) {
  if (variant.unit === "meters") return `${qty}m`;
  if (variant.unit === "calories") return `${qty} Cal`;
  return `${qty}x`;
}

/** Rundet Distanzen auf 5m/10m, Reps auf 1, je nach Größenordnung — vermeidet krumme Werte wie "247m". */
function roundHyroxQty(raw, unit) {
  if (unit === "meters") return Math.max(5, Math.round(raw / 5) * 5);
  return Math.max(2, Math.round(raw / 2) * 2); // Wiederholungen immer gerade
}

// Gerade Kalorienzahlen, passend zu den geraden Wiederholungen
function evenCal(raw) {
  return Math.max(2, Math.round(raw / 2) * 2);
}

/**
 * Bewegungsfamilien: ähnliche Übungen sollen im Ablauf nicht direkt
 * aufeinander folgen (z.B. Burpee → Burpee Broad Jump, Dumbbell Lunge → Lunge).
 * Alles ohne Eintrag zählt als eigene Familie (= sein eigener Name).
 */
const HYROX_EXERCISE_FAMILY = {
  "Burpee": "burpee",
  "Burpee Broad Jump": "burpee",
  "Lunge": "lunge",
  "Weighted Lunge (Gewichtsweste)": "lunge",
  "Dumbbell Lunge": "lunge",
  "Front Rack Lunge": "lunge",
  "Sandbag Lunges": "lunge",
  "Farmers Carry": "carry",
  "Farmers Carry (Kettlebell)": "carry",
  "Sandbag Carry": "carry",
  "SkiErg": "erg",
  "Rowing": "erg",
  "Assault Bike": "erg",
};
function hyroxFamily(variant) {
  return HYROX_EXERCISE_FAMILY[variant.name] ?? variant.name;
}

function countAdjacentRepeats(entries, prevFamily) {
  let prev = prevFamily;
  let n = 0;
  for (const e of entries) {
    const fam = hyroxFamily(e.variant);
    if (fam === prev) n++;
    prev = fam;
  }
  return n;
}

/**
 * Ordnet Stationen so, dass keine zwei Übungen derselben Familie direkt
 * hintereinander stehen — und bleibt dabei so nah wie möglich an der
 * offiziellen HYROX-Reihenfolge (erste passende Übung zuerst). Nur wenn das
 * nicht aufgeht, wird stattdessen die jeweils häufigste Restfamilie
 * vorgezogen. prevFamily = Familie der zuletzt gezeigten Übung (Rundenwechsel).
 */
function orderWithoutRepeats(entries, prevFamily) {
  const arrange = (preferMostRemaining) => {
    const remaining = [...entries];
    const result = [];
    let prev = prevFamily;
    while (remaining.length) {
      let candidates = remaining.map((e, i) => ({ e, i })).filter(({ e }) => hyroxFamily(e.variant) !== prev);
      if (candidates.length === 0) candidates = remaining.map((e, i) => ({ e, i }));
      let pick = candidates[0];
      if (preferMostRemaining) {
        const counts = {};
        remaining.forEach((e) => {
          const f = hyroxFamily(e.variant);
          counts[f] = (counts[f] || 0) + 1;
        });
        pick = candidates.reduce((best, cur) => (counts[hyroxFamily(cur.e.variant)] > counts[hyroxFamily(best.e.variant)] ? cur : best), candidates[0]);
      }
      remaining.splice(pick.i, 1);
      result.push(pick.e);
      prev = hyroxFamily(pick.e.variant);
    }
    return result;
  };
  const inOrder = arrange(false);
  if (countAdjacentRepeats(inOrder, prevFamily) === 0) return inOrder;
  const balanced = arrange(true);
  return countAdjacentRepeats(balanced, prevFamily) < countAdjacentRepeats(inOrder, prevFamily) ? balanced : inOrder;
}

/**
 * Baut eine einzelne Stationszeile: Umfang als recherchierter Trainings-
 * Bruchteil der Renndistanz (nicht immer die volle Strecke), Gewicht ggf.
 * leicht variiert. Gibt sowohl das Board-Item als auch die Sekunden zurück,
 * damit der Aufrufer die Gesamtzeit mitzählen kann.
 */
function buildHyroxStationItem(station, variant, division, gender) {
  let qty;
  if (variant.unit === "calories") {
    const [calMin, calMax] = HYROX_CARDIO_CAL_RANGE;
    qty = evenCal(calMin + Math.random() * (calMax - calMin));
  } else if (variant.ownRange) {
    // Manche Ersatzübungen (z.B. Burpee als Fallback für SkiErg/Rudern) sind
    // eine völlig andere Bewegung als das Original — der Trainings-Bruchteil
    // der Renndistanz ergibt für sie keinen sinnvollen Wert. ownRange gibt
    // stattdessen einen eigenen, für DIESE Übung passenden Bereich vor.
    const [lo, hi] = variant.ownRange;
    qty = roundHyroxQty(lo + Math.random() * (hi - lo), variant.unit);
  } else {
    const [fracMin, fracMax] = station.trainingFraction;
    const fraction = fracMin + Math.random() * (fracMax - fracMin);
    qty = roundHyroxQty(variant.distance * fraction, variant.unit);
  }
  const stationSec = qty * hyroxUnitSeconds(variant, division);

  let load = null;
  let loadKind = null;
  if (variant.hasWeight) {
    let w;
    if (variant.weightOptions) {
      // Feste Auswahl (z.B. Kettlebells gibt es nur in festen Größen: 24 oder 28 kg)
      w = variant.weightOptions[Math.floor(Math.random() * variant.weightOptions.length)];
    } else {
      const baseWeight = variant.weight[division][gender];
      // Gewicht leicht variieren, wenn für diese Station in der Praxis üblich (Sled/Carry/Lunges,
      // nicht bei Wall Balls — die kommen in festen Ball-Größen, kein Auf-/Abladen möglich)
      w = station.weightVaries ? Math.round((baseWeight * (0.9 + Math.random() * 0.25)) / 2.5) * 2.5 : baseWeight;
    }
    load = variant.perHand ? `2×${w}kg` : `${w}kg`;
    loadKind = "weight";
  }
  return { item: { amount: hyroxAmountLabel(variant, qty), name: variant.name, load, loadKind }, stationSec };
}

/**
 * Compromised Running: kurze Läufe direkt gefolgt von einer oder mehreren
 * Stationen, mehrfach wiederholt. Real recherchierte Vorbereitungs-Workouts
 * nutzen dabei NICHT durchgehend die volle Renndistanz, sondern reduzierte,
 * von Runde zu Runde variierende Umfänge (Quellen zeigen z.B. "SkiErg 5×200m"
 * statt 1000m, "Wall Ball 5×20 Reps" statt 100, "Sled Push 6×25m" statt 50m),
 * Lasten leicht über/unter Renngewicht, und — bei Rotation — oft MEHRERE
 * Übungen pro Runde statt nur einer (z.B. "400m Lauf + 15 Wall Balls + 10 KB
 * Swings", RoxZone-Methodik). Deshalb wird hier bei jeder Generierung neu
 * gewürfelt statt fixe Werte zu wiederholen.
 */
function buildCompromisedRun(params) {
  const { equipment, runDistance, stationMode, selectedStationId, division, gender, timeCapMin, stationsPerRound, excludedExercises } = params;
  const equipmentSet = new Set(equipment);
  const cappedTimeMin = clamp(timeCapMin, 30, 60);
  const targetSec = cappedTimeMin * 60;
  const K = stationMode === "single" ? 1 : clamp(stationsPerRound ?? 1, 1, 3);
  const excludedSet = new Set(excludedExercises ?? []);
  // Laufdistanz exakt wie eingegeben — Variation gibt es nur bei Stationsumfang und Gewicht
  const fixedRunDistance = clamp(Math.round(runDistance) || 400, 100, 2000);

  const baseStations = stationMode === "single" ? [HYROX_STATIONS.find((s) => s.id === selectedStationId) ?? HYROX_STATIONS[0]] : HYROX_STATIONS;
  let resolved = resolveHyroxStations(baseStations, equipmentSet, excludedSet);
  // Gewählte Einzelstation mit dem aktuellen Equipment nicht möglich (z.B. Springseil ohne Seil) → Rotation nutzen
  const singleModeFallback = stationMode === "single" && resolved.length === 0;
  if (resolved.length === 0) resolved = resolveHyroxStations(HYROX_STATIONS, equipmentSet, excludedSet);

  const roundsData = [];
  let totalSec = 0;
  let queue = [];
  let lastFamily = null;
  // Rotation: Stationen in (möglichst) offizieller Reihenfolge, aber ohne direkt aufeinanderfolgende ähnliche Übungen
  const nextStation = () => {
    if (stationMode === "single" && !singleModeFallback) return resolved[0];
    if (queue.length === 0) queue = orderWithoutRepeats(resolved, lastFamily);
    const next = queue.shift();
    lastFamily = hyroxFamily(next.variant);
    return next;
  };
  const maxRounds = 20;
  const minRounds = stationMode === "single" ? 3 : Math.min(4, Math.ceil(resolved.length / K));

  while (roundsData.length < maxRounds && (roundsData.length < minRounds || totalSec < targetSec)) {
    const runSec = fixedRunDistance * HYROX_RUN_PACE_SEC_PER_M;
    const runItem = { amount: `${fixedRunDistance}m`, name: "Lauf", load: null, loadKind: null };

    const stationItems = [];
    let roundStationSec = 0;
    for (let k = 0; k < K; k++) {
      const { station, variant } = nextStation();
      const { item, stationSec } = buildHyroxStationItem(station, variant, division, gender);
      stationItems.push(item);
      roundStationSec += stationSec;
    }

    totalSec += runSec + roundStationSec;
    roundsData.push({ roundLabel: `Runde ${roundsData.length + 1}`, items: [runItem, ...stationItems] });
  }

  const totalMin = totalSec / 60;
  const lines = roundsData.flatMap((rd) => rd.items.map((item) => ({ ...item, name: `${rd.roundLabel}: ${item.name}` })));
  const stationNote =
    stationMode === "single" && !singleModeFallback
      ? `Station: ${resolved[0].variant.name} (konstant, Umfang variiert pro Runde).`
      : `${K > 1 ? `${K} Stationen` : "Stationen"} rotieren in fester Reihenfolge, Umfang und Gewicht variieren pro Runde.`;
  const substitutionNote = resolved.some(({ variant }) => variant.isSubstitute) ? " Einzelne Stationen wurden mangels Equipment durch Alternativen ersetzt." : "";

  return {
    format: "Compromised Running",
    headline: `${roundsData.length} Runden · ${fixedRunDistance}m Lauf + ${K > 1 ? `${K} Stationen` : "Station"} · ${HYROX_DIVISIONS[division]}`,
    lines,
    roundsData,
    notes: `Lauf direkt gefolgt von der/den Station(en), minimale Pause. ${stationNote} Time Cap: ${cappedTimeMin} Min. Geschätzte Dauer: ~${totalMin.toFixed(0)} Min.${substitutionNote}`,
    relaxed: false,
  };
}

// Für den Buy-in eignen sich die Cardio-Maschinen-Stationen
const HYROX_BUYIN_STATION_IDS = ["hyrox-skierg", "hyrox-row"];

/**
 * Buy-in Circuit: ein einzelnes, längeres Cardio-Stück zu Beginn (Buy-in),
 * danach mehrere Runden eines wechselnden 3-Übungen-Zirkels ohne Lauf
 * dazwischen. Recherchiertes Muster (Wikipedia HYROX-Artikel, RoxZone-
 * Methodik), z.B. "Buy-in: 1000m Row, dann 3 Runden: 10 Wall Balls, 10 KB
 * Swings, 20m Sled Push" — deutlich mehr Übungsvielfalt pro Runde als bei
 * Compromised Running mit nur einer Station.
 */
function buildBuyInCircuit(params) {
  const { equipment, division, gender, timeCapMin, circuitSize, excludedExercises } = params;
  const equipmentSet = new Set(equipment);
  const cappedTimeMin = clamp(timeCapMin, 30, 60);
  const targetSec = cappedTimeMin * 60;
  const K = clamp(circuitSize ?? 3, 2, 4);
  const excludedSet = new Set(excludedExercises ?? []);

  const buyInCandidates = resolveHyroxStations(
    HYROX_STATIONS.filter((s) => HYROX_BUYIN_STATION_IDS.includes(s.id)),
    equipmentSet,
    excludedSet
  );
  const { station: buyInStation, variant: buyInVariant } = buyInCandidates[Math.floor(Math.random() * buyInCandidates.length)];
  // Buy-in ist ein einzelnes, größeres Stück — daher ein breiterer Kalorien-/Distanz-Anteil als bei den Intervall-Stationen weiter unten
  let buyInQty;
  if (buyInVariant.unit === "calories") {
    buyInQty = evenCal(30 + Math.random() * 30); // 30-60 Cal für das einmalige Buy-in-Stück
  } else if (buyInVariant.ownRange) {
    // z.B. Burpee als Fallback ohne Cardiogerät: eigener Bereich, fürs einmalige Buy-in-Stück 1,5× größer
    const [lo, hi] = buyInVariant.ownRange;
    buyInQty = roundHyroxQty((lo + Math.random() * (hi - lo)) * 1.5, buyInVariant.unit);
  } else {
    const buyInFraction = 0.4 + Math.random() * 0.3;
    buyInQty = roundHyroxQty(buyInVariant.distance * buyInFraction, buyInVariant.unit);
  }
  const buyInSec = buyInQty * hyroxUnitSeconds(buyInVariant, division);
  const buyInItem = { amount: hyroxAmountLabel(buyInVariant, buyInQty), name: `Buy-in: ${buyInVariant.name}`, load: null, loadKind: null };

  const circuitCandidates = resolveHyroxStations(
    HYROX_STATIONS.filter((s) => s.id !== buyInStation.id),
    equipmentSet,
    excludedSet
  );
  // Dieselbe Übung wie im Buy-in nicht noch einmal im Zirkel (z.B. SkiErg als Ersatz fürs Rudern)
  const withoutBuyInRepeat = circuitCandidates.filter((r) => r.variant.name !== buyInVariant.name);
  const resolvedCircuit = withoutBuyInRepeat.length > 0 ? withoutBuyInRepeat : circuitCandidates;
  // Mehr Übungen pro Runde als es unterschiedliche Übungstypen gibt, würde zwangsläufig ähnliche
  // Übungen direkt hintereinander setzen — dann Rundengröße begrenzen (und im Hinweis erwähnen).
  const distinctFamilyCount = new Set(resolvedCircuit.map((r) => hyroxFamily(r.variant))).size;
  const Keff = Math.max(1, Math.min(K, distinctFamilyCount));
  const capNote = Keff < K ? ` Übungen pro Runde auf ${Keff} begrenzt, da mit dem gewählten Equipment nur ${distinctFamilyCount} unterschiedliche Übungstypen möglich sind.` : "";

  const roundsData = [{ roundLabel: "Buy-in", items: [buyInItem] }];
  let circuitSec = 0;
  const remainingSec = Math.max(0, targetSec - buyInSec);
  const maxRounds = 12;
  const minRounds = 3;

  let lastFamily = hyroxFamily(buyInVariant); // erste Zirkel-Übung soll nicht zur Familie des Buy-ins gehören
  while (roundsData.length - 1 < maxRounds && (roundsData.length - 1 < minRounds || circuitSec < remainingSec)) {
    const shuffled = [...resolvedCircuit].sort(() => Math.random() - 0.5);
    // Pro Runde K Übungen: keine Familie doppelt in einer Runde und keine direkt nach der gleichen
    // Familie (auch über den Rundenwechsel hinweg, da zwischen den Runden kein Lauf liegt)
    const picks = [];
    const usedFamilies = new Set();
    let prev = lastFamily;
    for (let k = 0; k < Math.min(Keff, shuffled.length); k++) {
      const free = shuffled.filter((r) => !picks.includes(r));
      const candidate =
        free.find((r) => !usedFamilies.has(hyroxFamily(r.variant)) && hyroxFamily(r.variant) !== prev) ??
        free.find((r) => hyroxFamily(r.variant) !== prev) ??
        free[0];
      picks.push(candidate);
      prev = hyroxFamily(candidate.variant);
      usedFamilies.add(prev);
    }
    lastFamily = prev;
    const items = picks.map(({ station, variant }) => {
      const { item, stationSec } = buildHyroxStationItem(station, variant, division, gender);
      circuitSec += stationSec;
      return item;
    });
    roundsData.push({ roundLabel: `Runde ${roundsData.length}`, items });
  }

  const totalMin = (buyInSec + circuitSec) / 60;
  const lines = roundsData.flatMap((rd) => rd.items.map((item) => ({ ...item, name: `${rd.roundLabel}: ${item.name}` })));
  const substitutionNote = [buyInVariant, ...resolvedCircuit.map((r) => r.variant)].some((v) => v.isSubstitute)
    ? " Einzelne Stationen wurden mangels Equipment durch Alternativen ersetzt."
    : "";

  return {
    format: "Buy-in Circuit",
    headline: `Buy-in + ${roundsData.length - 1} Runden × ${Keff} Übungen · ${HYROX_DIVISIONS[division]}`,
    lines,
    roundsData,
    notes: `Einmal ${buyInVariant.name}, danach ${roundsData.length - 1} Runden mit je ${Keff} wechselnden Übungen, kein Lauf dazwischen. Time Cap: ${cappedTimeMin} Min. Geschätzte Dauer: ~${totalMin.toFixed(0)} Min.${substitutionNote}${capNote}`,
    relaxed: false,
  };
}


// --- Stage 2/3: Bekannte Benchmark-WODs als gelegentliche Vorlage ---
// Quelle: CrossFit Journal "Benchmark Workouts" (Glassman, 09/2003), CrossFit.com
// Hero-WOD-Seiten, WODwell. Bewegungen sind auf unsere Datenbank abgebildet;
// wo die Originalübung fehlt, wird die nächstliegende Übung verwendet
// (gekennzeichnet über "substitution").
const BENCHMARKS = [
  // --- Format: descending (21-15-9-Familie) ---
  { id: "fran", name: "Fran", format: "descending", scheme: "21-15-9",
    movements: [{ id: "thruster" }, { id: "pull-up" }],
    note: "Das Original-Rep-Schema, das CrossFit bekannt gemacht hat." },
  { id: "diane", name: "Diane", format: "descending", scheme: "21-15-9",
    movements: [{ id: "deadlift" }, { id: "handstand-push-up" }] },
  { id: "elizabeth", name: "Elizabeth", format: "descending", scheme: "21-15-9",
    movements: [{ id: "power-clean", substitution: "Clean" }, { id: "ring-dip" }] },
  { id: "annie", name: "Annie", format: "descending", scheme: "50-40-30-20-10",
    movements: [{ id: "double-under" }, { id: "sit-up" }] },
  { id: "jt", name: "JT", format: "descending", scheme: "21-15-9",
    movements: [{ id: "handstand-push-up" }, { id: "ring-dip" }, { id: "push-up" }] },

  // --- Format: sprint (Einzelübung, fixe Gesamtreps) ---
  { id: "grace", name: "Grace", format: "sprint", totalReps: 30,
    movements: [{ id: "power-clean", substitution: "Clean & Jerk" }] },
  { id: "isabel", name: "Isabel", format: "sprint", totalReps: 30,
    movements: [{ id: "power-snatch", substitution: "Snatch" }] },
  { id: "randy", name: "Randy", format: "sprint", totalReps: 75,
    movements: [{ id: "power-snatch" }] },
  { id: "karen", name: "Karen", format: "sprint", totalReps: 150,
    movements: [{ id: "wall-ball" }] },

  // --- Format: amrap (fixe Reps pro Runde, Zeit als Cap) ---
  { id: "cindy", name: "Cindy", format: "amrap", durationMin: 20,
    movements: [{ id: "pull-up", reps: 5 }, { id: "push-up", reps: 10 }, { id: "air-squat", reps: 15 }] },
  { id: "nate", name: "Nate", format: "amrap", durationMin: 20,
    movements: [{ id: "muscle-up", reps: 2 }, { id: "handstand-push-up", reps: 4 }, { id: "kb-swing", reps: 8 }] },

  // --- Format: for_time (RFT, fixe Runden/Reps) ---
  { id: "barbara", name: "Barbara", format: "for_time", rounds: 5, restBetweenRoundsSec: 180,
    movements: [{ id: "pull-up", reps: 20 }, { id: "push-up", reps: 30 }, { id: "sit-up", reps: 40 }, { id: "air-squat", reps: 50 }] },
  { id: "helen", name: "Helen", format: "for_time", rounds: 3,
    movements: [{ id: "run", reps: 400 }, { id: "kb-swing", reps: 21 }, { id: "pull-up", reps: 12 }] },
  { id: "nancy", name: "Nancy", format: "for_time", rounds: 5,
    movements: [{ id: "run", reps: 400 }, { id: "overhead-squat", reps: 15 }] },
  { id: "dt", name: "DT", format: "for_time", rounds: 5,
    movements: [{ id: "deadlift", reps: 12 }, { id: "power-clean", reps: 9 }, { id: "push-jerk", reps: 6 }] },
  { id: "the-seven", name: "The Seven", format: "for_time", rounds: 7,
    movements: [
      { id: "handstand-push-up", reps: 7 }, { id: "thruster", reps: 7 },
      { id: "toes-to-bar", reps: 7, substitution: "Knees-to-Elbow" }, { id: "deadlift", reps: 7 },
      { id: "burpee", reps: 7 }, { id: "kb-swing", reps: 7 }, { id: "pull-up", reps: 7 },
    ] },

  // --- Format: chipper (fixe Sequenz, einmal durch) ---
  { id: "jackie", name: "Jackie", format: "chipper",
    movements: [{ id: "row-erg", reps: 30, substitution: "1000m Row → 30 Cal" }, { id: "thruster", reps: 50 }, { id: "pull-up", reps: 30 }] },
  { id: "murph", name: "Murph", format: "chipper",
    movements: [
      { id: "run", reps: 1609 }, { id: "pull-up", reps: 100 }, { id: "push-up", reps: 200 },
      { id: "air-squat", reps: 300 }, { id: "run", reps: 1609 },
    ], note: "Traditionell mit 20-lb-Weste. Partition der Mittelreps (z. B. 20 Runden 5/10/15) ist üblich." },
  { id: "filthy-fifty", name: "Filthy Fifty", format: "chipper",
    movements: [
      { id: "box-jump", reps: 50 }, { id: "pull-up", reps: 50, substitution: "Jumping Pull-Up" },
      { id: "kb-swing", reps: 50 }, { id: "lunge", reps: 50, substitution: "Walking Lunge" },
      { id: "toes-to-bar", reps: 50, substitution: "Knees-to-Elbow" }, { id: "push-press", reps: 50 },
      { id: "good-morning", reps: 50, substitution: "Back Extension" }, { id: "wall-ball", reps: 50 },
      { id: "burpee", reps: 50 }, { id: "double-under", reps: 50 },
    ] },

  // --- Format: fgb (kanonische Fight-Gone-Bad-Stationen) ---
  { id: "fight-gone-bad", name: "Fight Gone Bad", format: "fgb",
    movements: [{ id: "wall-ball" }, { id: "sumo-deadlift-high-pull" }, { id: "box-jump" }, { id: "push-press" }, { id: "row-erg" }] },

  // --- Format: tabata ---
  { id: "tabata-something-else", name: "Tabata Something Else", format: "tabata",
    movements: [{ id: "pull-up" }, { id: "push-up" }, { id: "sit-up" }, { id: "air-squat" }] },
];

/* ============================================================
   KRAFT-TAB — Kraftaufbau mit Vorgaben in % vom 1RM (keine kg-Werte)
   Grundlagen (Recherche): NSCA-Zuordnung %1RM <-> Wiederholungen, klassische
   Schemata (5x5, 5x3, 5x8-12), 5/3/1-Welle (Wendler) und Ramp-up / Top-Set /
   Back-off. Eigene Datenstruktur, unabhängig vom Übungspool der anderen Tabs.
   ============================================================ */
const KRAFT_EQUIPMENT_IDS = new Set(["barbell", "rack", "bench", "dumbbells", "kettlebell", "pullup_bar", "rings"]);
// Dip-Barren gibt es nur im Kraft-Tab (für Barren-Dips) — bewusst nicht in der globalen Equipment-Liste
const KRAFT_EQUIPMENT_OPTIONS = [
  ...EQUIPMENT_OPTIONS.filter((opt) => KRAFT_EQUIPMENT_IDS.has(opt.id)),
  { id: "dip_bars", label: "Dip-Barren" },
];

const KRAFT_STRUCTURES = [
  { id: "straight", label: "Straight Sets" },
  { id: "531", label: "5/3/1-Welle" },
  { id: "ramp", label: "Ramp-up · Top-Set · Back-off" },
];
const KRAFT_GOAL_OPTIONS = [
  { id: "max", label: "Maximalkraft" },
  { id: "strengthsize", label: "Kraft + Muskelaufbau" },
  { id: "size", label: "Muskelaufbau" },
];
const KRAFT_SCHEME_OPTIONS = [
  { id: "auto", label: "Automatisch (nach Ziel)" },
  { id: "5x5", label: "5×5" },
  { id: "5x3", label: "5×3" },
  { id: "5x8-12", label: "5×8–12" },
];
const KRAFT_WEEK_OPTIONS = [
  { id: 1, label: "Woche 1 (5er)" },
  { id: 2, label: "Woche 2 (3er)" },
  { id: 3, label: "Woche 3 (5/3/1)" },
  { id: 4, label: "Deload" },
];
const KRAFT_FOCUS_OPTIONS = [
  { id: "full", label: "Ganzkörper" },
  { id: "lower", label: "Unterkörper" },
  { id: "upper", label: "Oberkörper" },
];
// Welche Bewegungsgruppen zu welchem Fokus gehören — gilt für die Übungsauswahl UND für das Ausschluss-Dropdown
const KRAFT_FOCUS_GROUPS = {
  full: ["squat", "hinge", "push", "pull"],
  lower: ["squat", "hinge"],
  upper: ["push", "pull"],
};

/**
 * group: squat/hinge (Unterkörper, inkl. Gewichtheben), push/pull (Oberkörper)
 * tier: "main" = klassische Grundübung (hat Vorrang), "accessory" = Ergänzung/Ausweichübung bei wenig Equipment
 * family: ähnliche Übungen (z.B. alle Klimmzüge) nie gemeinsam in einer Einheit
 * technical/maxReps: Gewichtheber-Übungen bleiben aus Technikgründen bei wenigen Wiederholungen
 * equipmentOptions: ODER-Verknüpfung von UND-Gruppen, z.B. [["barbell","rack"]] oder [["kettlebell"],["dumbbells"]]
 */
const KRAFT_EXERCISES = [
  // Kniebeugen
  { name: "Kniebeuge hinten", group: "squat", tier: "main", family: "squat-bb", equipmentOptions: [["barbell", "rack"]] },
  { name: "Kniebeuge vorne", group: "squat", tier: "main", family: "squat-bb", equipmentOptions: [["barbell", "rack"]] },
  { name: "Goblet Squat", group: "squat", tier: "accessory", family: "goblet", equipmentOptions: [["kettlebell"], ["dumbbells"]] },
  { name: "Bulgarian Split Squat", perHand: true, group: "squat", tier: "accessory", family: "split", perSide: true, equipmentOptions: [["dumbbells", "bench"]] },
  { name: "Dumbbell Lunge", perHand: true, group: "squat", tier: "accessory", family: "lunge", perSide: true, equipmentOptions: [["dumbbells"]] },
  { name: "Front Rack Lunge", group: "squat", tier: "accessory", family: "lunge", perSide: true, equipmentOptions: [["barbell"]] },
  // Kreuzheben
  { name: "Kreuzheben enger Griff", group: "hinge", tier: "main", family: "dl", equipmentOptions: [["barbell"]] },
  { name: "Kreuzheben breiter Griff", group: "hinge", tier: "main", family: "dl", equipmentOptions: [["barbell"]] },
  { name: "Rumänisches Kreuzheben", group: "hinge", tier: "main", family: "dl", equipmentOptions: [["barbell"], ["dumbbells"]] },
  { name: "Good Morning", group: "hinge", tier: "accessory", family: "gm", equipmentOptions: [["barbell"]] },
  { name: "Hip Thrust", group: "hinge", tier: "accessory", family: "hip", equipmentOptions: [["barbell", "bench"], ["dumbbells", "bench"]] },
  // Gewichtheben
  { name: "Standumsetzen", group: "hinge", tier: "main", family: "clean", technical: true, maxReps: 5, equipmentOptions: [["barbell"]] },
  { name: "Umsetzen", group: "hinge", tier: "main", family: "clean", technical: true, maxReps: 5, equipmentOptions: [["barbell"]] },
  { name: "Standumsetzen aus dem Hang", group: "hinge", tier: "main", family: "clean", technical: true, maxReps: 5, equipmentOptions: [["barbell"]] },
  { name: "Umsetzen aus dem Hang", group: "hinge", tier: "main", family: "clean", technical: true, maxReps: 5, equipmentOptions: [["barbell"]] },
  { name: "Umsetzen + Kniebeuge vorne", group: "hinge", tier: "main", family: "clean-fs", technical: true, maxReps: 3, hint: "complex", equipmentOptions: [["barbell"]] },
  // Drücken
  { name: "Kraftdrücken", group: "push", tier: "main", family: "press", equipmentOptions: [["barbell"]] },
  { name: "Bankdrücken Flachbank", group: "push", tier: "main", family: "bench", equipmentOptions: [["barbell", "bench"]] },
  { name: "Bankdrücken Schrägbank", group: "push", tier: "main", family: "bench", equipmentOptions: [["barbell", "bench"]] },
  { name: "Dips am Barren", group: "push", tier: "main", family: "dips", hint: "bodyweight", equipmentOptions: [["dip_bars"]] },
  { name: "Ring-Dips", group: "push", tier: "main", family: "dips", hint: "bodyweight", equipmentOptions: [["rings"]] },
  { name: "Bankdips", group: "push", tier: "accessory", family: "dips", hint: "bodyweight", equipmentOptions: [["bench"]] },
  { name: "Push Press", group: "push", tier: "accessory", family: "pp", equipmentOptions: [["barbell"]] },
  { name: "Dumbbell Bench Press", perHand: true, group: "push", tier: "accessory", family: "bench", equipmentOptions: [["dumbbells", "bench"]] },
  { name: "Incline Dumbbell Press", perHand: true, group: "push", tier: "accessory", family: "bench", equipmentOptions: [["dumbbells", "bench"]] },
  { name: "Dumbbell Shoulder Press", perHand: true, group: "push", tier: "accessory", family: "press", equipmentOptions: [["dumbbells"]] },
  // Ziehen
  { name: "Klimmzug Obergriff", group: "pull", tier: "main", family: "pullup", hint: "bodyweight", equipmentOptions: [["pullup_bar"]] },
  { name: "Klimmzug Untergriff", group: "pull", tier: "main", family: "pullup", hint: "bodyweight", equipmentOptions: [["pullup_bar"]] },
  { name: "Klimmzug breiter Griff", group: "pull", tier: "main", family: "pullup", hint: "bodyweight", equipmentOptions: [["pullup_bar"]] },
  { name: "Klimmzug enger Griff", group: "pull", tier: "main", family: "pullup", hint: "bodyweight", equipmentOptions: [["pullup_bar"]] },
  { name: "Brust-zur-Stange-Klimmzug", group: "pull", tier: "main", family: "pullup", hint: "bodyweight", equipmentOptions: [["pullup_bar"]] },
  { name: "Ring-Klimmzug", group: "pull", tier: "main", family: "pullup", hint: "bodyweight", equipmentOptions: [["rings"]] },
  { name: "Rudern vorgebeugt", group: "pull", tier: "main", family: "row", equipmentOptions: [["barbell"]] },
  { name: "Dumbbell Row", perHand: true, group: "pull", tier: "accessory", family: "row", perSide: true, equipmentOptions: [["dumbbells"]] },
];
const KRAFT_HINTS = {
  bodyweight: "Klimmzüge und Dips: Prozent beziehen sich auf Körpergewicht plus Zusatzlast (z. B. Gewichtsweste oder Gürtel).",
  complex: "Umsetzen + Kniebeuge vorne: pro Wiederholung 1× Umsetzen, danach 1× Kniebeuge vorne; Prozent beziehen sich auf deinen 1RM im Umsetzen.",
};

// Ziel -> Schemata. pct = %1RM-Bereich, rest = Pause in Sekunden (Bereich). Straight Sets: immer mindestens 5 Sätze.
const KRAFT_MIN_STRAIGHT_SETS = 5;
const KRAFT_GOALS = {
  max: {
    label: "Maximalkraft",
    straight: [
      { sets: 5, reps: 3, pct: [85, 90], rest: [180, 240] },
      { sets: 5, reps: 4, pct: [82.5, 85], rest: [180, 240] },
      { sets: 6, reps: 2, pct: [87.5, 92.5], rest: [180, 300] },
      { sets: 5, reps: 5, pct: [80, 82.5], rest: [180, 240] },
    ],
    top: { reps: [2, 3], pct: [90, 92.5], rest: [240, 300] },
    backoff: { sets: 3, reps: [4, 5], drop: [10, 15], rest: [150, 180] },
    accessory: { sets: 3, reps: [6, 8], rest: [120, 150] },
  },
  strengthsize: {
    label: "Kraft + Muskelaufbau",
    straight: [
      { sets: 5, reps: 5, pct: [77.5, 82.5], rest: [120, 180] },
      { sets: 5, reps: 6, pct: [75, 77.5], rest: [120, 180] },
      { sets: 6, reps: 5, pct: [77.5, 80], rest: [120, 180] },
      { sets: 5, reps: 8, pct: [70, 72.5], rest: [90, 120] },
    ],
    top: { reps: [5], pct: [82.5, 85], rest: [180, 240] },
    backoff: { sets: 3, reps: [6, 8], drop: [10, 12.5], rest: [120, 150] },
    accessory: { sets: 3, reps: [8, 10], rest: [90, 120] },
  },
  size: {
    label: "Muskelaufbau",
    straight: [
      { sets: 5, reps: 10, pct: [65, 70], rest: [60, 120] },
      { sets: 5, reps: 8, pct: [70, 72.5], rest: [90, 120] },
      { sets: 5, reps: 12, pct: [62.5, 65], rest: [60, 90] },
      { sets: 6, reps: 10, pct: [62.5, 67.5], rest: [60, 120] },
    ],
    top: { reps: [8], pct: [75, 77.5], rest: [120, 150] },
    backoff: { sets: 3, reps: [10, 12], drop: [10, 12.5], rest: [75, 90] },
    accessory: { sets: 3, reps: [10, 12], rest: [60, 90] },
  },
};

// Direkt wählbare Schemata (für Straight Sets)
const KRAFT_DIRECT_SCHEMES = {
  "5x5": [{ sets: 5, reps: 5, pct: [77.5, 82.5], rest: [120, 180] }],
  "5x3": [{ sets: 5, reps: 3, pct: [85, 90], rest: [180, 240] }],
  "5x8-12": [
    { sets: 5, reps: 8, pct: [70, 72.5], rest: [60, 120] },
    { sets: 5, reps: 10, pct: [65, 70], rest: [60, 120] },
    { sets: 5, reps: 12, pct: [62.5, 65], rest: [60, 90] },
  ],
};
// Gewichtheber-Übungen vertragen keine hohen Wiederholungszahlen — Ersatzschemata, wenn kein Schema passt
const KRAFT_TECHNICAL_FALLBACK = [
  { sets: 5, reps: 3, pct: [65, 75], rest: [120, 150] },
  { sets: 6, reps: 2, pct: [70, 80], rest: [120, 150] },
];

// 5/3/1 (Wendler): Prozente beziehen sich auf das Training Max = 90 % vom 1RM.
// Hier direkt auf % vom 1RM umgerechnet (x 0,9), damit der Tab durchgehend in % vom 1RM spricht.
const KRAFT_531_WEEKS = {
  1: { label: "Woche 1 (5er)", sets: [{ pct: 65, reps: "5" }, { pct: 75, reps: "5" }, { pct: 85, reps: "5+" }] },
  2: { label: "Woche 2 (3er)", sets: [{ pct: 70, reps: "3" }, { pct: 80, reps: "3" }, { pct: 90, reps: "3+" }] },
  3: { label: "Woche 3 (5/3/1)", sets: [{ pct: 75, reps: "5" }, { pct: 85, reps: "3" }, { pct: 95, reps: "1+" }] },
  4: { label: "Deload", sets: [{ pct: 40, reps: "5" }, { pct: 50, reps: "5" }, { pct: 60, reps: "5" }] },
};

// Wiederholungen, die man bei x % maximal schafft (Standard-Tabelle). Arbeitsprozent = dieser Wert minus ~7,5 %.
const KRAFT_REP_CHART = { 1: 100, 2: 95, 3: 92.5, 4: 90, 5: 87.5, 6: 85, 7: 82.5, 8: 80, 9: 77.5, 10: 75, 11: 72.5, 12: 70 };

const kraftRoundPct = (p) => Math.max(30, Math.round(p / 2.5) * 2.5);
const kraftRand = ([lo, hi]) => lo + Math.random() * (hi - lo);
const kraftRandInt = ([lo, hi]) => Math.floor(lo + Math.random() * (hi - lo + 1));
const kraftPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const kraftRest = (range) => Math.round(kraftRand(range) / 30) * 30;
const kraftPctForReps = (reps) => kraftRoundPct((KRAFT_REP_CHART[clamp(reps, 1, 12)] ?? 70) - 7.5);
const kraftFmtPct = (p) => `${String(p).replace(".", ",")} %`;
const kraftFmtRest = (sec) => (sec >= 120 ? `${String(sec / 60).replace(".", ",")} Min` : `${sec} Sek`);

// % vom 1RM -> kg. Eingaben dürfen Komma oder Punkt enthalten; ungültige/leere Eingaben ergeben 0.
const kraftParseNum = (v) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const kraftRoundKg = (kg) => Math.round(kg / 2.5) * 2.5; // praktische Scheibenabstufung (2 × 1,25 kg)
const kraftFmtKg = (kg) => String(Math.round(kg * 10) / 10).replace(".", ",");

/** Erst eine Übungsfamilie zufällig wählen, dann eine Variante darin — so haben z.B. 6 Klimmzug-Varianten nicht 6× so viel Gewicht wie Rudern. */
function kraftPickByFamily(cands) {
  const fam = kraftPick([...new Set(cands.map((e) => e.family))]);
  return kraftPick(cands.filter((e) => e.family === fam));
}

/** Zusammenstellung der Übungen: Fokus bestimmt, aus welchen Bewegungsgruppen gezogen wird. */
function pickKraftExercises(pool, focus, count, avoidTechnicalPrimary) {
  const kindGroups = { lower: ["squat", "hinge"], upper: ["push", "pull"], push: ["push"], pull: ["pull"] };
  const focusGroups = new Set(KRAFT_FOCUS_GROUPS[focus] ?? KRAFT_FOCUS_GROUPS.full);
  let kinds;
  if (focus === "lower") kinds = ["lower", "lower", "lower", "lower", "lower"];
  else if (focus === "upper") kinds = ["upper", "upper", "upper", "upper", "upper"];
  else kinds = [...["lower", "push", "pull"].sort(() => Math.random() - 0.5), "lower", "upper"]; // Ganzkörper: je Unterkörper, Push, Pull zuerst
  const groupsFor = (kind) => kindGroups[kind] ?? [kind];
  // Die Hauptübung soll eine klassische Grundübung sein, sofern es im Fokus überhaupt eine gibt
  const needMainPrimary = pool.some((ex) => ex.tier === "main" && focusGroups.has(ex.group));
  const preferMain = (cands) => {
    const mains = cands.filter((ex) => ex.tier === "main");
    return mains.length ? mains : cands;
  };

  const chosen = [];
  const usedFamilies = new Set();
  const take = (ex) => {
    chosen.push(ex);
    usedFamilies.add(ex.family);
  };
  for (let i = 0; i < kinds.length && chosen.length < count; i++) {
    const groups = groupsFor(kinds[i]);
    // Gruppe bevorzugen, aus der bisher am wenigsten gewählt wurde (abwechselnd Squat/Hinge bzw. Push/Pull)
    const ordered = [...groups].sort((a, b) => chosen.filter((e) => e.group === a).length - chosen.filter((e) => e.group === b).length || Math.random() - 0.5);
    // Erst nur klassische Grundübungen aus allen Gruppen dieser Art prüfen, erst dann Ergänzungsübungen
    let picked = false;
    for (const mainOnly of [true, false]) {
      for (const g of ordered) {
        let cands = pool.filter((ex) => ex.group === g && !usedFamilies.has(ex.family) && !chosen.includes(ex));
        if (chosen.length === 0) {
          if (needMainPrimary) cands = cands.filter((ex) => ex.tier === "main");
          if (avoidTechnicalPrimary) {
            const plain = cands.filter((ex) => !ex.technical);
            if (plain.length) cands = plain; // Gewichtheben passt nicht in 5/3/1-Welle bzw. Ramp-up als Hauptübung
          }
        }
        if (mainOnly) cands = cands.filter((ex) => ex.tier === "main");
        if (cands.length) {
          take(kraftPickByFamily(cands));
          picked = true;
          break;
        }
      }
      if (picked) break;
    }
  }
  // Falls die Abfolge nicht reicht (z.B. wenig Equipment): mit übrigen Übungen im Fokus auffüllen
  if (chosen.length > 0) {
    while (chosen.length < count) {
      const rest = preferMain(pool.filter((ex) => focusGroups.has(ex.group) && !usedFamilies.has(ex.family) && !chosen.includes(ex)));
      if (!rest.length) break;
      take(kraftPickByFamily(rest));
    }
  }
  return chosen;
}

/** Satzfolge der Hauptübung bei 5/3/1-Welle bzw. Ramp-up/Top-Set/Back-off. */
function buildKraftPrimarySets(structure, goalCfg, week) {
  if (structure === "531") {
    const cfg = KRAFT_531_WEEKS[week] ?? KRAFT_531_WEEKS[1];
    const rest = week === 4 ? 120 : 180;
    return cfg.sets.map((s) => ({
      sets: 1,
      reps: s.reps,
      pct: Math.round(s.pct * 0.9 * 2) / 2,
      tag: s.reps.endsWith("+") ? "AMRAP-Satz" : null,
      restSec: rest,
    }));
  }
  // ramp
  const topPct = kraftRoundPct(kraftRand(goalCfg.top.pct));
  const topReps = kraftPick(goalCfg.top.reps);
  const heavy = topPct >= 85;
  const rampPcts = (heavy ? [0.55, 0.7, 0.85] : [0.6, 0.8]).map((f) => kraftRoundPct(topPct * f));
  const rampReps = heavy ? [5, 3, 2] : [6, 4];
  const ramp = rampPcts.map((p, i) => ({ sets: 1, reps: String(rampReps[i]), pct: p, tag: "Ramp-up", restSec: kraftRest([60, 90]) }));
  const top = { sets: 1, reps: String(topReps), pct: topPct, tag: "Top-Set", restSec: kraftRest(goalCfg.top.rest) };
  const bo = goalCfg.backoff;
  const backoff = {
    sets: bo.sets,
    reps: String(kraftRandInt(bo.reps)),
    pct: kraftRoundPct(topPct - kraftRand(bo.drop)),
    tag: "Back-off",
    restSec: kraftRest(bo.rest),
  };
  return [...ramp, top, backoff];
}

/** Straight Sets für eine Grundübung: Schema direkt gewählt oder aus dem Ziel, immer mindestens 5 Sätze. */
function buildKraftStraightSets(ex, goalCfg, schemeId) {
  let options = schemeId && schemeId !== "auto" ? KRAFT_DIRECT_SCHEMES[schemeId] : goalCfg.straight;
  if (ex.maxReps) {
    const capped = options.filter((o) => o.reps <= ex.maxReps);
    options = capped.length ? capped : KRAFT_TECHNICAL_FALLBACK.filter((o) => o.reps <= ex.maxReps);
  }
  const o = kraftPick(options);
  return [{ sets: Math.max(KRAFT_MIN_STRAIGHT_SETS, o.sets), reps: String(o.reps), pct: kraftRoundPct(kraftRand(o.pct)), tag: null, restSec: kraftRest(o.rest) }];
}

/** Satzfolge der Ergänzungsübungen: moderate Wiederholungen, Prozent passend zur Wiederholungszahl. */
function buildKraftAccessorySets(goalCfg, ex, sets) {
  const acc = goalCfg.accessory;
  let reps = kraftRandInt(acc.reps);
  if (ex.maxReps) reps = Math.min(reps, ex.maxReps);
  return [{ sets, reps: String(reps), pct: kraftPctForReps(reps), tag: null, restSec: kraftRest(acc.rest) }];
}

function buildKraftWorkout(params) {
  const { equipment, structure, goal, scheme, week, focus, count, excludedExercises } = params;
  const equipmentSet = new Set(equipment);
  const goalCfg = KRAFT_GOALS[goal] ?? KRAFT_GOALS.strengthsize;
  const wanted = clamp(Math.round(count) || 3, 1, 5);

  const available = KRAFT_EXERCISES.filter((ex) => ex.equipmentOptions.some((opt) => opt.every((e) => equipmentSet.has(e))));
  if (available.length === 0) return null;
  const excluded = new Set(excludedExercises ?? []);
  let pool = available.filter((ex) => !excluded.has(ex.name));
  let exclusionIgnored = false;
  if (pool.length === 0) {
    pool = available;
    exclusionIgnored = true;
  }

  let usedFocus = focus;
  let chosen = pickKraftExercises(pool, focus, wanted, structure !== "straight");
  let focusFallback = false;
  if (chosen.length === 0) {
    chosen = pickKraftExercises(pool, "full", wanted, structure !== "straight");
    usedFocus = "full";
    focusFallback = true;
  }

  let technicalAsStraight = false;
  const groups = chosen.map((ex, i) => {
    const primary = i === 0;
    let lines;
    let tag;
    if (structure === "straight") {
      // Jede Übung bekommt mindestens 5 Sätze: Grundübungen nach Schema, Ergänzungen mit moderaten Wiederholungen
      lines = ex.tier === "main" ? buildKraftStraightSets(ex, goalCfg, scheme) : buildKraftAccessorySets(goalCfg, ex, KRAFT_MIN_STRAIGHT_SETS);
      tag = primary ? "Hauptübung" : ex.tier === "main" ? "Grundübung" : "Ergänzung";
    } else if (primary && ex.technical) {
      // Nur möglich, wenn es im Fokus gar keine andere Hauptübung gab: Technikübung nicht in Welle/Ramp pressen
      lines = buildKraftStraightSets(ex, goalCfg, "auto");
      tag = "Hauptübung";
      technicalAsStraight = true;
    } else {
      lines = primary ? buildKraftPrimarySets(structure, goalCfg, week) : buildKraftAccessorySets(goalCfg, ex, goalCfg.accessory.sets);
      tag = primary ? "Hauptübung" : "Ergänzung";
    }
    const suffix = ex.perSide ? " je Seite" : "";
    return {
      name: ex.name,
      tag,
      hint: ex.hint,
      technical: !!ex.technical,
      perHand: !!ex.perHand,
      bodyweight: ex.hint === "bodyweight",
      sets: lines.map((l) => ({
        amount: `${l.sets} × ${l.reps}${suffix}`,
        pct: l.pct,
        pctLabel: `${kraftFmtPct(l.pct)} 1RM`,
        tag: l.tag,
        restLabel: `${kraftFmtRest(l.restSec)} Pause`,
        _sets: l.sets,
        _reps: parseInt(l.reps, 10) || 5,
        _rest: l.restSec,
      })),
    };
  });

  // Dauer-Schätzung: ~3 s pro Wiederholung + 15 s Vorbereitung je Satz, plus Pausen (ohne Aufwärmen)
  let totalSec = 0;
  groups.forEach((g) => g.sets.forEach((s) => { totalSec += s._sets * (s._reps * 3 + 15 + s._rest); }));
  totalSec -= groups.length ? groups[groups.length - 1].sets.slice(-1)[0]._rest : 0;
  const totalMin = Math.max(1, Math.round(totalSec / 60));

  const goalLabel = goalCfg.label;
  const focusLabel = (KRAFT_FOCUS_OPTIONS.find((f) => f.id === usedFocus) ?? KRAFT_FOCUS_OPTIONS[0]).label;
  const structureLabel = (KRAFT_STRUCTURES.find((s) => s.id === structure) ?? KRAFT_STRUCTURES[0]).label;
  const weekLabel = (KRAFT_531_WEEKS[week] ?? KRAFT_531_WEEKS[1]).label;

  const hints = [...new Set(groups.map((g) => g.hint).filter(Boolean))].map((h) => KRAFT_HINTS[h]);
  const structureNote =
    structure === "531"
      ? `5/3/1: Prozente stammen aus dem Training Max (= 90 % vom 1RM) und sind hier auf % vom 1RM umgerechnet. Beim "+"-Satz so viele saubere Wiederholungen wie möglich (mindestens die genannte Zahl).`
      : structure === "ramp"
      ? "Ramp-up: Aufbausätze mit steigender Last und wenigen Wiederholungen, dann ein schwerer Top-Set, danach Back-off-Sätze mit leichterer Last und mehr Wiederholungen."
      : `Straight Sets: jede Übung mit mindestens ${KRAFT_MIN_STRAIGHT_SETS} Sätzen — Grundübungen nach gewähltem Schema, Ergänzungsübungen mit moderaten Wiederholungen.`;
  const notes = [
    `Alle Prozentwerte beziehen sich auf deinen aktuellen 1RM der jeweiligen Übung.`,
    structureNote,
    groups.some((g) => g.technical) ? "Gewichtheber-Übungen bleiben aus Technikgründen bei höchstens 5 Wiederholungen pro Satz (Kombination: 3)." : null,
    technicalAsStraight ? "Die Hauptübung ist eine Technikübung und läuft deshalb als Straight Sets statt als Welle/Ramp-up." : null,
    `Kein 1RM bekannt? Nimm als Orientierung ein Gewicht, mit dem du 5 saubere Wiederholungen schaffst (ca. 87 % vom 1RM).`,
    ...hints,
    focusFallback ? "Fokus mit diesem Equipment nicht möglich — stattdessen Ganzkörper." : null,
    exclusionIgnored ? "Ausschlüsse wurden ignoriert, da sonst keine Übung übrig geblieben wäre." : null,
    chosen.length < wanted ? `Nur ${chosen.length} von ${wanted} Übungen möglich (Equipment/Fokus).` : null,
    `Geschätzte Dauer: ~${totalMin} Min (ohne Aufwärmen).`,
  ].filter(Boolean);

  const headline =
    structure === "531"
      ? `${weekLabel} · ${chosen.length} ${chosen.length === 1 ? "Übung" : "Übungen"} · ${focusLabel}`
      : `${goalLabel} · ${chosen.length} ${chosen.length === 1 ? "Übung" : "Übungen"} · ${focusLabel}`;

  return { format: structureLabel, headline, groups, notes: notes.join(" ") };
}

/** Liefert Benchmarks, deren Bewegungen alle im aktuellen (equipment-/level-gefilterten) Pool stecken. */
function getEligibleBenchmarks(format, pool) {
  const poolIds = new Set(pool.map((ex) => ex.id));
  return BENCHMARKS.filter((b) => b.format === format && b.movements.every((m) => poolIds.has(m.id)));
}

/** Baut ein Workout direkt aus einer Benchmark-Definition (feste historische Reps/Runden, keine Zufallsauswahl). */
function buildFromBenchmark(benchmark, rawParams) {
  const params = { level: "intermediate", gender: "male", hasVest: false, ...rawParams };
  const withLoad = (ex, amount) => {
    const load = getLoadDisplay(ex, params.level, params.gender);
    return { amount, name: ex.name, load: load ? load.value : null, loadKind: load ? load.kind : null };
  };
  const movementExercises = benchmark.movements.map((m) => ({ ...m, ex: EXERCISE_BY_ID[m.id] }));
  const substitutionNotes = movementExercises
    .filter((m) => m.substitution)
    .map((m) => `${m.ex.name} statt "${m.substitution}"`);
  const subNote = substitutionNotes.length ? ` Angepasst: ${substitutionNotes.join(", ")}.` : "";
  const sourceNote = benchmark.note ? ` ${benchmark.note}` : "";
  const pace = LEVEL_PACE_FACTOR[params.level] ?? 1.5;

  if (benchmark.format === "descending") {
    const schemeDef = REP_SCHEMES.find((s) => s.id === benchmark.scheme);
    const totalRepsPerMovement = schemeDef.reps.reduce((a, b) => a + b, 0);
    const totalSec = movementExercises.reduce((sum, m) => sum + totalRepsPerMovement * unitTime(m.ex), 0);
    const estMin = (totalSec * pace) / 60;
    return {
      format: "21-15-9",
      isBenchmark: true,
      benchmarkName: benchmark.name,
      headline: `${benchmark.name} (Benchmark) · ${schemeDef.label}`,
      lines: movementExercises.map((m) => withLoad(m.ex, schemeDef.label)),
      notes: `${schemeDef.label} Wiederholungen, so schnell wie möglich. Geschätzte Dauer: ~${estMin.toFixed(0)} Min.${subNote}${sourceNote}${vestNote(params.hasVest)}`,
      relaxed: false,
    };
  }

  if (benchmark.format === "sprint") {
    const m = movementExercises[0];
    const qty = benchmark.totalReps;
    const estMin = (qty * unitTime(m.ex) * pace) / 60;
    return {
      format: "Sprint",
      isBenchmark: true,
      benchmarkName: benchmark.name,
      headline: `${benchmark.name} (Benchmark) · ${formatAmount(m.ex, qty)} ${m.ex.name}`,
      lines: [withLoad(m.ex, formatAmount(m.ex, qty))],
      notes: `Eine Übung, feste Gesamtzahl, so schnell wie möglich. Geschätzte Dauer: ~${estMin.toFixed(0)} Min.${subNote}${sourceNote}${vestNote(params.hasVest)}`,
      relaxed: false,
    };
  }

  if (benchmark.format === "amrap") {
    return {
      format: "AMRAP",
      isBenchmark: true,
      benchmarkName: benchmark.name,
      headline: `${benchmark.name} (Benchmark) · ${benchmark.durationMin} Min AMRAP`,
      lines: movementExercises.map((m) => withLoad(m.ex, formatAmount(m.ex, m.reps))),
      notes: `So viele Runden wie möglich in ${benchmark.durationMin} Minuten.${subNote}${sourceNote}${vestNote(params.hasVest)}`,
      relaxed: false,
    };
  }

  if (benchmark.format === "for_time") {
    const totalSec = movementExercises.reduce((sum, m) => sum + m.reps * unitTime(m.ex), 0);
    const estMin = ((totalSec + (benchmark.restBetweenRoundsSec ?? 0) * Math.max(0, benchmark.rounds - 1)) * pace) / 60;
    const restNote = benchmark.restBetweenRoundsSec ? ` ${benchmark.restBetweenRoundsSec}s Pause zwischen den Runden.` : "";
    return {
      format: "For Time",
      isBenchmark: true,
      benchmarkName: benchmark.name,
      headline: `${benchmark.name} (Benchmark) · ${benchmark.rounds} Runden`,
      lines: movementExercises.map((m) => withLoad(m.ex, formatAmount(m.ex, m.reps))),
      notes: `${benchmark.rounds} Runden, so schnell wie möglich.${restNote} Geschätzte Dauer: ~${estMin.toFixed(0)} Min.${subNote}${sourceNote}${vestNote(params.hasVest)}`,
      relaxed: false,
    };
  }

  if (benchmark.format === "chipper") {
    const totalSec = movementExercises.reduce((sum, m) => sum + m.reps * unitTime(m.ex), 0);
    const estMin = (totalSec * pace) / 60;
    return {
      format: "Chipper",
      isBenchmark: true,
      benchmarkName: benchmark.name,
      headline: `${benchmark.name} (Benchmark) · Chipper`,
      lines: movementExercises.map((m) => withLoad(m.ex, formatAmount(m.ex, m.reps))),
      notes: `Einmal der Reihe nach durch, so schnell wie möglich. Geschätzte Dauer: ~${estMin.toFixed(0)} Min.${subNote}${sourceNote}${vestNote(params.hasVest)}`,
      relaxed: false,
    };
  }

  if (benchmark.format === "fgb") {
    const lines = movementExercises.map((m) => {
      const bounds = qtyBounds(m.ex);
      const qty = clamp(Math.round(FGB_STATION_SEC / (unitTime(m.ex) || 2)), bounds.min, bounds.max);
      return withLoad(m.ex, formatAmount(m.ex, qty));
    });
    const totalMin = (3 * movementExercises.length * FGB_STATION_SEC + 2 * FGB_STATION_SEC) / 60;
    return {
      format: "Fight Gone Bad",
      isBenchmark: true,
      benchmarkName: benchmark.name,
      headline: `${benchmark.name} (Benchmark) · 3 Runden × ${movementExercises.length} Stationen`,
      lines,
      notes: `3 Runden, jede Station 60s, 60s Pause zwischen Runden. Gesamtdauer: ~${totalMin.toFixed(0)} Min. Score: Gesamtreps über alle Runden.${subNote}${sourceNote}${vestNote(params.hasVest)}`,
      relaxed: false,
    };
  }

  // tabata
  const lines = movementExercises.map((m) => {
    const tb = qtyBounds(m.ex);
    return withLoad(m.ex, `Ziel ${formatAmount(m.ex, clamp(Math.round(TABATA_WORK_SEC / (unitTime(m.ex) || 2)), tb.min, Math.min(tb.max, 60)))}/Runde`);
  });
  const totalMin = (movementExercises.length * (TABATA_ROUNDS * (TABATA_WORK_SEC + TABATA_REST_SEC)) + Math.max(0, movementExercises.length - 1) * TABATA_BLOCK_REST_SEC) / 60;
  return {
    format: "Tabata",
    isBenchmark: true,
    benchmarkName: benchmark.name,
    headline: `${benchmark.name} (Benchmark) · ${movementExercises.length} Übungen`,
    lines,
    notes: `${TABATA_ROUNDS} Runden à ${TABATA_WORK_SEC}s Arbeit / ${TABATA_REST_SEC}s Pause je Übung. Gesamtdauer: ~${totalMin.toFixed(0)} Min.${subNote}${sourceNote}${vestNote(params.hasVest)}`,
    relaxed: false,
  };
}

function buildWorkout(pool, format, focus, rawParams) {
  const params = {
    level: "intermediate",
    intensity: "normal",
    gender: "male",
    hasVest: false,
    forTimeCap: Math.max(6, (rawParams.rounds ?? 4) * 3),
    forTimeExercises: 5,
    chipperCap: 20,
    ladderCap: 15,
    repScheme: "21-15-9",
    movementCount: 2,
    sprintCap: 10,
    tabataStations: 4,
    fgbStations: 5,
    fgbRounds: 3,
    varRounds: 3,
    varSlots: 3,
    varCap: 16,
    ...rawParams,
  };
  const profile = INTENSITY_PROFILES[focus];
  const withLoad = (ex, amount) => {
    const load = getLoadDisplay(ex, params.level, params.gender);
    return { amount, name: ex.name, load: load ? load.value : null, loadKind: load ? load.kind : null };
  };
  let n, categoryHint, exercises, relaxed;

  if (format === "amrap") {
    n = Math.min(4, Math.max(2, pool.length));
    ({ selected: exercises, relaxed } = pickBalanced(pool, n, ["strength", "gymnastics", "monostructural", "monostructural"]));
    return {
      format: "AMRAP",
      headline: `${params.duration} Min AMRAP`,
      lines: exercises.map((ex) => withLoad(ex, formatAmount(ex, pickQtyForExercise(ex, profile)))),
      notes: `So viele Runden wie möglich in ${params.duration} Minuten. Load: ${profile.load}${vestNote(params.hasVest)}`,
      relaxed,
    };
  }
  if (format === "strength_sets") {
    const strengthPool = pool.filter((ex) => ex.category === "strength");
    const compoundFirst = [...strengthPool].sort((a, b) => (b.tags.includes("compound") ? 1 : 0) - (a.tags.includes("compound") ? 1 : 0));
    ({ selected: exercises, relaxed } = pickBalanced(compoundFirst, Math.min(2, compoundFirst.length)));
    return {
      format: "Strength Sets",
      headline: `${params.sets} Sätze`,
      lines: exercises.map((ex) => withLoad(ex, `${pickReps(profile)} Reps`)),
      notes: `${params.sets} Sätze je Übung, Pause: ${profile.rest}. Load: ${profile.load}${vestNote(params.hasVest)}`,
      relaxed,
    };
  }
  if (format === "for_time") {
    n = Math.min(params.forTimeExercises ?? 5, Math.max(2, pool.length));
    ({ selected: exercises, relaxed } = pickBalanced(pool, n, ["monostructural", "gymnastics", "strength"]));

    // Reps/Meter pro Runde am Time Cap ausrichten, statt fixe Zufallswerte zu nehmen
    const baseQty = exercises.map((ex) => pickQtyForExercise(ex, profile));
    const baseRoundSec = exercises.reduce((sum, ex, i) => sum + baseQty[i] * unitTime(ex), 0);
    const targetSec = targetRawSeconds(params.forTimeCap, params.level, params.intensity);
    const perRoundTarget = targetSec / Math.max(1, params.rounds);
    const scale = baseRoundSec > 0 ? clamp(perRoundTarget / baseRoundSec, 0.4, 4) : 1;
    const finalQty = baseQty.map((q, i) => Math.max(qtyFloor(exercises[i]), Math.round(q * scale)));
    const estMin = (finalQty.reduce((sum, q, i) => sum + q * unitTime(exercises[i]), 0) * params.rounds * (LEVEL_PACE_FACTOR[params.level] ?? 1.5)) / 60;

    return {
      format: "For Time",
      headline: `${params.rounds} Runden · Cap ${params.forTimeCap} Min`,
      lines: exercises.map((ex, i) => withLoad(ex, formatAmount(ex, finalQty[i]))),
      notes: `${params.rounds} Runden, so schnell wie möglich. Time Cap: ${params.forTimeCap} Min (geschätzte Dauer: ~${estMin.toFixed(0)} Min). Load: ${profile.load}${vestNote(params.hasVest)}`,
      relaxed,
    };
  }

  if (format === "emom") {
    n = Math.min(4, Math.max(2, pool.length));
    exercises = pickDiversePatterns(pool, n);
    relaxed = false;
    const stationSec = params.stationSec;
    const roundsThroughCycle = Math.max(1, Math.floor((params.totalMinutes * 60) / (stationSec * exercises.length)));
    const usedMin = (roundsThroughCycle * exercises.length * stationSec) / 60;
    const leftoverMin = params.totalMinutes - usedMin;
    return {
      format: "EMOM",
      headline: `EMOM ${params.totalMinutes} Min`,
      lines: exercises.map((ex) => {
        const budgetSec = Math.max(stationSec - 8, 10);
        const bounds = qtyBounds(ex);
        const qty = clamp(Math.round(budgetSec / (unitTime(ex) || 2)), bounds.min, bounds.max);
        return withLoad(ex, formatAmount(ex, qty));
      }),
      notes: `${exercises.length} Stationen, jede ${stationSec}s. Rotation läuft ${roundsThroughCycle}x durch (${usedMin.toFixed(0)} von ${params.totalMinutes} Min)${leftoverMin >= stationSec / 60 ? `, Rest als Cool-down` : ""}. Reps/Meter pro Station an Zeitbudget angepasst.${vestNote(params.hasVest)}`,
      relaxed,
    };
  }

  if (format === "chipper") {
    const desired = pool.length >= 6 ? Math.min(10, pool.length) : pool.length;
    n = desired;
    exercises = pickDiversePatterns(pool, n);
    relaxed = false;
    const volumeFactor = CHIPPER_VOLUME_FACTOR[params.volume] ?? 1;

    // Basis kommt jetzt aus dem recherchierten repRange je Übung (statt einer
    // pauschalen Kategorie-Tabelle), der Umfang-Regler skaliert relativ dazu;
    // die absolute Höhe wird zusätzlich am Time Cap (+ Level/Intensität) skaliert.
    const baseQty = exercises.map((ex) => Math.max(qtyFloor(ex), Math.round(pickQtyForExercise(ex, profile) * volumeFactor)));
    const baseRawSec = exercises.reduce((sum, ex, i) => sum + baseQty[i] * unitTime(ex), 0);
    const targetSec = targetRawSeconds(params.chipperCap, params.level, params.intensity);
    const scale = baseRawSec > 0 ? clamp(targetSec / baseRawSec, 0.4, 4) : 1;
    const finalQty = baseQty.map((q, i) => Math.max(qtyFloor(exercises[i]), Math.round(q * scale)));
    const estMin = (finalQty.reduce((sum, q, i) => sum + q * unitTime(exercises[i]), 0) * (LEVEL_PACE_FACTOR[params.level] ?? 1.5)) / 60;

    return {
      format: "Chipper",
      headline: `Chipper · ${params.volume === "niedrig" ? "leicht" : params.volume === "hoch" ? "hoch" : "mittel"} · Cap ${params.chipperCap} Min`,
      lines: exercises.map((ex, i) => withLoad(ex, formatAmount(ex, finalQty[i]))),
      notes: `Einmal der Reihe nach durch, so schnell wie möglich. Time Cap: ${params.chipperCap} Min (geschätzte Dauer: ~${estMin.toFixed(0)} Min). Umfang: ${params.volume}.${vestNote(params.hasVest)}`,
      relaxed,
    };
  }

  if (format === "ladder") {
    // Reps bleiben nutzergesteuert (Startreps/Steigerung/Runden), daher werden
    // Distanz-Übungen hier ausgeschlossen (kleine Rep-Leiter passt nicht zu
    // Metern). Stattdessen wird die geschätzte Dauer gegen den Cap gespiegelt.
    const ladderPool = pool.filter((ex) => !isDistanceBased(ex) && !isTimeBased(ex));
    n = Math.min(3, Math.max(2, ladderPool.length));
    ({ selected: exercises, relaxed } = pickBalanced(ladderPool, n));
    const totalRepsAcrossRounds = Array.from({ length: params.rungs }, (_, r) => params.startReps + r * params.increment).reduce((a, b) => a + b, 0);
    const rawSec = exercises.reduce((sum, ex) => sum + unitTime(ex), 0) * totalRepsAcrossRounds;
    const estMin = (rawSec * (LEVEL_PACE_FACTOR[params.level] ?? 1.5)) / 60;
    const capComparison =
      estMin > params.ladderCap
        ? ` Achtung: geschätzte Dauer (~${estMin.toFixed(0)} Min) liegt über dem Cap — Steigerung oder Rundenzahl reduzieren.`
        : ` Geschätzte Dauer: ~${estMin.toFixed(0)} Min (Puffer bis Cap: ${(params.ladderCap - estMin).toFixed(0)} Min).`;

    return {
      format: "Ladder",
      headline: `Ladder · ${params.rungs} Runden · Cap ${params.ladderCap} Min`,
      lines: exercises.map((ex) => withLoad(ex, `${params.startReps}→+${params.increment}`)),
      notes: `Runde 1: ${params.startReps} Wdh. je Übung, danach pro Runde +${params.increment}. ${params.rungs} Runden. Time Cap: ${params.ladderCap} Min.${capComparison}${vestNote(params.hasVest)}`,
      relaxed,
    };
  }

  if (format === "descending") {
    // 21-15-9-Familie (Stage 1): gleiches Rep-Schema für alle Übungen, Reps
    // sinken (oder steigen bei 50-40-30-20-10) jede Runde gemeinsam. Zeit-Halte-
    // und Distanz-Übungen ausgeschlossen, da ein festes Rep-Schema (21-15-9)
    // für Sekunden/Meter keine sinnvolle Bedeutung hat.
    const schemeDef = REP_SCHEMES.find((s) => s.id === params.repScheme) ?? REP_SCHEMES[0];
    const descendingPool = pool.filter((ex) => !isDistanceBased(ex) && !isTimeBased(ex));
    n = Math.min(params.movementCount ?? 2, Math.max(2, descendingPool.length));
    ({ selected: exercises, relaxed } = pickBalanced(descendingPool, n, ["strength", "gymnastics", "monostructural"]));
    const totalRepsPerMovement = schemeDef.reps.reduce((a, b) => a + b, 0);
    const totalSec = exercises.reduce((sum, ex) => sum + totalRepsPerMovement * unitTime(ex), 0);
    const estMin = (totalSec * (LEVEL_PACE_FACTOR[params.level] ?? 1.5)) / 60;

    return {
      format: "21-15-9",
      headline: `${schemeDef.label} · ${exercises.length} Übungen`,
      lines: exercises.map((ex) => withLoad(ex, schemeDef.label)),
      notes: `${schemeDef.label} Wiederholungen, gleiches Schema für alle Übungen, so schnell wie möglich. Geschätzte Dauer: ~${estMin.toFixed(0)} Min.${vestNote(params.hasVest)}`,
      relaxed,
      repScheme: schemeDef.reps,
    };
  }

  if (format === "sprint") {
    // Einzelübung, fixe Gesamtreps, for time (Grace/Isabel/Karen-Stil).
    exercises = pickDiversePatterns(pool, 1);
    relaxed = false;
    const ex = exercises[0];
    const targetSec = targetRawSeconds(params.sprintCap, params.level, params.intensity);
    const qty = ex ? Math.max(isDistanceBased(ex) ? 20 : qtyFloor(ex), Math.round(targetSec / (unitTime(ex) || 2))) : 0;
    const estMin = ex ? (qty * unitTime(ex) * (LEVEL_PACE_FACTOR[params.level] ?? 1.5)) / 60 : 0;

    return {
      format: "Sprint",
      headline: ex ? `Sprint · ${formatAmount(ex, qty)} ${ex.name}` : "Sprint",
      lines: ex ? [withLoad(ex, formatAmount(ex, qty))] : [],
      notes: `Eine Übung, feste Gesamtzahl, so schnell wie möglich. Time Cap: ${params.sprintCap} Min (geschätzte Dauer: ~${estMin.toFixed(0)} Min).${vestNote(params.hasVest)}`,
      relaxed,
    };
  }

  if (format === "tabata") {
    // 8 Runden à 20s Arbeit / 10s Pause je Übung; mehrere Übungen werden als
    // Blöcke mit 60s Pause dazwischen gestapelt. Ziel-Reps sind eine Vorgabe,
    // keine feste Vorschrift — Tabata wird auf maximale Reps pro Runde gewertet.
    n = clamp(params.tabataStations ?? 4, 1, 6);
    exercises = pickDiversePatterns(pool, Math.min(n, pool.length));
    relaxed = false;
    const totalMin = (exercises.length * (TABATA_ROUNDS * (TABATA_WORK_SEC + TABATA_REST_SEC)) + Math.max(0, exercises.length - 1) * TABATA_BLOCK_REST_SEC) / 60;

    return {
      format: "Tabata",
      headline: `Tabata · ${exercises.length} Übungen`,
      lines: exercises.map((ex) => {
        const tb = qtyBounds(ex);
        const targetQty = clamp(Math.round(TABATA_WORK_SEC / (unitTime(ex) || 2)), tb.min, Math.min(tb.max, 60));
        return withLoad(ex, `Ziel ${formatAmount(ex, targetQty)}/Runde`);
      }),
      notes: `${TABATA_ROUNDS} Runden à ${TABATA_WORK_SEC}s Arbeit / ${TABATA_REST_SEC}s Pause je Übung${exercises.length > 1 ? `, ${TABATA_BLOCK_REST_SEC}s Pause zwischen Übungen` : ""}. Gesamtdauer: ~${totalMin.toFixed(0)} Min. Score: niedrigste Rundenzahl oder Gesamtreps.${vestNote(params.hasVest)}`,
      relaxed,
    };
  }

  if (format === "death_by") {
    // Ascending EMOM bis zum Scheitern: Minute 1 = 1 Rep, +1 pro Minute.
    // Bevorzugt kardio-limitierte Bewegungen statt schwerer Kraftübungen.
    const cardioPool = pool.filter((ex) => ex.category === "monostructural" || ex.category === "gymnastics");
    exercises = pickDiversePatterns(cardioPool.length ? cardioPool : pool, 1);
    relaxed = false;
    const ex = exercises[0];
    const t = ex ? (unitTime(ex) || 2) * (LEVEL_PACE_FACTOR[params.level] ?? 1.5) : 2;
    const estFailMinute = ex ? Math.max(3, Math.floor(60 / t)) : 0;

    return {
      format: "Death By",
      headline: ex ? `Death By · ${ex.name}` : "Death By",
      lines: ex ? [withLoad(ex, "+1/Minute")] : [],
      notes: `Minute 1: 1 Wdh., danach +1 pro Minute bis das Pensum nicht mehr in 60s schaffbar ist. Geschätztes Scheitern: ~Minute ${estFailMinute}.${vestNote(params.hasVest)}`,
      relaxed,
    };
  }

  if (format === "fgb") {
    // Fight Gone Bad: feste Runden-/Stationsstruktur, Reps am 60s-Zeitbudget
    n = clamp(params.fgbStations ?? 5, 3, 6);
    exercises = pickDiversePatterns(pool, Math.min(n, pool.length));
    relaxed = false;
    const fgbRounds = params.fgbRounds ?? 3;
    const totalFgbMin = (fgbRounds * exercises.length * FGB_STATION_SEC + Math.max(0, fgbRounds - 1) * FGB_STATION_SEC) / 60;

    return {
      format: "Fight Gone Bad",
      headline: `Fight Gone Bad · ${fgbRounds} Runden × ${exercises.length} Stationen`,
      lines: exercises.map((ex) => {
        const bounds = isDistanceBased(ex) ? { min: 10, max: 400 } : { min: 5, max: 40 };
        const qty = clamp(Math.round(FGB_STATION_SEC / (unitTime(ex) || 2)), bounds.min, bounds.max);
        return withLoad(ex, formatAmount(ex, qty));
      }),
      notes: `${fgbRounds} Runden, jede Station ${FGB_STATION_SEC}s, ${FGB_STATION_SEC}s Pause zwischen Runden. Gesamtdauer: ~${totalFgbMin.toFixed(0)} Min. Score: Gesamtreps über alle Runden.${vestNote(params.hasVest)}`,
      relaxed,
    };
  }

  // varying_rounds — Runden mit jeweils eigenem Rep-Schema, bei denen einzelne
  // Slots über die Runden hinweg auch die Bewegung innerhalb ihrer Familie
  // wechseln dürfen (z.B. Squat Snatch → Power Snatch → Hang-Power-Snatch-
  // Ersatz). Deshalb wird hier bewusst NICHT über pickBalanced pro Runde neu
  // gewählt, sondern eine feste Slot-Struktur mit optionaler Familien-Rotation
  // pro Slot gebaut. Kardio-Slots (Kalorien/Meter) fallen tendenziell ab,
  // Kraft-/Gymnastics-Slots steigen tendenziell an — wie im klassischen
  // "Cardio runter, Kraftvolumen rauf"-Muster solcher Workouts.
  {
    const numRounds = clamp(params.varRounds ?? 3, 2, 6);
    const numSlots = Math.min(params.varSlots ?? 3, Math.max(2, pool.length));
    ({ selected: exercises, relaxed } = pickBalanced(pool, numSlots, ["monostructural", "strength", "gymnastics"]));

    const slots = exercises.map((baseEx) => {
      const familyPool = baseEx.family ? pool.filter((ex) => ex.family === baseEx.family) : [];
      const variesMovement = baseEx.category !== "monostructural" && familyPool.length >= 2;
      let movementSeq;
      if (variesMovement) {
        const shuffledFam = [...familyPool].sort(() => Math.random() - 0.5);
        movementSeq = Array.from({ length: numRounds }, (_, r) => shuffledFam[r % shuffledFam.length]);
      } else {
        movementSeq = Array.from({ length: numRounds }, () => baseEx);
      }
      const direction = baseEx.category === "monostructural" ? "desc" : "asc";
      const baseline = pickQtyForExercise(baseEx, profile);
      const step = Math.max(isDistanceBased(baseEx) ? 5 : baseEx.category === "strength" ? 2 : 3, Math.round(baseline * 0.25));
      const center = (numRounds - 1) / 2;
      const rawQtyByRound = Array.from({ length: numRounds }, (_, r) => {
        const offset = step * (r - center) * (direction === "asc" ? 1 : -1);
        const floor = isDistanceBased(baseEx) ? 5 : 1;
        return Math.max(floor, Math.round(baseline - offset));
      });
      return { movementSeq, rawQtyByRound, baseEx };
    });

    // Am Time Cap (+ Level/Intensität) skalieren, wie bei For Time/Chipper.
    const baseTotalSec = slots.reduce(
      (sum, slot) => sum + slot.rawQtyByRound.reduce((s, q, r) => s + q * unitTime(slot.movementSeq[r]), 0),
      0
    );
    const targetSec = targetRawSeconds(params.varCap, params.level, params.intensity);
    const scale = baseTotalSec > 0 ? clamp(targetSec / baseTotalSec, 0.4, 4) : 1;
    const finalSlots = slots.map((slot) => ({
      ...slot,
      qtyByRound: slot.rawQtyByRound.map((q) => Math.max(qtyFloor(slot.baseEx), Math.round(q * scale))),
    }));

    const roundsData = Array.from({ length: numRounds }, (_, r) => ({
      roundLabel: `Runde ${r + 1}`,
      items: finalSlots.map((slot) => withLoad(slot.movementSeq[r], formatAmount(slot.movementSeq[r], slot.qtyByRound[r]))),
    }));

    const totalSec = finalSlots.reduce(
      (sum, slot) => sum + slot.qtyByRound.reduce((s, q, r) => s + q * unitTime(slot.movementSeq[r]), 0),
      0
    );
    const estMin = (totalSec * (LEVEL_PACE_FACTOR[params.level] ?? 1.5)) / 60;
    const varyingSlotNames = finalSlots
      .filter((slot) => new Set(slot.movementSeq.map((ex) => ex.id)).size > 1)
      .map((slot) => slot.movementSeq[0].family);
    const varyNote = varyingSlotNames.length
      ? ` Bewegungsvariante wechselt pro Runde bei: ${[...new Set(varyingSlotNames)].join(", ")}.`
      : "";

    return {
      format: "Variable Runden",
      headline: `${numRounds} Runden, unterschiedliches Schema · Cap ${params.varCap} Min`,
      lines: roundsData.flatMap((rd) => rd.items.map((item) => ({ ...item, name: `${rd.roundLabel}: ${item.name}` }))),
      roundsData,
      notes: `${numRounds} Runden, jede Runde mit eigenem Rep-Schema, so schnell wie möglich. Time Cap: ${params.varCap} Min (geschätzte Dauer: ~${estMin.toFixed(0)} Min).${varyNote}${vestNote(params.hasVest)}`,
      relaxed,
    };
  }
}

/* ============================================================
   UI-KOMPONENTEN
   ============================================================ */
function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="chip" data-active={active}>
      {children}
    </button>
  );
}

function SegButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="seg-btn" data-active={active}>
      {children}
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState("workout");
  const [workoutMode, setWorkoutMode] = useState("individuell");
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState(null);
  const [format, setFormat] = useState("amrap");
  const [level, setLevel] = useState("intermediate");
  const [intensity, setIntensity] = useState("normal");
  const [gender, setGender] = useState("male");
  const [equipment, setEquipment] = useState(["bodyweight", "kettlebell", "pullup_bar"]);
  const [exclude, setExclude] = useState([]);
  const [duration, setDuration] = useState(15);
  const [sets, setSets] = useState(5);
  const [rounds, setRounds] = useState(4);
  const [forTimeCap, setForTimeCap] = useState(12);
  const [forTimeExercises, setForTimeExercises] = useState(5);
  const [emomMinutes, setEmomMinutes] = useState(12);
  const [emomInterval, setEmomInterval] = useState(60);
  const [chipperVolume, setChipperVolume] = useState("mittel");
  const [chipperCap, setChipperCap] = useState(20);
  const [ladderRungs, setLadderRungs] = useState(5);
  const [ladderIncrement, setLadderIncrement] = useState(1);
  const [ladderStartReps, setLadderStartReps] = useState(1);
  const [ladderCap, setLadderCap] = useState(15);
  const [repScheme, setRepScheme] = useState("21-15-9");
  const [movementCount, setMovementCount] = useState(2);
  const [sprintCap, setSprintCap] = useState(10);
  const [tabataStations, setTabataStations] = useState(4);
  const [fgbStations, setFgbStations] = useState(5);
  const [fgbRounds, setFgbRounds] = useState(3);
  const [varRounds, setVarRounds] = useState(3);
  const [varSlots, setVarSlots] = useState(3);
  const [varCap, setVarCap] = useState(16);
  const [workout, setWorkout] = useState(null);
  const [empty, setEmpty] = useState(false);
  const [saved, setSaved] = useState([]);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  // Kondition-Tab: Compromised Running
  const [konditionStructure, setKonditionStructure] = useState("compromised");
  const [konditionTimeCap, setKonditionTimeCap] = useState(40);
  const [konditionRunDistance, setKonditionRunDistance] = useState(400);
  const [konditionStationMode, setKonditionStationMode] = useState("rotation");
  const [konditionStationsPerRound, setKonditionStationsPerRound] = useState(1);
  const [konditionSelectedStation, setKonditionSelectedStation] = useState(HYROX_STATIONS[0].id);
  const [konditionCircuitSize, setKonditionCircuitSize] = useState(3);
  const [konditionDivision, setKonditionDivision] = useState("open");
  const [konditionExcludedExercises, setKonditionExcludedExercises] = useState([]);
  const [konditionStationDropdownOpen, setKonditionStationDropdownOpen] = useState(false);
  const [konditionWorkout, setKonditionWorkout] = useState(null);
  const [konditionCopied, setKonditionCopied] = useState(false);
  const [konditionCopyFailed, setKonditionCopyFailed] = useState(false);

  // Kraft-Tab
  const [kraftStructure, setKraftStructure] = useState("straight");
  const [kraftGoal, setKraftGoal] = useState("strengthsize");
  const [kraftScheme, setKraftScheme] = useState("auto");
  const [kraftWeek, setKraftWeek] = useState(1);
  const [kraftFocus, setKraftFocus] = useState("full");
  const [kraftCount, setKraftCount] = useState(3);
  const [kraftExcludedExercises, setKraftExcludedExercises] = useState([]);
  const [kraftDropdownOpen, setKraftDropdownOpen] = useState(false);
  const [kraftWorkout, setKraftWorkout] = useState(null);
  const [kraftEmpty, setKraftEmpty] = useState(false);
  const [kraftCopied, setKraftCopied] = useState(false);
  const [kraftCopyFailed, setKraftCopyFailed] = useState(false);
  // 1RM je Übung (kg, als Text, damit Tippen mit Komma/Punkt funktioniert) — wird, wenn möglich, im Browser gemerkt
  const [kraftOneRMs, setKraftOneRMs] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = JSON.parse(window.localStorage.getItem("board.kraft.oneRMs") || "{}");
        if (stored && typeof stored === "object") return stored;
      }
    } catch (err) {
      /* Speicher nicht verfügbar — dann eben ohne Merken */
    }
    return {};
  });
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("board.kraft.oneRMs", JSON.stringify(kraftOneRMs));
      }
    } catch (err) {
      /* ignorieren */
    }
  }, [kraftOneRMs]);
  const setKraftOneRM = (name, value) => setKraftOneRMs((prev) => ({ ...prev, [name]: value }));
  // Freier 1RM-Rechner
  const [kraftCalcRM, setKraftCalcRM] = useState("");
  const [kraftCalcPct, setKraftCalcPct] = useState("");


  const toggle = (list, setList, id) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  function handleGenerate() {
    const pool = filterExercises(EXERCISES, { equipment, level, focus: "combination", exclude });
    const params = {
      duration,
      sets,
      rounds,
      forTimeCap,
      forTimeExercises,
      totalMinutes: emomMinutes,
      stationSec: emomInterval,
      volume: chipperVolume,
      chipperCap,
      rungs: ladderRungs,
      increment: ladderIncrement,
      startReps: ladderStartReps,
      ladderCap,
      repScheme,
      movementCount,
      sprintCap,
      tabataStations,
      fgbStations,
      fgbRounds,
      varRounds,
      varSlots,
      varCap,
      hasVest: equipment.includes("weight_vest"),
      level,
      intensity,
      gender,
    };

    if (workoutMode === "benchmark") {
      const benchmark = BENCHMARKS.find((b) => b.id === selectedBenchmarkId);
      const poolIds = new Set(pool.map((ex) => ex.id));
      const stillEligible = benchmark && benchmark.movements.every((m) => poolIds.has(m.id));
      if (!stillEligible) {
        setEmpty(true);
        setWorkout(null);
        return;
      }
      setEmpty(false);
      setWorkout(buildFromBenchmark(benchmark, params));
      setCopied(false);
      return;
    }

    if (pool.length === 0) {
      setEmpty(true);
      setWorkout(null);
      return;
    }
    setEmpty(false);
    setWorkout(buildWorkout(pool, format, "combination", params));
    setCopied(false);
  }

  function saveWorkout() {
    if (!workout) return;
    setSaved([{ ...workout, savedAt: Date.now() }, ...saved]);
  }

  function copyWorkout() {
    if (!workout) return;
    const text = [
      ...(workout.isBenchmark ? [`★ Benchmark: ${workout.benchmarkName}`] : []),
      workout.format,
      workout.headline,
      ...workout.lines.map((l) => `${l.amount} ${l.name}${l.load ? (l.loadKind === "movement" ? ` (Einsteiger-Variante: ${l.load})` : ` — ${l.load}`) : ""}`),
      workout.notes,
    ].join("\n");
    copyToClipboard(
      text,
      () => {
        setCopyFailed(false);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => {
        setCopied(false);
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 4000);
      }
    );
  }

  function handleGenerateKondition() {
    const workout =
      konditionStructure === "buyin"
        ? buildBuyInCircuit({
            equipment,
            division: konditionDivision,
            gender,
            timeCapMin: konditionTimeCap,
            circuitSize: konditionCircuitSize,
            excludedExercises: konditionExcludedExercises,
          })
        : buildCompromisedRun({
            equipment,
            runDistance: konditionRunDistance,
            stationMode: konditionStationMode,
            selectedStationId: konditionSelectedStation,
            stationsPerRound: konditionStationsPerRound,
            division: konditionDivision,
            gender,
            timeCapMin: konditionTimeCap,
            excludedExercises: konditionExcludedExercises,
          });
    setKonditionWorkout(workout);
    setKonditionCopied(false);
  }

  function handleGenerateKraft() {
    const result = buildKraftWorkout({
      equipment,
      structure: kraftStructure,
      goal: kraftGoal,
      scheme: kraftScheme,
      week: kraftWeek,
      focus: kraftFocus,
      count: kraftCount,
      excludedExercises: kraftExcludedExercises,
    });
    setKraftWorkout(result);
    setKraftEmpty(result === null);
    setKraftCopied(false);
  }

  function copyKraftWorkout() {
    if (!kraftWorkout) return;
    const text = [
      kraftWorkout.format,
      kraftWorkout.headline,
      ...kraftWorkout.groups.flatMap((g) => {
        const rm = kraftParseNum(kraftOneRMs[g.name]);
        const unit = g.perHand ? " je Hantel" : g.bodyweight ? " gesamt" : "";
        return [
          `${g.name} (${g.tag})${rm > 0 ? ` — 1RM ${kraftFmtKg(rm)} kg` : ""}`,
          ...g.sets.map((s) => {
            const kg = rm > 0 ? ` = ${kraftFmtKg(kraftRoundKg((rm * s.pct) / 100))} kg${unit}` : "";
            return `  ${s.amount} @ ${s.pctLabel}${kg}${s.tag ? ` · ${s.tag}` : ""} · ${s.restLabel}`;
          }),
        ];
      }),
      kraftWorkout.notes,
    ].join("\n");
    copyToClipboard(
      text,
      () => {
        setKraftCopyFailed(false);
        setKraftCopied(true);
        setTimeout(() => setKraftCopied(false), 1800);
      },
      () => {
        setKraftCopied(false);
        setKraftCopyFailed(true);
        setTimeout(() => setKraftCopyFailed(false), 4000);
      }
    );
  }

  function copyKonditionWorkout() {
    if (!konditionWorkout) return;
    const text = [
      konditionWorkout.format,
      konditionWorkout.headline,
      ...konditionWorkout.lines.map((l) => `${l.amount} ${l.name}${l.load ? ` — ${l.load}` : ""}`),
      konditionWorkout.notes,
    ].join("\n");
    copyToClipboard(
      text,
      () => {
        setKonditionCopyFailed(false);
        setKonditionCopied(true);
        setTimeout(() => setKonditionCopied(false), 1800);
      },
      () => {
        setKonditionCopied(false);
        setKonditionCopyFailed(true);
        setTimeout(() => setKonditionCopyFailed(false), 4000);
      }
    );
  }

  const canGenerate = useMemo(() => equipment.length > 0, [equipment]);
  const eligibleBenchmarksList = useMemo(() => {
    const pool = filterExercises(EXERCISES, { equipment, level, focus: "combination", exclude });
    const poolIds = new Set(pool.map((ex) => ex.id));
    return BENCHMARKS.filter((b) => b.movements.every((m) => poolIds.has(m.id)));
  }, [equipment, level, exclude]);
  // Alle Übungen, die mit dem aktuell gewählten Equipment grundsätzlich möglich sind —
  // Basis für das "Einzelne Übungen ausschließen"-Dropdown (unabhängig von Level/Fokus).
  const equipmentPool = useMemo(
    () => [...filterExercises(EXERCISES, { equipment })].sort((a, b) => a.name.localeCompare(b.name)),
    [equipment]
  );
  const [exerciseDropdownOpen, setExerciseDropdownOpen] = useState(false);
  const excludedExerciseCount = useMemo(
    () => exclude.filter((id) => equipmentPool.some((ex) => ex.id === id)).length,
    [exclude, equipmentPool]
  );
  // Alle Übungen, die mit dem gewählten Equipment im Kondition-Tab möglich sind — nach Namen
  // entdoppelt (mehrere Stationen enden sonst bei derselben Ausweichübung, z.B. Burpee/Lunge).
  const konditionAvailableExercises = useMemo(() => {
    const equipmentSet = new Set(equipment);
    const names = new Set();
    HYROX_STATIONS.forEach((station) =>
      station.variants.forEach((v) => {
        if (v.requiredEquipment.every((eq) => equipmentSet.has(eq))) names.add(v.name);
      })
    );
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [equipment]);
  // Stationen, die mit dem gewählten Equipment überhaupt möglich sind (für die "Welche Station"-Auswahl)
  const konditionSelectableStationIds = useMemo(() => {
    const equipmentSet = new Set(equipment);
    return new Set(HYROX_STATIONS.filter((s) => pickHyroxVariant(s, equipmentSet)).map((s) => s.id));
  }, [equipment]);
  // Kraft-Tab: alle Übungen, die mit dem gewählten Equipment möglich sind (fürs Ausschluss-Dropdown)
  const kraftAvailableExercises = useMemo(() => {
    const equipmentSet = new Set(equipment);
    const groups = new Set(KRAFT_FOCUS_GROUPS[kraftFocus] ?? KRAFT_FOCUS_GROUPS.full);
    return KRAFT_EXERCISES.filter((ex) => groups.has(ex.group) && ex.equipmentOptions.some((opt) => opt.every((e) => equipmentSet.has(e))))
      .map((ex) => ex.name)
      .sort((a, b) => a.localeCompare(b));
  }, [equipment, kraftFocus]);
  // Gibt es mit dem Equipment überhaupt Kraftübungen (egal welcher Fokus)? Nötig für die passende Hinweiszeile.
  const kraftHasAnyExercise = useMemo(() => {
    const equipmentSet = new Set(equipment);
    return KRAFT_EXERCISES.some((ex) => ex.equipmentOptions.some((opt) => opt.every((e) => equipmentSet.has(e))));
  }, [equipment]);
  const kraftExcludedCount = useMemo(
    () => kraftExcludedExercises.filter((name) => kraftAvailableExercises.includes(name)).length,
    [kraftExcludedExercises, kraftAvailableExercises]
  );
  const konditionExcludedCount = useMemo(
    () => konditionExcludedExercises.filter((name) => konditionAvailableExercises.includes(name)).length,
    [konditionExcludedExercises, konditionAvailableExercises]
  );

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        :root {
          --board: #1b1c1e;
          --board-soft: #232426;
          --board-line: #35373a;
          --chalk: #ece8de;
          --chalk-dim: #a9a6a0;
          --page: #eceeef;
          --panel: #ffffff;
          --ink: #1c1d1f;
          --ink-dim: #6b6d70;
          --red: #e2402b;
          --blue: #3f6f95;
          --yellow: #d9a63e;
          --line: #dcdedf;
        }
        * { box-sizing: border-box; }
        .app {
          background: var(--page);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          padding: 28px 20px 60px;
          min-height: 100%;
        }
        .header {
          max-width: 1040px;
          margin: 0 auto 22px;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          border-bottom: 3px solid var(--ink);
          padding-bottom: 14px;
        }
        .brand {
          font-family: 'Anton', sans-serif;
          font-size: 30px;
          letter-spacing: 0.5px;
          line-height: 1;
        }
        .brand span { color: var(--red); }
        .tabs { display: flex; gap: 4px; }
        .tab-btn {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 13.5px;
          padding: 9px 16px;
          background: transparent;
          border: 2px solid var(--ink);
          border-bottom: none;
          cursor: pointer;
          color: var(--ink-dim);
        }
        .tab-btn[data-active="true"] { background: var(--ink); color: var(--chalk); }

        .layout {
          max-width: 1040px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 22px;
          align-items: start;
        }
        @media (max-width: 760px) { .layout { grid-template-columns: 1fr; } }

        .panel {
          background: var(--panel);
          border: 2px solid var(--ink);
          padding: 20px;
        }
        .field { margin-bottom: 18px; }
        .field:last-child { margin-bottom: 0; }
        .field-label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-dim);
          margin-bottom: 8px;
          display: block;
        }
        .benchmark-empty-hint {
          font-size: 12.5px;
          color: var(--ink-dim);
          font-style: italic;
          line-height: 1.5;
        }
        .dropdown-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          padding: 9px 12px;
          background: var(--panel);
          border: 2px solid var(--ink);
          color: var(--ink);
          cursor: pointer;
        }
        .dropdown-toggle span:last-child {
          color: var(--ink-dim);
          font-size: 10px;
          margin-left: 8px;
        }
        .dropdown-panel {
          margin-top: 6px;
          max-height: 220px;
          overflow-y: auto;
          border: 1.5px solid var(--line);
          background: var(--panel);
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          font-size: 12.5px;
          color: var(--ink);
          border-bottom: 1px solid var(--line);
          cursor: pointer;
        }
        .dropdown-item:last-child { border-bottom: none; }
        .dropdown-item input { cursor: pointer; }
        .seg {
          display: flex;
          border: 2px solid var(--ink);
        }
        .seg-btn {
          flex: 1;
          padding: 8px 6px;
          font-size: 12.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          background: var(--panel);
          border: none;
          border-right: 2px solid var(--ink);
          cursor: pointer;
          color: var(--ink);
        }
        .seg-btn:last-child { border-right: none; }
        .seg-btn[data-active="true"] { background: var(--red); color: white; }

        .chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .chip {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 11px;
          border: 1.5px solid var(--line);
          background: var(--panel);
          border-radius: 3px;
          cursor: pointer;
          color: var(--ink-dim);
        }
        .chip[data-active="true"] {
          border-color: var(--blue);
          background: var(--blue);
          color: white;
        }

        .num-row { display: flex; align-items: center; gap: 10px; }
        .num-input {
          width: 64px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 15px;
          font-weight: 600;
          padding: 6px 8px;
          border: 2px solid var(--ink);
          text-align: center;
        }

        .generate-btn {
          width: 100%;
          margin-top: 20px;
          padding: 13px;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 14px;
          background: var(--red);
          color: white;
          border: none;
          cursor: pointer;
        }
        .generate-btn:disabled { background: var(--line); color: var(--ink-dim); cursor: not-allowed; }

        .board {
          background: var(--board);
          color: var(--chalk);
          min-height: 360px;
          padding: 30px 28px;
          position: relative;
          border: 2px solid var(--ink);
        }
        .board-empty {
          height: 100%;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--chalk-dim);
          text-align: center;
          gap: 10px;
          font-size: 13.5px;
        }
        .board-empty svg { opacity: 0.5; }
        .board-benchmark-badge {
          display: inline-block;
          font-family: 'Inter', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.3px;
          color: #1c1d1f;
          background: var(--yellow);
          padding: 4px 10px;
          border-radius: 3px;
          margin-bottom: 10px;
        }
        .board-round-group {
          margin-bottom: 6px;
        }
        .board-exercise-group {
          margin-top: 20px;
        }
        .board-exercise-group:first-child {
          margin-top: 0;
        }
        .board-exercise-head {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding-bottom: 4px;
          border-bottom: 2px solid var(--chalk-dim);
          margin-bottom: 2px;
        }
        .board-exercise-name {
          font-family: 'Anton', sans-serif;
          font-size: 24px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .board-rm {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          color: var(--chalk-dim);
        }
        .board-rm input {
          width: 76px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: var(--chalk);
          background: transparent;
          border: 1.5px solid var(--chalk-dim);
          padding: 4px 6px;
          text-align: right;
        }
        .board-rm input:focus { outline: none; border-color: var(--chalk); }
        .board-kg {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: var(--chalk);
        }
        .calc-panel { margin-top: 18px; }
        .calc-row { display: flex; flex-wrap: wrap; gap: 14px 18px; align-items: flex-end; }
        .calc-field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 600; color: var(--ink-dim); }
        .calc-input { width: 110px; }
        .calc-result { display: flex; flex-direction: column; gap: 2px; min-width: 160px; padding-bottom: 4px; font-size: 12px; color: var(--ink-dim); }
        .calc-result b { font-family: 'IBM Plex Mono', monospace; font-size: 22px; color: var(--ink); }
        .board-exercise-tag {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--yellow);
        }
        .board-round-label {
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          color: var(--red);
          margin-top: 16px;
          margin-bottom: 4px;
        }
        .board-round-group:first-child .board-round-label {
          margin-top: 0;
        }
        .board-format {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: var(--chalk-dim);
          margin-bottom: 2px;
        }
        .board-headline {
          font-family: 'Anton', sans-serif;
          font-size: 34px;
          margin-bottom: 22px;
          line-height: 1;
        }
        .board-line {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 14px;
          padding: 11px 0;
          border-bottom: 1px solid var(--board-line);
        }
        .board-line:last-of-type { border-bottom: none; }
        .board-amount {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          font-size: 19px;
          color: var(--red);
          min-width: 68px;
        }
        .board-name {
          font-family: 'Anton', sans-serif;
          font-size: 20px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .board-load {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--yellow);
          margin-left: auto;
          white-space: nowrap;
        }
        .board-load[data-kind="movement"] {
          color: var(--chalk-dim);
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-style: italic;
        }
        .board-notes {
          margin-top: 22px;
          padding-top: 16px;
          border-top: 1px dashed var(--board-line);
          font-size: 13px;
          color: var(--chalk-dim);
          line-height: 1.5;
        }
        .board-actions {
          display: flex;
          gap: 10px;
          margin-top: 22px;
        }
        .board-actions button {
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          padding: 9px 14px;
          background: transparent;
          border: 1.5px solid var(--chalk-dim);
          color: var(--chalk);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .board-actions button:hover { border-color: var(--chalk); }
        .board-actions button[data-failed="true"] {
          border-color: var(--red);
          color: var(--red);
        }

        .saved-section { max-width: 1040px; margin: 26px auto 0; }
        .saved-title { font-size: 12.5px; font-weight: 600; color: var(--ink-dim); margin-bottom: 10px; }
        .saved-item {
          background: var(--panel);
          border: 1.5px solid var(--line);
          padding: 12px 16px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }
        .saved-item-format { font-weight: 700; margin-right: 10px; }
        .saved-remove { background: none; border: none; cursor: pointer; color: var(--ink-dim); }

        .plan-controls { display: flex; gap: 22px; flex-wrap: wrap; margin-bottom: 4px; }

        .week-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .week-tab {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          font-weight: 600;
          padding: 7px 12px;
          border: 1.5px solid var(--ink);
          background: var(--panel);
          cursor: pointer;
        }
        .week-tab[data-active="true"] { background: var(--ink); color: var(--chalk); }
        .week-tab[data-deload="true"] { border-color: var(--yellow); color: #8a6a1c; }
        .week-tab[data-active="true"][data-deload="true"] { background: var(--yellow); color: #1c1d1f; }

        .day-card {
          background: var(--panel);
          border: 1.5px solid var(--line);
          border-left: 4px solid var(--blue);
          padding: 14px 16px;
          margin-bottom: 10px;
        }
        .day-card[data-type="strength"] { border-left-color: var(--red); }
        .day-card[data-type="skill"] { border-left-color: var(--yellow); }
        .day-card-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        .day-card-type { font-weight: 700; font-size: 13.5px; }
        .day-card-format { font-size: 11.5px; color: var(--ink-dim); }
        .day-card-list { font-size: 13px; color: var(--ink-dim); line-height: 1.6; }
        .day-card-list b { color: var(--ink); font-weight: 600; }
      `}</style>

      <div className="header">
        <div className="brand">THE <span>BOARD</span></div>
        <div className="tabs">
          <button className="tab-btn" data-active={tab === "kraft"} onClick={() => setTab("kraft")}>
            Kraft
          </button>
          <button className="tab-btn" data-active={tab === "kondition"} onClick={() => setTab("kondition")}>
            Kondition
          </button>
          <button className="tab-btn" data-active={tab === "workout"} onClick={() => setTab("workout")}>
            Workout
          </button>
        </div>
      </div>

      {tab === "kraft" && (
        <div className="layout">
          <div className="panel">
            <div className="field">
              <label className="field-label">Struktur</label>
              <div className="chip-row">
                {KRAFT_STRUCTURES.map((s) => (
                  <Chip key={s.id} active={kraftStructure === s.id} onClick={() => setKraftStructure(s.id)}>
                    {s.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">Ziel</label>
              <div className="chip-row">
                {KRAFT_GOAL_OPTIONS.map((g) => (
                  <Chip key={g.id} active={kraftGoal === g.id} onClick={() => setKraftGoal(g.id)}>
                    {g.label}
                  </Chip>
                ))}
              </div>
            </div>

            {kraftStructure === "straight" && (
              <div className="field">
                <label className="field-label">Schema</label>
                <div className="chip-row">
                  {KRAFT_SCHEME_OPTIONS.map((s) => (
                    <Chip key={s.id} active={kraftScheme === s.id} onClick={() => setKraftScheme(s.id)}>
                      {s.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {kraftStructure === "531" && (
              <div className="field">
                <label className="field-label">Woche im Zyklus</label>
                <div className="chip-row">
                  {KRAFT_WEEK_OPTIONS.map((w) => (
                    <Chip key={w.id} active={kraftWeek === w.id} onClick={() => setKraftWeek(w.id)}>
                      {w.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            <div className="field">
              <label className="field-label">Fokus</label>
              <div className="seg">
                {KRAFT_FOCUS_OPTIONS.map((f) => (
                  <SegButton key={f.id} active={kraftFocus === f.id} onClick={() => setKraftFocus(f.id)}>
                    {f.label}
                  </SegButton>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">Anzahl Übungen</label>
              <div className="num-row">
                <input className="num-input" type="number" min={1} max={5} value={kraftCount} onChange={(e) => setKraftCount(clamp(Number(e.target.value) || 1, 1, 5))} />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Equipment</label>
              <div className="chip-row">
                {KRAFT_EQUIPMENT_OPTIONS.map((opt) => (
                  <Chip key={opt.id} active={equipment.includes(opt.id)} onClick={() => toggle(equipment, setEquipment, opt.id)}>
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">
                Einzelne Übungen ausschließen · {(KRAFT_FOCUS_OPTIONS.find((f) => f.id === kraftFocus) ?? KRAFT_FOCUS_OPTIONS[0]).label}
              </label>
              <button type="button" className="dropdown-toggle" onClick={() => setKraftDropdownOpen(!kraftDropdownOpen)}>
                <span>
                  {kraftExcludedCount > 0
                    ? `${kraftExcludedCount} Übung${kraftExcludedCount > 1 ? "en" : ""} ausgeschlossen`
                    : "Alle verfügbaren Übungen aktiv"}
                </span>
                <span>{kraftDropdownOpen ? "▲" : "▼"}</span>
              </button>
              {kraftDropdownOpen && (
                <div className="dropdown-panel">
                  {kraftAvailableExercises.length === 0 ? (
                    <div className="benchmark-empty-hint">
                      {kraftHasAnyExercise
                        ? "Für diesen Fokus gibt es mit dem aktuellen Equipment keine Übung — es wird dann Ganzkörper verwendet."
                        : "Mit dem aktuellen Equipment ist keine Kraftübung möglich."}
                    </div>
                  ) : (
                    kraftAvailableExercises.map((name) => (
                      <label className="dropdown-item" key={name}>
                        <input
                          type="checkbox"
                          checked={!kraftExcludedExercises.includes(name)}
                          onChange={() => toggle(kraftExcludedExercises, setKraftExcludedExercises, name)}
                        />
                        {name}
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            <button className="generate-btn" onClick={handleGenerateKraft}>
              Workout generieren
            </button>
          </div>

          <div>
          <div className="board">
            {!kraftWorkout && !kraftEmpty && (
              <div className="board-empty">
                <Dumbbell size={30} />
                <div>Stelle links deine Präferenzen ein<br />und generiere dein Kraft-Workout.</div>
              </div>
            )}
            {kraftEmpty && (
              <div className="board-empty">
                <X size={30} />
                <div>Kein Kraft-Workout möglich — mit dem gewählten<br />Equipment gibt es keine passende Übung.</div>
              </div>
            )}
            {kraftWorkout && (
              <>
                <div className="board-format">{kraftWorkout.format}</div>
                <div className="board-headline">{kraftWorkout.headline}</div>
                <div>
                  {kraftWorkout.groups.map((g, gi) => (
                    <div className="board-exercise-group" key={gi}>
                      <div className="board-exercise-head">
                        <span className="board-exercise-name">{g.name}</span>
                        <span className="board-exercise-tag">{g.tag}</span>
                        <label className="board-rm">
                          <span>1RM</span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            inputMode="decimal"
                            placeholder="kg"
                            value={kraftOneRMs[g.name] ?? ""}
                            onChange={(e) => setKraftOneRM(g.name, e.target.value)}
                          />
                        </label>
                      </div>
                      {g.sets.map((s, si) => {
                        const rm = kraftParseNum(kraftOneRMs[g.name]);
                        return (
                          <div className="board-line" key={si}>
                            <span className="board-amount">{s.amount}</span>
                            <span className="board-name">{s.pctLabel}</span>
                            {rm > 0 && (
                              <span className="board-kg">
                                {kraftFmtKg(kraftRoundKg((rm * s.pct) / 100))} kg{g.perHand ? " je Hantel" : g.bodyweight ? " gesamt" : ""}
                              </span>
                            )}
                            <span className="board-load" data-kind="movement">
                              {s.tag ? `${s.tag} · ` : ""}
                              {s.restLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="board-notes">{kraftWorkout.notes}</div>
                <div className="board-actions">
                  <button onClick={handleGenerateKraft}><RotateCcw size={14} /> Neu generieren</button>
                  <button onClick={copyKraftWorkout} data-failed={kraftCopyFailed}>
                    {kraftCopied ? <Check size={14} /> : kraftCopyFailed ? <X size={14} /> : <Copy size={14} />}{" "}
                    {kraftCopied ? "Kopiert" : kraftCopyFailed ? "Fehlgeschlagen — Dialog beachten" : "Kopieren"}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="panel calc-panel">
            <label className="field-label">1RM-Rechner: Prozent in kg umrechnen</label>
            <div className="calc-row">
              <label className="calc-field">
                <span>1RM (kg)</span>
                <input className="num-input calc-input" type="number" min="0" step="0.5" inputMode="decimal" placeholder="z. B. 120" value={kraftCalcRM} onChange={(e) => setKraftCalcRM(e.target.value)} />
              </label>
              <label className="calc-field">
                <span>Prozent (%)</span>
                <input className="num-input calc-input" type="number" min="0" max="120" step="0.5" inputMode="decimal" placeholder="z. B. 80" value={kraftCalcPct} onChange={(e) => setKraftCalcPct(e.target.value)} />
              </label>
              <div className="calc-result">
                {kraftParseNum(kraftCalcRM) > 0 && kraftParseNum(kraftCalcPct) > 0 ? (
                  <>
                    <b>{kraftFmtKg(kraftRoundKg((kraftParseNum(kraftCalcRM) * kraftParseNum(kraftCalcPct)) / 100))} kg</b>
                    <span>
                      exakt {kraftFmtKg((kraftParseNum(kraftCalcRM) * kraftParseNum(kraftCalcPct)) / 100)} kg · gerundet auf 2,5 kg
                    </span>
                  </>
                ) : (
                  <span>1RM und Prozent eingeben</span>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {tab === "kondition" && (
        <div className="layout">
          <div className="panel">
            <div className="field">
              <label className="field-label">Struktur</label>
              <div className="seg">
                <SegButton active={konditionStructure === "compromised"} onClick={() => setKonditionStructure("compromised")}>Compromised Running</SegButton>
                <SegButton active={konditionStructure === "buyin"} onClick={() => setKonditionStructure("buyin")}>Buy-in Circuit</SegButton>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Belastung</label>
              <div className="seg">
                <SegButton active={konditionDivision === "open"} onClick={() => setKonditionDivision("open")}>Standard</SegButton>
                <SegButton active={konditionDivision === "pro"} onClick={() => setKonditionDivision("pro")}>Schwer</SegButton>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Geschlecht (für Lastvorgaben)</label>
              <div className="seg">
                <SegButton active={gender === "male"} onClick={() => setGender("male")}>Männlich</SegButton>
                <SegButton active={gender === "female"} onClick={() => setGender("female")}>Weiblich</SegButton>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Time Cap (Min)</label>
              <div className="num-row">
                <input className="num-input" type="number" min={30} max={60} value={konditionTimeCap} onChange={(e) => setKonditionTimeCap(clamp(Number(e.target.value), 30, 60))} />
              </div>
            </div>

            {konditionStructure === "compromised" && (
              <>
                <div className="field">
                  <label className="field-label">Laufdistanz pro Runde (m)</label>
                  <div className="num-row">
                    <input className="num-input" type="number" min={200} max={1000} step={100} value={konditionRunDistance} onChange={(e) => setKonditionRunDistance(Number(e.target.value))} />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Stationen</label>
                  <div className="seg">
                    <SegButton active={konditionStationMode === "rotation"} onClick={() => setKonditionStationMode("rotation")}>Rotation</SegButton>
                    <SegButton active={konditionStationMode === "single"} onClick={() => setKonditionStationMode("single")}>Eine Station</SegButton>
                  </div>
                </div>

                {konditionStationMode === "single" ? (
                  <div className="field">
                    <label className="field-label">Welche Station</label>
                    <div className="chip-row">
                      {HYROX_STATIONS.filter((s) => konditionSelectableStationIds.has(s.id)).map((s) => (
                        <Chip key={s.id} active={konditionSelectedStation === s.id} onClick={() => setKonditionSelectedStation(s.id)}>
                          {s.variants[0].name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="field">
                    <label className="field-label">Übungen pro Runde</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={1} max={3} value={konditionStationsPerRound} onChange={(e) => setKonditionStationsPerRound(clamp(Number(e.target.value), 1, 3))} />
                    </div>
                  </div>
                )}
              </>
            )}

            {konditionStructure === "buyin" && (
              <div className="field">
                <label className="field-label">Übungen pro Zirkel-Runde</label>
                <div className="num-row">
                  <input className="num-input" type="number" min={2} max={4} value={konditionCircuitSize} onChange={(e) => setKonditionCircuitSize(clamp(Number(e.target.value), 2, 4))} />
                </div>
              </div>
            )}

            <div className="field">
              <label className="field-label">Equipment</label>
              <div className="chip-row">
                {KONDITION_EQUIPMENT_OPTIONS.map((opt) => (
                  <Chip key={opt.id} active={equipment.includes(opt.id)} onClick={() => toggle(equipment, setEquipment, opt.id)}>
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">Einzelne Übungen ausschließen</label>
              <button
                type="button"
                className="dropdown-toggle"
                onClick={() => setKonditionStationDropdownOpen(!konditionStationDropdownOpen)}
              >
                <span>
                  {konditionExcludedCount > 0
                    ? `${konditionExcludedCount} Übung${konditionExcludedCount > 1 ? "en" : ""} ausgeschlossen`
                    : "Alle verfügbaren Übungen aktiv"}
                </span>
                <span>{konditionStationDropdownOpen ? "▲" : "▼"}</span>
              </button>
              {konditionStationDropdownOpen && (
                <div className="dropdown-panel">
                  {konditionAvailableExercises.map((name) => (
                    <label className="dropdown-item" key={name}>
                      <input
                        type="checkbox"
                        checked={!konditionExcludedExercises.includes(name)}
                        onChange={() => toggle(konditionExcludedExercises, setKonditionExcludedExercises, name)}
                      />
                      {name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button className="generate-btn" onClick={handleGenerateKondition}>
              Workout generieren
            </button>
          </div>

          <div className="board">
            {!konditionWorkout && (
              <div className="board-empty">
                <Dumbbell size={30} />
                <div>Stelle links deine Präferenzen ein<br />und generiere dein Kondition-Workout.</div>
              </div>
            )}
            {konditionWorkout && (
              <>
                <div className="board-format">{konditionWorkout.format}</div>
                <div className="board-headline">{konditionWorkout.headline}</div>
                <div>
                  {konditionWorkout.roundsData.map((rd, ri) => (
                    <div className="board-round-group" key={ri}>
                      <div className="board-round-label">{rd.roundLabel}</div>
                      {rd.items.map((l, i) => (
                        <div className="board-line" key={i}>
                          <span className="board-amount">{l.amount}</span>
                          <span className="board-name">{l.name}</span>
                          {l.load && <span className="board-load" data-kind={l.loadKind}>{l.load}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="board-notes">{konditionWorkout.notes}</div>
                <div className="board-actions">
                  <button onClick={handleGenerateKondition}><RotateCcw size={14} /> Neu generieren</button>
                  <button onClick={copyKonditionWorkout} data-failed={konditionCopyFailed}>
                    {konditionCopied ? <Check size={14} /> : konditionCopyFailed ? <X size={14} /> : <Copy size={14} />}{" "}
                    {konditionCopied ? "Kopiert" : konditionCopyFailed ? "Fehlgeschlagen — Dialog beachten" : "Kopieren"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "workout" && (
        <>
          <div className="layout">
            <div className="panel">
              <div className="field">
                <label className="field-label">Workout-Modus</label>
                <div className="seg">
                  <SegButton active={workoutMode === "benchmark"} onClick={() => setWorkoutMode("benchmark")}>Benchmark Workout</SegButton>
                  <SegButton active={workoutMode === "individuell"} onClick={() => setWorkoutMode("individuell")}>Individuelles Workout</SegButton>
                </div>
              </div>

              {workoutMode === "benchmark" && (
                <div className="field">
                  <label className="field-label">Benchmark ({eligibleBenchmarksList.length} verfügbar mit aktuellem Equipment/Level)</label>
                  {eligibleBenchmarksList.length === 0 ? (
                    <div className="benchmark-empty-hint">Kein Benchmark mit der aktuellen Equipment-/Level-Auswahl möglich. Equipment erweitern oder Level anpassen.</div>
                  ) : (
                    <div className="chip-row">
                      {eligibleBenchmarksList.map((b) => (
                        <Chip key={b.id} active={selectedBenchmarkId === b.id} onClick={() => setSelectedBenchmarkId(b.id)}>
                          {b.name}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {workoutMode === "individuell" && (
                <>
                  <div className="field">
                    <label className="field-label">Format</label>
                    <div className="chip-row">
                      {FORMAT_OPTIONS.map((opt) => (
                        <Chip key={opt.id} active={format === opt.id} onClick={() => setFormat(opt.id)}>
                          {opt.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {format === "amrap" && (
                    <div className="field">
                  <label className="field-label">Dauer (Min)</label>
                  <div className="num-row">
                    <input className="num-input" type="number" min={5} max={40} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                  </div>
                </div>
              )}
              {format === "strength_sets" && (
                <div className="field">
                  <label className="field-label">Sätze</label>
                  <div className="num-row">
                    <input className="num-input" type="number" min={2} max={10} value={sets} onChange={(e) => setSets(Number(e.target.value))} />
                  </div>
                </div>
              )}
              {format === "for_time" && (
                <>
                  <div className="field">
                    <label className="field-label">Anzahl Übungen</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={2} max={8} value={forTimeExercises} onChange={(e) => setForTimeExercises(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Runden</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={1} max={10} value={rounds} onChange={(e) => setRounds(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Time Cap (Min)</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={4} max={40} value={forTimeCap} onChange={(e) => setForTimeCap(Number(e.target.value))} />
                    </div>
                  </div>
                </>
              )}
              {format === "emom" && (
                <>
                  <div className="field">
                    <label className="field-label">Gesamtdauer (Min)</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={6} max={40} value={emomMinutes} onChange={(e) => setEmomMinutes(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Intervall pro Station</label>
                    <div className="chip-row">
                      {EMOM_INTERVALS.map((sec) => (
                        <Chip key={sec} active={emomInterval === sec} onClick={() => setEmomInterval(sec)}>
                          {sec}s
                        </Chip>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {format === "chipper" && (
                <>
                  <div className="field">
                    <label className="field-label">Umfang</label>
                    <div className="chip-row">
                      {["niedrig", "mittel", "hoch"].map((v) => (
                        <Chip key={v} active={chipperVolume === v} onClick={() => setChipperVolume(v)}>
                          {v}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Time Cap (Min)</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={8} max={60} value={chipperCap} onChange={(e) => setChipperCap(Number(e.target.value))} />
                    </div>
                  </div>
                </>
              )}
              {format === "ladder" && (
                <>
                  <div className="field">
                    <label className="field-label">Startreps / Steigerung</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={1} max={10} value={ladderStartReps} onChange={(e) => setLadderStartReps(Number(e.target.value))} />
                      <input className="num-input" type="number" min={1} max={5} value={ladderIncrement} onChange={(e) => setLadderIncrement(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Runden</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={2} max={12} value={ladderRungs} onChange={(e) => setLadderRungs(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Time Cap (Min)</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={5} max={40} value={ladderCap} onChange={(e) => setLadderCap(Number(e.target.value))} />
                    </div>
                  </div>
                </>
              )}
              {format === "descending" && (
                <>
                  <div className="field">
                    <label className="field-label">Rep-Schema</label>
                    <div className="chip-row">
                      {REP_SCHEMES.map((s) => (
                        <Chip key={s.id} active={repScheme === s.id} onClick={() => setRepScheme(s.id)}>
                          {s.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Anzahl Übungen</label>
                    <div className="seg">
                      <SegButton active={movementCount === 2} onClick={() => setMovementCount(2)}>2 (Couplet)</SegButton>
                      <SegButton active={movementCount === 3} onClick={() => setMovementCount(3)}>3 (Triplet)</SegButton>
                    </div>
                  </div>
                </>
              )}
              {format === "sprint" && (
                <div className="field">
                  <label className="field-label">Time Cap (Min)</label>
                  <div className="num-row">
                    <input className="num-input" type="number" min={2} max={30} value={sprintCap} onChange={(e) => setSprintCap(Number(e.target.value))} />
                  </div>
                </div>
              )}
              {format === "tabata" && (
                <div className="field">
                  <label className="field-label">Anzahl Übungen (Stationen)</label>
                  <div className="num-row">
                    <input className="num-input" type="number" min={1} max={6} value={tabataStations} onChange={(e) => setTabataStations(Number(e.target.value))} />
                  </div>
                </div>
              )}
              {format === "fgb" && (
                <div className="field">
                  <label className="field-label">Runden / Stationen</label>
                  <div className="num-row">
                    <input className="num-input" type="number" min={2} max={5} value={fgbRounds} onChange={(e) => setFgbRounds(Number(e.target.value))} />
                    <input className="num-input" type="number" min={3} max={6} value={fgbStations} onChange={(e) => setFgbStations(Number(e.target.value))} />
                  </div>
                </div>
              )}
              {format === "varying_rounds" && (
                <>
                  <div className="field">
                    <label className="field-label">Runden / Übungen pro Runde</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={2} max={6} value={varRounds} onChange={(e) => setVarRounds(Number(e.target.value))} />
                      <input className="num-input" type="number" min={2} max={4} value={varSlots} onChange={(e) => setVarSlots(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Time Cap (Min)</label>
                    <div className="num-row">
                      <input className="num-input" type="number" min={6} max={40} value={varCap} onChange={(e) => setVarCap(Number(e.target.value))} />
                    </div>
                  </div>
                </>
              )}
                </>
              )}

              <div className="field">
                <label className="field-label">Level</label>
                <div className="seg">
                  <SegButton active={level === "beginner"} onClick={() => setLevel("beginner")}>Einsteiger</SegButton>
                  <SegButton active={level === "intermediate"} onClick={() => setLevel("intermediate")}>Fortg.</SegButton>
                  <SegButton active={level === "advanced"} onClick={() => setLevel("advanced")}>Advanced</SegButton>

                </div>
              </div>

              <div className="field">
                <label className="field-label">Intensität</label>
                <div className="chip-row">
                  {INTENSITY_OPTIONS.map((opt) => (
                    <Chip key={opt.id} active={intensity === opt.id} onClick={() => setIntensity(opt.id)}>
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="field-label">Geschlecht (für Lastvorgaben)</label>
                <div className="seg">
                  <SegButton active={gender === "male"} onClick={() => setGender("male")}>Männlich</SegButton>
                  <SegButton active={gender === "female"} onClick={() => setGender("female")}>Weiblich</SegButton>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Equipment</label>
                <div className="chip-row">
                  {EQUIPMENT_OPTIONS.map((opt) => (
                    <Chip key={opt.id} active={equipment.includes(opt.id)} onClick={() => toggle(equipment, setEquipment, opt.id)}>
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="field-label">Ausschließen (Beschwerden)</label>
                <div className="chip-row">
                  {EXCLUDE_OPTIONS.map((opt) => (
                    <Chip key={opt.id} active={exclude.includes(opt.id)} onClick={() => toggle(exclude, setExclude, opt.id)}>
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="field-label">Einzelne Übungen ausschließen</label>
                <button
                  type="button"
                  className="dropdown-toggle"
                  onClick={() => setExerciseDropdownOpen(!exerciseDropdownOpen)}
                >
                  <span>
                    {excludedExerciseCount > 0
                      ? `${excludedExerciseCount} Übung${excludedExerciseCount > 1 ? "en" : ""} ausgeschlossen`
                      : "Alle verfügbaren Übungen aktiv"}
                  </span>
                  <span>{exerciseDropdownOpen ? "▲" : "▼"}</span>
                </button>
                {exerciseDropdownOpen && (
                  <div className="dropdown-panel">
                    {equipmentPool.length === 0 ? (
                      <div className="benchmark-empty-hint">Kein Equipment ausgewählt.</div>
                    ) : (
                      equipmentPool.map((ex) => (
                        <label className="dropdown-item" key={ex.id}>
                          <input
                            type="checkbox"
                            checked={!exclude.includes(ex.id)}
                            onChange={() => toggle(exclude, setExclude, ex.id)}
                          />
                          {ex.name}
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button
                className="generate-btn"
                disabled={!canGenerate || (workoutMode === "benchmark" && !eligibleBenchmarksList.some((b) => b.id === selectedBenchmarkId))}
                onClick={handleGenerate}
              >
                Workout generieren
              </button>
            </div>

            <div className="board">
              {!workout && !empty && (
                <div className="board-empty">
                  <Dumbbell size={30} />
                  <div>Stelle links deine Präferenzen ein<br />und generiere dein Workout.</div>
                </div>
              )}
              {empty && (
                <div className="board-empty">
                  <X size={30} />
                  <div>Kein Workout möglich — der Übungs-Pool ist mit<br />diesen Filtern leer. Equipment oder Ausschlüsse lockern.</div>
                </div>
              )}
              {workout && (
                <>
                  {workout.isBenchmark && <div className="board-benchmark-badge">★ Benchmark: {workout.benchmarkName}</div>}
                  <div className="board-format">{workout.format}</div>
                  <div className="board-headline">{workout.headline}</div>
                  {workout.roundsData ? (
                    <div>
                      {workout.roundsData.map((rd, ri) => (
                        <div className="board-round-group" key={ri}>
                          <div className="board-round-label">{rd.roundLabel}</div>
                          {rd.items.map((l, i) => (
                            <div className="board-line" key={i}>
                              <span className="board-amount">{l.amount}</span>
                              <span className="board-name">{l.name}</span>
                              {l.load && (
                                <span className="board-load" data-kind={l.loadKind}>
                                  {l.loadKind === "movement" ? `Einsteiger-Variante: ${l.load}` : l.load}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {workout.lines.map((l, i) => (
                        <div className="board-line" key={i}>
                          <span className="board-amount">{l.amount}</span>
                          <span className="board-name">{l.name}</span>
                          {l.load && (
                            <span className="board-load" data-kind={l.loadKind}>
                              {l.loadKind === "movement" ? `Einsteiger-Variante: ${l.load}` : l.load}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="board-notes">{workout.notes}</div>
                  <div className="board-actions">
                    <button onClick={handleGenerate}><RotateCcw size={14} /> Neu generieren</button>
                    <button onClick={saveWorkout}><Timer size={14} /> Speichern</button>
                    <button onClick={copyWorkout} data-failed={copyFailed}>
                      {copied ? <Check size={14} /> : copyFailed ? <X size={14} /> : <Copy size={14} />}{" "}
                      {copied ? "Kopiert" : copyFailed ? "Fehlgeschlagen — Dialog beachten" : "Kopieren"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {saved.length > 0 && (
            <div className="saved-section">
              <div className="saved-title">Gespeicherte Workouts (nur für diese Sitzung)</div>
              {saved.map((w, i) => (
                <div className="saved-item" key={w.savedAt}>
                  <div>
                    <span className="saved-item-format">{w.format}</span>
                    {w.lines.map((l) => `${l.amount} ${l.name}`).join(" · ")}
                  </div>
                  <button className="saved-remove" onClick={() => setSaved(saved.filter((_, idx) => idx !== i))}>
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


