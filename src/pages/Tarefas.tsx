
import { Calendar, Plus, Search, Filter, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const tasks = [
  {
    id: 1,
    title: "Protocolar petição inicial - Silva vs. Empresa XYZ",
    dueDate: "Hoje, 16:00",
    priority: "alta",
    client: "Maria Silva",
    case: "Trabalhista #2024-001",
    points: 50,
    completed: false
  },
  {
    id: 2,
    title: "Responder publicação judicial",
    dueDate: "Amanhã, 12:00",
    priority: "alta",
    client: "João Santos",
    case: "Civil #2024-015",
    points: 40,
    completed: false
  },
  {
    id: 3,
    title: "Reunião com cliente",
    dueDate: "23/01, 14:30",
    priority: "media",
    client: "Tech Solutions Ltda",
    case: "Empresarial #2024-008",
    points: 20,
    completed: true
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "alta":
      return "bg-destructive text-destructive-foreground";
    case "media":
      return "bg-accent text-accent-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Tarefas = () => {
  const { toast } = useToast();
  const [taskList, setTaskList] = useState(tasks);
  const [completedTasks, setCompletedTasks] = useState<number[]>([3]);

  const toggleTask = (taskId: number) => {
    setCompletedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie suas tarefas e prazos com sistema de pontuação.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {taskList.map((task) => (
          <Card key={task.id} className={`transition-all duration-200 ${
            completedTasks.includes(task.id) ? "bg-muted/30 opacity-75" : ""
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedTasks.includes(task.id)}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <h4 className={`font-medium ${
                      completedTasks.includes(task.id) ? "line-through text-muted-foreground" : ""
                    }`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {task.points} pts
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {task.dueDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {task.client}
                    </div>
                    <div className="flex items-center gap-1">
                      {completedTasks.includes(task.id) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      {task.case}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tarefas;
