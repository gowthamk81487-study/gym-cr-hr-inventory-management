'use client';

import React, { useState, useMemo } from 'react';
import {
  Apple,
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
  FileDown,
  Info,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  mockMeals,
  mockDietTemplates,
  mockAssignedDiets,
  MealItem,
  DietTemplate,
  AssignedDietPlan
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

export default function DietsPage() {
  const { showToast } = useToast();

  // Local State
  const [meals, setMeals] = useState<MealItem[]>(mockMeals);
  const [templates, setTemplates] = useState<DietTemplate[]>(mockDietTemplates);
  const [assignedList, setAssignedList] = useState<AssignedDietPlan[]>(mockAssignedDiets);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'templates' | 'assigned' | 'meals' | 'progress'>('dashboard');

  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Records
  const [selectedTemplate, setSelectedTemplate] = useState<DietTemplate | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<AssignedDietPlan | null>(null);
  const [progressClient, setProgressClient] = useState(mockClients[0]); // default to first client

  // Dialog overlays triggers
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [templateForm, setTemplateForm] = useState({
    name: '',
    goal: 'Lean muscle toning',
    caloriesTarget: '2000',
    proteinTarget: '140',
    carbsTarget: '180',
    fatTarget: '60',
    waterTargetLiters: '3',
    notes: ''
  });

  const [assignForm, setAssignForm] = useState({
    clientId: 'CL-001',
    clientName: 'Sarah Jenkins',
    coachName: 'Damien Vance',
    templateId: 'dtemp-1',
    reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // 1. Dashboard summary numbers
  const dashboardStats = useMemo(() => {
    const activePlans = assignedList.filter(d => d.status === 'active').length;
    const avgCompliance = Math.round(
      assignedList.reduce((acc, d) => acc + d.complianceRate, 0) / assignedList.length
    );
    const avgCalories = 2200;
    const avgProtein = 150;
    return { activePlans, avgCompliance, avgCalories, avgProtein };
  }, [assignedList]);

  // 2. Filtered Sub-catalogs
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGoal = filterCategory === 'all' || t.goal === filterCategory;
      return matchSearch && matchGoal;
    });
  }, [templates, searchQuery, filterCategory]);

  const filteredAssigned = useMemo(() => {
    return assignedList.filter(d => {
      const matchSearch =
        d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.clientId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || d.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [assignedList, searchQuery, filterStatus]);

  const filteredMeals = useMemo(() => {
    return meals.filter(m => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === 'all' || m.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [meals, searchQuery, filterCategory]);

  // Paginated slices
  const paginatedAssigned = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAssigned.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAssigned, currentPage]);

  const totalPagesAssigned = Math.ceil(filteredAssigned.length / itemsPerPage);

  const paginatedMeals = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredMeals.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredMeals, currentPage]);

  const totalPagesMeals = Math.ceil(filteredMeals.length / itemsPerPage);

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

      const newTemp: DietTemplate = {
        id: `dtemp-${Date.now()}`,
        name: templateForm.name,
        goal: templateForm.goal,
        caloriesTarget: parseFloat(templateForm.caloriesTarget),
        proteinTarget: parseFloat(templateForm.proteinTarget),
        carbsTarget: parseFloat(templateForm.carbsTarget),
        fatTarget: parseFloat(templateForm.fatTarget),
        waterTargetLiters: parseFloat(templateForm.waterTargetLiters),
        isFavorite: false,
        status: 'active'
      };

      setTemplates([newTemp, ...templates]);
      setTemplateForm({
        name: '',
        goal: 'Lean muscle toning',
        caloriesTarget: '2000',
        proteinTarget: '140',
        carbsTarget: '180',
        fatTarget: '60',
        waterTargetLiters: '3',
        notes: ''
      });
      showToast('Diet template created!', 'success');
    }, 1200);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAssigning(false);

      const targetTemplate = templates.find(t => t.id === assignForm.templateId);

      const newAssign: AssignedDietPlan = {
        id: `asg-d-${Date.now()}`,
        clientId: assignForm.clientId,
        clientName: assignForm.clientName,
        coachName: assignForm.coachName,
        templateName: targetTemplate?.name || 'Custom Diet Plan',
        caloriesTarget: targetTemplate?.caloriesTarget || 2000,
        proteinTarget: targetTemplate?.proteinTarget || 140,
        complianceRate: 100,
        status: 'active',
        reviewDate: assignForm.reviewDate
      };

      setAssignedList([newAssign, ...assignedList]);
      showToast('Diet plan assigned to client profile.', 'success');
    }, 1200);
  };

  const duplicateTemplate = (temp: DietTemplate) => {
    const copy: DietTemplate = {
      ...temp,
      id: `dtemp-copy-${Date.now()}`,
      name: `${temp.name} (Copy)`
    };
    setTemplates([copy, ...templates]);
    showToast('Template duplicated successfully.', 'success');
  };

  const triggerExport = () => {
    showToast('Exporting dietary schedules (PDF format)...', 'info');
    setTimeout(() => {
      showToast('PDF download compiled.', 'success');
    }, 1200);
  };

  return (
    <PageLayout
      title="Diet & Progress Management"
      description="Create nutritional plans, map daily macro envelopes, and audit client weight timelines."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={triggerExport} className="text-xs py-1.5 px-3! border-slate-800 text-slate-400 hover:text-white">
            <FileDown className="h-4 w-4" /> Export Diets
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
            { id: 'dashboard', label: 'Diet Dashboard', icon: Layers },
            { id: 'templates', label: 'Diet Templates', icon: Apple },
            { id: 'assigned', label: 'Assigned Diets', icon: Users },
            { id: 'meals', label: 'Meal & Recipe Library', icon: Activity },
            { id: 'progress', label: 'Client Progress Trackers', icon: TrendingUp }
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
              <StatCard title="Active Diet Plans" value={dashboardStats.activePlans} icon={Apple} change="Prescribed macro targets" />
              <StatCard title="Meal Compliance" value={`${dashboardStats.avgCompliance}%`} icon={CheckCircle} change="Log compliance rate" changeType="increase" />
              <StatCard title="Average Calories" value={`${dashboardStats.avgCalories} kcal`} icon={Activity} change="Daily limit envelope" />
              <StatCard title="Average Protein" value={`${dashboardStats.avgProtein}g`} icon={Layers} change="Daily protein target" />
            </div>

            {/* AI Recommendations stubs banner */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-3 items-start">
                <Sparkles className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Gemini Meal Recommendations Engine</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
                    AI maps client allergies (e.g. Peanuts, Dairy) to suggest alternative recipes in the Meal Library automatically.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast('Smart recommendations optimized.', 'info')}
                className="text-[10px] py-1 border-slate-800 text-blue-400 hover:text-blue-300 font-bold shrink-0 cursor-pointer"
              >
                Sync Meal Engine
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Diet Templates */}
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
                    { value: 'Lean muscle toning', label: 'Lean muscle toning' },
                    { value: 'Low Carb Keto', label: 'Low Carb Keto' },
                    { value: 'Macronutrient bulking', label: 'Macronutrient bulking' }
                  ]}
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
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
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-slate-950 pt-3 text-[10px] text-slate-400 font-bold text-center">
                      <div className="bg-slate-950/40 p-1.5 rounded border border-slate-900">
                        <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Calories</span>
                        <span>{temp.caloriesTarget} kcal</span>
                      </div>
                      <div className="bg-slate-950/40 p-1.5 rounded border border-slate-900">
                        <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Protein</span>
                        <span>{temp.proteinTarget}g</span>
                      </div>
                      <div className="bg-slate-950/40 p-1.5 rounded border border-slate-900">
                        <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Water</span>
                        <span>{temp.waterTargetLiters} L</span>
                      </div>
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
                          setAssignForm(prev => ({ ...prev, templateId: temp.id }));
                          setIsAssigning(true);
                        }}
                        className="flex-1 text-[10px] py-1"
                      >
                        Assign Diet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Assigned Diets list */}
        {activeTab === 'assigned' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search assigned diets by client or ID..."
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
                    <th className="p-3">Coach Advisor</th>
                    <th className="p-3">Prescribed Diet</th>
                    <th className="p-3">Calorie Target</th>
                    <th className="p-3">Compliance Rate</th>
                    <th className="p-3">Next Review</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedAssigned.map(sub => (
                    <tr key={sub.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">{sub.clientName}</td>
                      <td className="p-3">{sub.coachName}</td>
                      <td className="p-3 text-emerald-400">{sub.templateName}</td>
                      <td className="p-3 font-mono text-[10.5px]">{sub.caloriesTarget} kcal / {sub.proteinTarget}g Protein</td>
                      <td className="p-3 w-48">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                            <span>Logged Compliance</span>
                            <span>{sub.complianceRate}%</span>
                          </div>
                          <ProgressBar value={sub.complianceRate} variant={sub.complianceRate >= 80 ? 'success' : 'primary'} size="xs" />
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
                                showToast('Dietary review log completed.', 'success');
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
                        No assigned client diet plans match filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPagesAssigned} onPageChange={setCurrentPage} totalRecords={filteredAssigned.length} itemsPerPage={itemsPerPage} />
          </div>
        )}

        {/* Tab 4: Meal Library */}
        {activeTab === 'meals' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search meal or ingredient..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
              />
            </div>

            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Meal Name</th>
                    <th className="p-3">Meal Category</th>
                    <th className="p-3 text-center">Macros (C/P/F)</th>
                    <th className="p-3">Prep Time</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3 text-right">Energy (kcal)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedMeals.map((meal, idx) => (
                    <tr key={idx} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">{meal.name}</td>
                      <td className="p-3 text-slate-500">{meal.category}</td>
                      <td className="p-3 text-center font-mono">{meal.carbsGrams}g / {meal.proteinGrams}g / {meal.fatGrams}g</td>
                      <td className="p-3">{meal.prepTimeMins} mins</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {meal.isVegetarian && <Badge variant="emerald">Vegetarian</Badge>}
                          {meal.isVegan && <Badge variant="blue">Vegan</Badge>}
                          {!meal.isVegetarian && <Badge variant="slate">Non-Veg</Badge>}
                        </div>
                      </td>
                      <td className="p-3 text-right text-emerald-400 font-mono">~{meal.calories} kcal</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPagesMeals} onPageChange={setCurrentPage} totalRecords={filteredMeals.length} itemsPerPage={itemsPerPage} />
          </div>
        )}

        {/* Tab 5: Client Progress & Weight Timelines */}
        {activeTab === 'progress' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
            
            {/* Weight/Biometrics timeline log */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-900">
                <CardHeader
                  title={`Biometric weight logs: ${progressClient.name}`}
                  description="Weekly body composition metrics checks"
                  action={
                    <div className="w-44 shrink-0">
                      <Select
                        options={mockClients.slice(0, 10).map(c => ({ value: c.id, label: c.name }))}
                        value={progressClient.id}
                        onChange={e => {
                          const selected = mockClients.find(cl => cl.id === e.target.value);
                          if (selected) setProgressClient(selected);
                        }}
                        className="text-[10px]"
                      />
                    </div>
                  }
                />
                
                <CardContent>
                  <div className="divide-y divide-slate-900/60 font-semibold text-xs">
                    <div className="flex justify-between items-center py-2.5 text-[10px] text-slate-500 uppercase tracking-wider">
                      <span>Date Checked</span>
                      <span>Weight Checked</span>
                      <span>BMI Value</span>
                      <span className="text-right">Shift Progress</span>
                    </div>

                    {/* Weight Timeline stubs */}
                    <div className="flex justify-between items-center py-3">
                      <span className="text-slate-500 font-mono">2026-07-15</span>
                      <span className="text-slate-200">{progressClient.weightKg} kg</span>
                      <span className="text-slate-400 font-mono">{progressClient.bmi}</span>
                      <span className="text-emerald-400 text-right flex items-center gap-0.5">
                        <TrendingUp className="h-3.5 w-3.5" /> Checked (Normal)
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 text-slate-400 opacity-60">
                      <span className="text-slate-500 font-mono">2026-07-01</span>
                      <span>{progressClient.weightKg + 2} kg</span>
                      <span className="font-mono">{(progressClient.bmi + 0.6).toFixed(1)}</span>
                      <span className="text-slate-500 text-right">-2.0 kg loss</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements and progress milestones list */}
            <div className="space-y-6">
              <Card className="border-slate-900">
                <CardHeader title="CRM Progress Milestones" description="Completed goals and achievements checklist" />
                <CardContent className="space-y-4 text-xs font-semibold">
                  <div className="flex gap-3 bg-slate-950/60 p-2.5 border border-slate-900 rounded-lg">
                    <Award className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-slate-300">Initial Checkin Completed</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">Checked in during onboarding with active metrics.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-slate-950/60 p-2.5 border border-slate-900 rounded-lg opacity-40">
                    <Award className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-slate-400">Target Weight Milestone</h5>
                      <p className="text-[10px] text-slate-600 mt-0.5">Achieve fat loss goal of -5 kg.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </div>

      {/* DIALOG FORMS */}

      {/* 1. Create Diet Template Modal */}
      <Dialog isOpen={isAddingTemplate} onClose={() => setIsAddingTemplate(false)} title="Create Diet Template">
        <form onSubmit={handleAddTemplateSubmit} className="space-y-4 pt-2">
          <Input
            label="Template Name"
            required
            value={templateForm.name}
            onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
            placeholder="High Protein Lean Bulk"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Primary Goal"
              options={[
                { value: 'Lean muscle toning', label: 'Lean Muscle Toning' },
                { value: 'Low Carb Keto', label: 'Low Carb Keto Plan' },
                { value: 'Macronutrient bulking', label: 'Macronutrient Bulking' }
              ]}
              value={templateForm.goal}
              onChange={e => setTemplateForm({ ...templateForm, goal: e.target.value })}
            />
            <Input
              label="Target Calories (kcal)"
              type="number"
              value={templateForm.caloriesTarget}
              onChange={e => setTemplateForm({ ...templateForm, caloriesTarget: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Input label="Protein (g)" type="number" value={templateForm.proteinTarget} onChange={e => setTemplateForm({ ...templateForm, proteinTarget: e.target.value })} />
            <Input label="Carbs (g)" type="number" value={templateForm.carbsTarget} onChange={e => setTemplateForm({ ...templateForm, carbsTarget: e.target.value })} />
            <Input label="Fat (g)" type="number" value={templateForm.fatTarget} onChange={e => setTemplateForm({ ...templateForm, fatTarget: e.target.value })} />
            <Input label="Water (Liters)" type="number" value={templateForm.waterTargetLiters} onChange={e => setTemplateForm({ ...templateForm, waterTargetLiters: e.target.value })} />
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

      {/* 2. Assign Diet Template Modal */}
      <Dialog isOpen={isAssigning} onClose={() => setIsAssigning(false)} title="Assign Diet Program">
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
            label="Assigning Nutritionist Coach"
            required
            options={[
              { value: 'Damien Vance', label: 'Coach Damien Vance' },
              { value: 'Elena Rostova', label: 'Coach Elena Rostova' },
              { value: 'Marcus Sterling', label: 'Coach Marcus Sterling' }
            ]}
            value={assignForm.coachName}
            onChange={e => setAssignForm({ ...assignForm, coachName: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Select Template"
              required
              options={templates.map(t => ({ value: t.id, label: `${t.name} (${t.caloriesTarget} kcal)` }))}
              value={assignForm.templateId}
              onChange={e => setAssignForm({ ...assignForm, templateId: e.target.value })}
            />
            <Input
              label="Review Date"
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
