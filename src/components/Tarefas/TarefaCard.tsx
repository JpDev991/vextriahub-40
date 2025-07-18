import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, User, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tarefa } from '@/types/tarefa';

interface TarefaCardProps {
  tarefa: Tarefa;
  isSelected: boolean;
  isCompleted: boolean;
  onToggleSelect: (tarefaId: number) => void;
  onToggleComplete: (tarefaId: number) => void;
  getPriorityColor: (priority: string) => string;
}

export const TarefaCard: React.FC<TarefaCardProps> = ({
  tarefa,
  isSelected,
  isCompleted,
  onToggleSelect,
  onToggleComplete,
  getPriorityColor
}) => {
  return (
    <Card className={`transition-all duration-200 ${
      isCompleted ? "bg-muted/30 opacity-75" : ""
    } ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(tarefa.id)}
            />
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onToggleComplete(tarefa.id)}
              className="mt-1"
            />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <h4 className={`font-medium ${
                isCompleted ? "line-through text-muted-foreground" : ""
              }`}>
                {tarefa.title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(tarefa.priority)}>
                  {tarefa.priority}
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {tarefa.points} pts
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {tarefa.dueDate}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {tarefa.client}
              </div>
              <div className="flex items-center gap-1">
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <FileText className="h-4 w-4" />
                {tarefa.case}
              </div>
            </div>

            {tarefa.description && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                <p className="line-clamp-2">{tarefa.description}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};