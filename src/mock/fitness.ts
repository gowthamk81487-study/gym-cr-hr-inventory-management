export interface ExerciseItem {
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  commonMistakes: string;
  alternativeExercises: string[];
  caloriesBurnEstimate: number; // per 10 mins
}

export interface MealItem {
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'supplement';
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  prepTimeMins: number;
  ingredients: string[];
  isVegetarian: boolean;
  isVegan: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  weeksCount: number;
  trainingDaysPerWeek: number;
  exercisesList: { name: string; sets: number; reps: string; restSecs: number }[];
  isFavorite: boolean;
  status: 'active' | 'archived';
}

export interface DietTemplate {
  id: string;
  name: string;
  goal: string;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  waterTargetLiters: number;
  isFavorite: boolean;
  status: 'active' | 'archived';
}

export interface AssignedWorkoutPlan {
  id: string;
  clientId: string;
  clientName: string;
  coachName: string;
  templateName: string;
  weeksCount: number;
  completionRate: number; // percentage
  status: 'active' | 'completed' | 'paused';
  reviewDate: string;
}

export interface AssignedDietPlan {
  id: string;
  clientId: string;
  clientName: string;
  coachName: string;
  templateName: string;
  caloriesTarget: number;
  proteinTarget: number;
  complianceRate: number; // percentage
  status: 'active' | 'completed' | 'paused';
  reviewDate: string;
}

// 1. Generate 200 Exercises
const detailedExercises: ExerciseItem[] = [
  {
    name: 'Barbell Back Squat',
    muscleGroup: 'Quads / Glutes',
    equipment: 'Barbell & Rack',
    difficulty: 'intermediate',
    instructions: 'Rest barbell on traps, push hips back, descend below parallel, and drive up through midfoot.',
    commonMistakes: 'Knees caving in (valgus collapse), round lower back, rising on toes.',
    alternativeExercises: ['Leg Press', 'Goblet Squat', 'Bulgarian Split Squat'],
    caloriesBurnEstimate: 85
  },
  {
    name: 'Dumbbell Bench Press',
    muscleGroup: 'Chest / Triceps',
    equipment: 'Dumbbells & Flat Bench',
    difficulty: 'beginner',
    instructions: 'Lie flat, retract shoulder blades, press dumbbells up in a slight arc, and lower under control.',
    commonMistakes: 'Flaring elbows at 90 degrees, bouncing weights, unlocking shoulder blades.',
    alternativeExercises: ['Barbell Bench Press', 'Pushups', 'Chest Press Machine'],
    caloriesBurnEstimate: 60
  },
  {
    name: 'Conventional Deadlift',
    muscleGroup: 'Hamstrings / Lower Back',
    equipment: 'Barbell & Plates',
    difficulty: 'advanced',
    instructions: 'Hinge at hips, pull slack out of barbell, brace core, and push floor away to stand upright.',
    commonMistakes: 'Rounding spine, barbell drifting away from shins, hyperextending back at lockout.',
    alternativeExercises: ['Sumo Deadlift', 'Romanian Deadlift', 'Trap Bar Deadlift'],
    caloriesBurnEstimate: 110
  }
];

function generateExercises(): ExerciseItem[] {
  const list = [...detailedExercises];
  const muscles = ['Quads', 'Glutes', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Hamstrings', 'Abs', 'Calves'];
  const equip = ['Barbell', 'Dumbbells', 'Cables', 'Machine', 'Kettlebell', 'Bodyweight', 'Resistance Bands'];
  const difficulties: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];

  for (let i = 4; i <= 200; i++) {
    const muscle = muscles[i % muscles.length];
    const eq = equip[i % equip.length];
    const diff = difficulties[i % difficulties.length];
    
    list.push({
      name: `${eq} ${muscle} Press v${i}`,
      muscleGroup: muscle,
      equipment: eq,
      difficulty: diff,
      instructions: 'Brace core, maintain control through concentric and eccentric phases.',
      commonMistakes: 'Rushing reps, using momentum, poor breathing synchronization.',
      alternativeExercises: [`${eq} Isolation Core`, 'Machine Alternative'],
      caloriesBurnEstimate: 50 + (i % 60)
    });
  }
  return list;
}

export const mockExercises = generateExercises();

// 2. Generate 100 Meals
const detailedMeals: MealItem[] = [
  {
    name: 'Oats & Whey Porridge',
    category: 'breakfast',
    calories: 380,
    proteinGrams: 32,
    carbsGrams: 45,
    fatGrams: 6,
    prepTimeMins: 5,
    ingredients: ['Roll oats', 'Whey isolate protein', 'Almond milk', 'Blueberries'],
    isVegetarian: true,
    isVegan: false
  },
  {
    name: 'Grilled Chicken & Quinoa Salad',
    category: 'lunch',
    calories: 520,
    proteinGrams: 44,
    carbsGrams: 50,
    fatGrams: 10,
    prepTimeMins: 15,
    ingredients: ['Chicken breast', 'Quinoa', 'Mixed baby greens', 'Olive oil dressing'],
    isVegetarian: false,
    isVegan: false
  },
  {
    name: 'Tofu Sweet Potato Bake',
    category: 'dinner',
    calories: 450,
    proteinGrams: 24,
    carbsGrams: 60,
    fatGrams: 12,
    prepTimeMins: 25,
    ingredients: ['Organic firm tofu', 'Sweet potato', 'Broccoli floret', 'Sesame seed oil'],
    isVegetarian: true,
    isVegan: true
  }
];

