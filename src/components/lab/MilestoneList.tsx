'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Milestone } from '@/types/lab'
import { LabButton } from '@/components/ui/LabButton'
import { Check, Plus, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { updateProjectProgress } from '@/lib/actions/project-actions'

interface MilestoneListProps {
  projectId: string
  milestones: Milestone[]
  onMilestonesChange: (milestones: Milestone[]) => void
  readOnly?: boolean
}

const DEFAULT_MILESTONES = [
  { name: 'Discovery & Planning', weight: 10 },
  { name: 'UI/UX Design', weight: 20 },
  { name: 'Frontend Development', weight: 25 },
  { name: 'Backend Development', weight: 20 },
  { name: 'Testing & QA', weight: 15 },
  { name: 'Deployment & Launch', weight: 10 },
]

export function MilestoneList({ projectId, milestones, onMilestonesChange, readOnly = false }: MilestoneListProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ name: '', weight: 10, due_date: '' })

  const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0)
  const completedWeight = milestones.filter(m => m.completed).reduce((sum, m) => sum + m.weight, 0)
  const progress = totalWeight > 0 ? completedWeight : 0

  const toggleMilestone = async (milestone: Milestone) => {
    if (readOnly) return
    
    setLoading(true)
    try {
      const newCompleted = !milestone.completed
      const { data, error } = await supabase
        .from('milestones')
        .update({ 
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        })
        .eq('id', milestone.id)
        .select()
        .single()

      if (!error && data) {
        const updated = milestones.map(m => 
          m.id === milestone.id ? { ...m, completed: newCompleted, completed_at: data.completed_at } : m
        )
        onMilestonesChange(updated)
        await updateProjectProgress(projectId)
      }
    } catch (err) {
      console.error('Error updating milestone:', err)
    } finally {
      setLoading(false)
    }
  }

  const addMilestone = async () => {
    if (!newMilestone.name.trim() || readOnly) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          project_id: projectId,
          name: newMilestone.name,
          weight: newMilestone.weight,
          due_date: newMilestone.due_date || null,
        })
        .select()
        .single()

      if (!error && data) {
        onMilestonesChange([...milestones, data as Milestone])
        await updateProjectProgress(projectId)
        setNewMilestone({ name: '', weight: 10, due_date: '' })
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Error adding milestone:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteMilestone = async (id: string) => {
    if (readOnly) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id)

      if (!error) {
        onMilestonesChange(milestones.filter(m => m.id !== id))
      }
    } catch (err) {
      console.error('Error deleting milestone:', err)
    } finally {
      setLoading(false)
    }
  }

  const addDefaultMilestone = (template: typeof DEFAULT_MILESTONES[0]) => {
    setNewMilestone({ name: template.name, weight: template.weight, due_date: '' })
    setShowAddForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50 font-sans">Progress (Weighted)</p>
          <p className="text-lg font-bold text-foreground font-sans">{progress}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50 font-sans">Completed</p>
          <p className="text-sm text-foreground font-mono">
            {completedWeight}% / {totalWeight}%
          </p>
        </div>
      </div>

      <div className="h-2 bg-white/10 rounded-none overflow-hidden">
        <div 
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2 mt-4">
        {milestones.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-4 font-sans">No milestones yet</p>
        ) : (
          milestones.map((milestone) => (
            <div 
              key={milestone.id}
              className={`flex items-center gap-3 p-3 rounded-none border transition-colors ${
                milestone.completed 
                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <button
                onClick={() => toggleMilestone(milestone)}
                disabled={readOnly || loading}
                className={`w-5 h-5 rounded-none border flex items-center justify-center transition-all ${
                  milestone.completed
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-white/30 hover:border-accent'
                }`}
              >
                {milestone.completed && <Check className="w-3 h-3 text-black" />}
              </button>
              
              <div className="flex-1">
                <p className={`text-sm font-sans ${
                  milestone.completed ? 'text-white/50 line-through' : 'text-foreground'
                }`}>
                  {milestone.name}
                </p>
                {milestone.due_date && (
                  <p className="text-xs text-white/40 font-mono">
                    {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-none ${
                  milestone.completed 
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-white/50'
                }`}>
                  {milestone.weight}%
                </span>
                
                {!readOnly && (
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="p-1 hover:bg-white/5 rounded-none text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!readOnly && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          {showAddForm ? (
            <div className="p-3 bg-white/5 border border-white/10 rounded-none space-y-2">
              <input
                type="text"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                placeholder="Milestone name"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-none text-foreground placeholder:text-white/30 focus:border-accent focus:outline-none font-sans text-sm"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-white/50 mb-1 font-sans">Weight %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newMilestone.weight}
                    onChange={(e) => setNewMilestone({ ...newMilestone, weight: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-none text-foreground focus:border-accent focus:outline-none font-mono text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-white/50 mb-1 font-sans">Due Date</label>
                  <input
                    type="date"
                    value={newMilestone.due_date}
                    onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-none text-foreground focus:border-accent focus:outline-none font-mono text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <LabButton type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="font-sans">
                  Cancel
                </LabButton>
                <LabButton size="sm" onClick={addMilestone} disabled={loading || !newMilestone.name.trim()} className="font-sans">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                </LabButton>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <LabButton type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(true)} className="font-sans">
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </LabButton>
              
              <div className="flex flex-wrap gap-1">
                {DEFAULT_MILESTONES.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => addDefaultMilestone(template)}
                    className="text-xs px-2 py-1 bg-white/5 border border-white/10 hover:border-accent rounded-none text-white/50 hover:text-accent transition-colors font-sans"
                  >
                    + {template.name} ({template.weight}%)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
