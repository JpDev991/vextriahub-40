
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { formatCNJ, validateProcessNumber, extractCNJInfo } from "@/utils/cnjUtils";
import { useToast } from "@/hooks/use-toast";

interface NovoProcessoForm {
  titulo: string;
  cliente: string;
  numeroProcesso: string;
  descricao?: string;
  tipoProcesso?: string;
  valorCausa?: string;
  status: string;
}

interface NovoProcessoDialogProps {
  onAddProcesso?: (processo: NovoProcessoForm) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onProcessoCreated?: (processo: NovoProcessoForm) => void;
}

const TIPOS_PROCESSO = [
  "Ação de Cobrança",
  "Ação de Indenização",
  "Ação Trabalhista",
  "Divórcio",
  "Inventário",
  "Execução",
  "Cautelar",
  "Mandado de Segurança",
  "Ação Penal",
  "Outros"
];

const STATUS_PROCESSO = [
  "Iniciado",
  "Em Andamento",
  "Aguardando Documentos",
  "Suspenso",
  "Arquivado",
  "Encerrado"
];

export function NovoProcessoDialog({ onAddProcesso, open: externalOpen, onOpenChange: externalOnOpenChange, onProcessoCreated }: NovoProcessoDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [numeroValidation, setNumeroValidation] = useState<{ isValid: boolean; type: 'cnj' | 'livre'; message?: string } | null>(null);
  const [cnjInfo, setCnjInfo] = useState<any>(null);
  const { toast } = useToast();
  
  const form = useForm<NovoProcessoForm>({
    defaultValues: {
      titulo: "",
      cliente: "",
      numeroProcesso: "",
      descricao: "",
      tipoProcesso: "",
      valorCausa: "",
      status: "Iniciado",
    },
  });

  const handleNumeroProcessoChange = (value: string) => {
    let formattedValue = value;
    
    // Se parece com CNJ, formata automaticamente
    if (value.includes('-') || value.includes('.') || value.length > 10) {
      formattedValue = formatCNJ(value);
    }
    
    form.setValue('numeroProcesso', formattedValue);
    
    // Valida o número
    const validation = validateProcessNumber(formattedValue);
    setNumeroValidation(validation);
    
    // Se for CNJ válido, extrai informações
    if (validation.isValid && validation.type === 'cnj') {
      const info = extractCNJInfo(formattedValue);
      setCnjInfo(info);
    } else {
      setCnjInfo(null);
    }
  };

  const onSubmit = (values: NovoProcessoForm) => {
    // Valida o número do processo antes de submeter
    const validation = validateProcessNumber(values.numeroProcesso);
    if (!validation.isValid) {
      toast({
        title: "Erro de validação",
        description: validation.message || "Número do processo inválido",
        variant: "destructive",
      });
      return;
    }
    
    // Chama as funções de callback se existirem
    if (onAddProcesso) {
      onAddProcesso(values);
    }
    if (onProcessoCreated) {
      onProcessoCreated(values);
    }
    
    form.reset();
    setOpen(false);
    setNumeroValidation(null);
    setCnjInfo(null);
    
    toast({
      title: "Processo criado",
      description: `Processo ${values.numeroProcesso} foi criado com sucesso.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Processo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Processo</DialogTitle>
          <DialogDescription>
            Adicione um novo processo ao sistema. Use números CNJ para validação automática.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o título do processo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="numeroProcesso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Processo *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 1234567-89.2023.8.26.0001" 
                        {...field}
                        onChange={(e) => handleNumeroProcessoChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Digite um número CNJ válido ou número livre
                    </FormDescription>
                    {numeroValidation && (
                      <div className="flex items-center gap-2 mt-2">
                        {numeroValidation.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${
                          numeroValidation.isValid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {numeroValidation.type === 'cnj' ? 'CNJ válido' : 
                           numeroValidation.type === 'livre' ? 'Número livre' : 
                           numeroValidation.message}
                        </span>
                        {numeroValidation.type === 'cnj' && (
                          <Badge variant="secondary" className="text-xs">
                            CNJ
                          </Badge>
                        )}
                      </div>
                    )}
                    {cnjInfo && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700">Informações do CNJ</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
                          <div>Ano: {cnjInfo.ano}</div>
                          <div>Tribunal: {cnjInfo.tribunal}</div>
                          <div>Origem: {cnjInfo.origem}</div>
                          <div>Segmento: {cnjInfo.segmento}</div>
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tipoProcesso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Processo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_PROCESSO.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_PROCESSO.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="valorCausa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Causa</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="R$ 0,00" 
                        {...field}
                        onChange={(e) => {
                          // Formatar como moeda
                          let value = e.target.value.replace(/\D/g, '');
                          value = (Number(value) / 100).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          });
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva brevemente o processo..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Processo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