function generateMeals(): MealItem[] {
  const list = [...detailedMeals];
  const cats: ('breakfast' | 'lunch' | 'dinner' | 'snack' | 'supplement')[] = ['breakfast', 'lunch', 'dinner', 'snack', 'supplement'];
  
  for (let i = 4; i <= 100; i++) {
    const cat = cats[i % cats.length];
    list.push({
      name: `${cat === 'supplement' ? 'Protein Shake' : 'Healthy Food Bow'} Option ${i}`,
      category: cat,
      calories: 200 + (i % 400),
      proteinGrams: 15 + (i % 30),
      carbsGrams: 20 + (i % 50),
      fatGrams: 2 + (i % 15),
      prepTimeMins: 5 + (i % 20),
      ingredients: ['Whole foods option', 'Salt & pepper spices'],
      isVegetarian: i % 2 === 0,
      isVegan: i % 3 === 0
    });
  }
  return list;
}

export const mockMeals = generateMeals();

// 3. Generate 50 Workout Templates
function generateWorkoutTemplates(): WorkoutTemplate[] {
  const list: WorkoutTemplate[] = [];
  const goals = ['Hypertrophy strength', 'Metabolic conditioning', 'Injury rehab', 'Fat loss cutting'];
  
  for (let i = 1; i <= 50; i++) {
    list.push({
      id: `wtemp-${i}`,
      name: i === 1 ? 'Push-Pull-Legs Split' : i === 2 ? '5x5 Powerlifting Starter' : `Athletic Conditioning Temp ${i}`,
      goal: goals[i % goals.length],
      difficulty: i % 3 === 0 ? 'advanced' : i % 2 === 0 ? 'intermediate' : 'beginner',
      weeksCount: i % 2 === 0 ? 8 : 12,
      trainingDaysPerWeek: i % 2 === 0 ? 4 : 3,
      exercisesList: [
        { name: 'Barbell Back Squat', sets: 4, reps: '8-10', restSecs: 90 },
        { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', restSecs: 60 }
      ],
      isFavorite: i <= 3,
      status: 'active'
    });
  }
  return list;
}

export const mockWorkoutTemplates = generateWorkoutTemplates();

// 4. Generate 40 Diet Templates
function generateDietTemplates(): DietTemplate[] {
  const list: DietTemplate[] = [];
  const goals = ['Macronutrient bulking', 'Low Carb Keto', 'Lean muscle toning', 'Clean eating maintenance'];
  
  for (let i = 1; i <= 40; i++) {
    list.push({
      id: `dtemp-${i}`,
      name: i === 1 ? 'Ketogenic Diet Plan' : i === 2 ? 'High Protein Body Recomp' : `Balanced Macros Template ${i}`,
      goal: goals[i % goals.length],
      caloriesTarget: 1800 + (i % 10) * 100,
      proteinTarget: 120 + (i % 5) * 15,
      carbsTarget: 100 + (i % 8) * 20,
      fatTarget: 50 + (i % 6) * 10,
      waterTargetLiters: 3 + (i % 2),
      isFavorite: i <= 3,
      status: 'active'
    });
  }
  return list;
}

export const mockDietTemplates = generateDietTemplates();

// 5. Generate 100 Assigned Workouts
function generateAssignedWorkouts(): AssignedWorkoutPlan[] {
  const list: AssignedWorkoutPlan[] = [];
  const clientNames = ['Sarah Jenkins', 'David Vance', 'Sophia Liang', 'Marcus Miller', 'Elena Jenkins'];
  const coaches = ['Marcus Sterling', 'Elena Rostova', 'Damien Vance'];
  const statuses: ('active' | 'completed' | 'paused')[] = ['active', 'completed', 'paused'];

  for (let i = 1; i <= 100; i++) {
    const cName = clientNames[i % clientNames.length];
    list.push({
      id: `asg-w-${i}`,
      clientId: `CL-${String(i).padStart(3, '0')}`,
      clientName: i <= 5 ? cName : `Member Name ${i}`,
      coachName: coaches[i % coaches.length],
      templateName: i % 2 === 0 ? 'Push-Pull-Legs Split' : '5x5 Powerlifting Starter',
      weeksCount: i % 2 === 0 ? 8 : 12,
      completionRate: 40 + (i % 55),
      status: statuses[i % statuses.length],
      reviewDate: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`
    });
  }
  return list;
}

export const mockAssignedWorkouts = generateAssignedWorkouts();

// 6. Generate 100 Assigned Diets
function generateAssignedDiets(): AssignedDietPlan[] {
  const list: AssignedDietPlan[] = [];
  const clientNames = ['Sarah Jenkins', 'David Vance', 'Sophia Liang', 'Marcus Miller', 'Elena Jenkins'];
  const coaches = ['Marcus Sterling', 'Elena Rostova', 'Damien Vance'];
  const statuses: ('active' | 'completed' | 'paused')[] = ['active', 'completed', 'paused'];

  for (let i = 1; i <= 100; i++) {
    const cName = clientNames[i % clientNames.length];
    list.push({
      id: `asg-d-${i}`,
      clientId: `CL-${String(i).padStart(3, '0')}`,
      clientName: i <= 5 ? cName : `Member Name ${i}`,
      coachName: coaches[i % coaches.length],
      templateName: i % 2 === 0 ? 'Ketogenic Diet Plan' : 'High Protein Body Recomp',
      caloriesTarget: 2000 + (i % 5) * 200,
      proteinTarget: 140 + (i % 4) * 15,
      complianceRate: 50 + (i % 48),
      status: statuses[i % statuses.length],
      reviewDate: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`
    });
  }
  return list;
}

export const mockAssignedDiets = generateAssignedDiets();
