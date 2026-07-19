'use client';

import React, { useState, useMemo } from 'react';
import {
  Dumbbell,
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Activity,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  Copy,
  CheckCircle,
  AlertTriangle,
  Play,
  FileDown,
  Info,
  ChevronRight
} from 'lucide-react';
import {
  mockExercises,
  mockWorkoutTemplates,
  mockAssignedWorkouts,
  ExerciseItem,
  WorkoutTemplate,
  AssignedWorkoutPlan
} from '@/mock/fitness';
import { mockClients } from '@/mock/clients';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import { StatCard } from '@/components/common/StatCard';
import PageLayout from '@/layouts/PageLayout';
import ProgressBar from '@/components/ui/ProgressBar';
import Dropdown from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';

export default function WorkoutsPage() {
  const { showToast } = useToast();

  // Local State
  const [exercises, setExercises] = useState<ExerciseItem[]>(mockExercises);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(mockWorkoutTemplates);
  const [assignedList, setAssignedList] = useState<AssignedWorkoutPlan[]>(mockAssignedWorkouts);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'templates' | 'assigned' | 'exercises'>('dashboard');

  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGoal, setFilterGoal] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dialog overlays triggers
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<AssignedWorkoutPlan | null>(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [templateForm, setTemplateForm] = useState({
    name: '',
    goal: 'Hypertrophy strength',
    difficulty: 'beginner' as const,
    weeksCount: '8',
    trainingDaysPerWeek: '4',
    notes: ''
  });

  const [assignForm, setAssignForm] = useState({
    clientId: 'CL-001',
    clientName: 'Sarah Jenkins',
    coachName: 'Elena Rostova',
    templateId: 'wtemp-1',
    weeksCount: '8',
    reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // 1. Dashboard summary numbers
  const dashboardStats = useMemo(() => {
    const activePlans = assignedList.filter(w => w.status === 'active').length;
    const completedSessions = assignedList.filter(w => w.status === 'completed').length;
    const completionRate = Math.round(
      assignedList.reduce((acc, w) => acc + w.completionRate, 0) / assignedList.length
    );
    const pendingReviews = assignedList.length % 7; // Mock reviews queue
    return { activePlans, completedSessions, completionRate, pendingReviews };
  }, [assignedList]);

  // 2. Filtered Sub-catalogs
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGoal = filterGoal === 'all' || t.goal === filterGoal;
      const matchDiff = filterDifficulty === 'all' || t.difficulty === filterDifficulty;
      return matchSearch && matchGoal && matchDiff;
    });
  }, [templates, searchQuery, filterGoal, filterDifficulty]);

  const filteredAssigned = useMemo(() => {
    return assignedList.filter(w => {
      const matchSearch =
        w.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.clientId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterDifficulty === 'all' || w.status === filterDifficulty;
      return matchSearch && matchStatus;
    });
  }, [assignedList, searchQuery, filterDifficulty]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDiff = filterDifficulty === 'all' || ex.difficulty === filterDifficulty;
      return matchSearch && matchDiff;
    });
  }, [exercises, searchQuery, filterDifficulty]);

  // Paginated slices
  const paginatedAssigned = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAssigned.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAssigned, currentPage]);

  const totalPagesAssigned = Math.ceil(filteredAssigned.length / itemsPerPage);

  const paginatedExercises = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredExercises.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredExercises, currentPage]);

  const totalPagesExercises = Math.ceil(filteredExercises.length / itemsPerPage);

  // Form Submissions
  const handleAddTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAddingTemplate(false);

      const newTemp: WorkoutTemplate = {
        id: `wtemp-${Date.now()}`,
        name: templateForm.name,
        goal: templateForm.goal,
        difficulty: templateForm.difficulty,
        weeksCount: parseInt(templateForm.weeksCount, 10),
        trainingDaysPerWeek: parseInt(templateForm.trainingDaysPerWeek, 10),
        exercisesList: [
          { name: 'Barbell Back Squat', sets: 4, reps: '8-10', restSecs: 90 },
          { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', restSecs: 60 }
        ],
        isFavorite: false,
        status: 'active'
      };

      setTemplates([newTemp, ...templates]);
      setTemplateForm({
        name: '',
        goal: 'Hypertrophy strength',
        difficulty: 'beginner',
        weeksCount: '8',
        trainingDaysPerWeek: '4',
        notes: ''
      });
      showToast('Workout template created!', 'success');
    }, 1200);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAssigning(false);

      const targetTemplate = templates.find(t => t.id === assignForm.templateId);

      const newAssign: AssignedWorkoutPlan = {
        id: `asg-w-${Date.now()}`,
        clientId: assignForm.clientId,
        clientName: assignForm.clientName,
        coachName: assignForm.coachName,
        templateName: targetTemplate?.name || 'Custom Routine',
        weeksCount: parseInt(assignForm.weeksCount, 10),
        completionRate: 0,
        status: 'active',
        reviewDate: assignForm.reviewDate
      };

      setAssignedList([newAssign, ...assignedList]);
      showToast('Workout plan assigned to client profile.', 'success');
    }, 1200);
  };

  const duplicateTemplate = (temp: WorkoutTemplate) => {
    const copy: WorkoutTemplate = {
      ...temp,
      id: `wtemp-copy-${Date.now()}`,
      name: `${temp.name} (Copy)`
    };
    setTemplates([copy, ...templates]);
    showToast('Template duplicated successfully.', 'success');
  };

  const toggleFavorite = (id: string) => {
    const updated = templates.map(t => {
      if (t.id === id) {
        return { ...t, isFavorite: !t.isFavorite };
      }
      return t;
    });
    setTemplates(updated);
    showToast('Favorites updated.', 'info');
  };

  const triggerExport = () => {
    showToast('Exporting routines to PDF format...', 'info');
    setTimeout(() => {
      showToast('PDF compilation downloaded.', 'success');
    }, 1200);
  };

  return (
    <PageLayout
      title="Workout Routine Management"
      description="Create training templates, query exercise catalogs, and assign routines to client files."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={triggerExport} className="text-xs py-1.5 px-3! border-slate-800 text-slate-400 hover:text-white">
            <FileDown className="h-4 w-4" /> Export Routines
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddingTemplate(true)}
            className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" /> Create Template
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Tab Navigation buttons */}
        <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
          {[
            { id: 'dashboard', label: 'Workout Dashboard', icon: Layers },
            { id: 'templates', label: 'Workout Templates', icon: Dumbbell },
            { id: 'assigned', label: 'Assigned Workouts', icon: Users },
            { id: 'exercises', label: 'Exercise Library', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-slate-100'
                    : 'border-transparent hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Active Workouts" value={dashboardStats.activePlans} icon={Dumbbell} change="Prescribed rosters" />
              <StatCard title="Sessions Completed" value={dashboardStats.completedSessions} icon={CheckCircle} change="Total sessions log" />
              <StatCard title="Completion Ratio" value={`${dashboardStats.completionRate}%`} icon={Activity} change="Average compliance" changeType="increase" />
              <StatCard title="Pending Reviews" value={dashboardStats.pendingReviews} icon={Clock} change="Scheduled this week" />
            </div>


            {/* Recent updates feed */}
            <Card className="border-slate-900">
              <CardHeader title="Recent Prescriptions Handover Feed" description="Logs of workout plan re-evaluations and assignments" />
              <CardContent>
                <div className="space-y-4 text-xs font-semibold text-slate-400">
                  <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
                    <p className="text-slate-300">Coach Marcus Sterling assigned <strong className="text-blue-400">5x5 Powerlifting Starter</strong> to David Vance.</p>
                    <span className="text-[10px] text-slate-500">12 mins ago</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <p className="text-slate-300">Client Sarah Jenkins hit a milestone: Completed 12 consecutive training sessions.</p>
                    <span className="text-[10px] text-slate-500">4 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Workout Templates */}
        {activeTab === 'templates' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/10 border border-slate-900 rounded-xl p-4">
              <div className="relative w-full md:max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
                />
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Select
                  options={[
                    { value: 'all', label: 'All Goals' },
                    { value: 'Hypertrophy strength', label: 'Hypertrophy Strength' },
                    { value: 'Metabolic conditioning', label: 'Endurance Cardio' },
                    { value: 'Fat loss cutting', label: 'Fat Loss' }
                  ]}
                  value={filterGoal}
                  onChange={e => setFilterGoal(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredTemplates.slice(0, 9).map(temp => (
                <Card key={temp.id} className="border-slate-900 flex flex-col justify-between group">
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{temp.name}</h4>
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 block mt-1">
                          {temp.goal}
                        </span>
                      </div>
                      <Badge variant={temp.difficulty === 'advanced' ? 'danger' : temp.difficulty === 'intermediate' ? 'warning' : 'success'}>
                        {temp.difficulty}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-950 pt-3 text-[10px] text-slate-500 font-semibold">
                      <p>Duration: {temp.weeksCount} Weeks</p>
                      <p>Frequency: {temp.trainingDaysPerWeek} Days/wk</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-950">
                      <Button variant="outline" size="sm" onClick={() => duplicateTemplate(temp)} className="flex-1 text-[10px] py-1 border-slate-800">
                        <Copy className="h-3 w-3" /> Duplicate
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setAssignForm(prev => ({ ...prev, templateId: temp.id, weeksCount: String(temp.weeksCount) }));
                          setIsAssigning(true);
                        }}
                        className="flex-1 text-[10px] py-1"
                      >
                        Assign Routine
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Assigned Workouts list */}
        {activeTab === 'assigned' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search assigned files by client or ID..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
              />
            </div>

            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Client</th>
                    <th className="p-3">Coach</th>
                    <th className="p-3">Routine Plan</th>
                    <th className="p-3">Target Term</th>
                    <th className="p-3">Workout Completion</th>
                    <th className="p-3">Next Review</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedAssigned.map(sub => (
                    <tr key={sub.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">{sub.clientName}</td>
                      <td className="p-3">{sub.coachName}</td>
                      <td className="p-3 text-blue-400">{sub.templateName}</td>
                      <td className="p-3">{sub.weeksCount} Weeks</td>
                      <td className="p-3 w-48">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                            <span>Compliance</span>
                            <span>{sub.completionRate}%</span>
                          </div>
                          <ProgressBar value={sub.completionRate} variant={sub.completionRate >= 80 ? 'success' : 'primary'} size="xs" />
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{sub.reviewDate}</td>
                      <td className="p-3 text-right">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm" className="p-1 rounded-lg">
                              <MoreVertical className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                            </Button>
                          }
                          items={[
                            {
                              label: 'Trigger Review',
                              icon: Clock,
                              onClick: () => {
                                showToast('Analytical review log created.', 'success');
                              }
                            },
                            {
                              label: 'Pause Routine',
                              icon: AlertTriangle,
                              onClick: () => {
                                showToast('Routine state set to paused.', 'info');
                              }
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredAssigned.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 text-xs font-semibold">
                        No assigned client routines match filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPagesAssigned} onPageChange={setCurrentPage} totalRecords={filteredAssigned.length} itemsPerPage={itemsPerPage} />
          </div>
        )}

        {/* Tab 4: Exercise Library */}
        {activeTab === 'exercises' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search exercise by muscle or equipment..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
              />
            </div>

            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Exercise Name</th>
                    <th className="p-3">Target Muscle</th>
                    <th className="p-3">Required Equipment</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3 text-right">Energy Burn (10m)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedExercises.map((ex, idx) => (
                    <tr key={idx} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">{ex.name}</td>
                      <td className="p-3">{ex.muscleGroup}</td>
                      <td className="p-3 text-slate-500">{ex.equipment}</td>
                      <td className="p-3">
                        <Badge variant={ex.difficulty === 'advanced' ? 'danger' : ex.difficulty === 'intermediate' ? 'warning' : 'success'}>
                          {ex.difficulty}
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-emerald-400 font-mono">~{ex.caloriesBurnEstimate} kcal</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPagesExercises} onPageChange={setCurrentPage} totalRecords={filteredExercises.length} itemsPerPage={itemsPerPage} />
          </div>
        )}
      </div>

      {/* OVERLAY DIALOG MODALS */}

      {/* A. Create Workout Template Modal */}
      <Dialog isOpen={isAddingTemplate} onClose={() => setIsAddingTemplate(false)} title="Create Workout Template">
        <form onSubmit={handleAddTemplateSubmit} className="space-y-4 pt-2">
          <Input
            label="Template Name"
            required
            value={templateForm.name}
            onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
            placeholder="Push-Pull-Legs Power split"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Primary Goal"
              options={[
                { value: 'Hypertrophy strength', label: 'Hypertrophy Strength' },
                { value: 'Metabolic conditioning', label: 'Endurance Conditioning' },
                { value: 'Fat loss cutting', label: 'Fat Loss Cutting' }
              ]}
              value={templateForm.goal}
              onChange={e => setTemplateForm({ ...templateForm, goal: e.target.value })}
            />
            <Select
              label="Difficulty Level"
              options={[
                { value: 'beginner', label: 'Beginner safe' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced athlete' }
              ]}
              value={templateForm.difficulty}
              onChange={e => setTemplateForm({ ...templateForm, difficulty: e.target.value as any })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Program Duration (Weeks)"
              type="number"
              value={templateForm.weeksCount}
              onChange={e => setTemplateForm({ ...templateForm, weeksCount: e.target.value })}
            />
            <Input
              label="Frequency (Days/Week)"
              type="number"
              value={templateForm.trainingDaysPerWeek}
              onChange={e => setTemplateForm({ ...templateForm, trainingDaysPerWeek: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAddingTemplate(false)} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Create Template
            </Button>
          </div>
        </form>
      </Dialog>

      {/* B. Assign Workout Template Modal */}
      <Dialog isOpen={isAssigning} onClose={() => setIsAssigning(false)} title="Assign Workout Routine">
        <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2">
          
          <Select
            label="Target Member Client"
            required
            options={mockClients.map(c => ({ value: c.id, label: `${c.name} (${c.id})` }))}
            value={assignForm.clientId}
            onChange={e => {
              const selected = mockClients.find(cl => cl.id === e.target.value);
              setAssignForm({
                ...assignForm,
                clientId: e.target.value,
                clientName: selected?.name || 'Sarah Jenkins'
              });
            }}
          />

          <Select
            label="Assigning Coach Advisor"
            required
            options={[
              { value: 'Elena Rostova', label: 'Coach Elena Rostova' },
              { value: 'Marcus Sterling', label: 'Coach Marcus Sterling' },
              { value: 'Damien Vance', label: 'Coach Damien Vance' }
            ]}
            value={assignForm.coachName}
            onChange={e => setAssignForm({ ...assignForm, coachName: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Effective Weeks"
              type="number"
              value={assignForm.weeksCount}
              onChange={e => setAssignForm({ ...assignForm, weeksCount: e.target.value })}
            />
            <Input
              label="Handover Review Date"
              type="date"
              required
              value={assignForm.reviewDate}
              onChange={e => setAssignForm({ ...assignForm, reviewDate: e.target.value })}
              className="scheme-dark"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAssigning(false)} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Dialog>

    </PageLayout>
  );
}
