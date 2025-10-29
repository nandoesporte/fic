import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  BarChart3, 
  Users,
  Hash,
  FileText,
  Brain
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface VoteGroup {
  groupName: string;
  originalTexts: string[];
  votes: number;
  percentage: number;
}

interface ConsolidatedReportProps {
  dimension: string;
  totalVotes: number;
  uniqueVoters: number;
  strengths: VoteGroup[];
  challenges: VoteGroup[];
  opportunities: VoteGroup[];
  summary: string;
  insights: string[];
  keywords: string[];
  topDimensions?: { dimension: string; count: number }[];
}

const CategoryCard = ({ 
  title, 
  icon: Icon, 
  items, 
  bgColorClass 
}: { 
  title: string; 
  icon: any; 
  items: VoteGroup[]; 
  bgColorClass: string;
}) => {
  if (items.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`h-6 w-6`} />
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-muted-foreground">Nenhum dado disponível nesta categoria.</p>
      </Card>
    );
  }

  // Sort items by votes (descending)
  const sortedItems = [...items].sort((a, b) => b.votes - a.votes);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon className={`h-6 w-6`} />
        <h3 className="text-xl font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto">
          {items.length} grupos
        </Badge>
      </div>
      
      <div className="space-y-3">
        {sortedItems.map((item, index) => (
          <div
            key={index}
            className={`p-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${bgColorClass}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <span className="text-sm font-medium">{item.groupName}</span>
              </div>
              <div className="text-right">
                <span className="text-xs opacity-75">Total de votos</span>
                <p className="font-bold">{item.percentage.toFixed(1)}% ({item.votes})</p>
              </div>
            </div>
            
            {item.originalTexts.length > 0 && (
              <Accordion type="single" collapsible>
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="py-2 text-xs opacity-75 hover:no-underline">
                    Ver {item.originalTexts.length} variações agrupadas
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <ul className="space-y-1 text-xs opacity-90">
                      {item.originalTexts.map((text, idx) => (
                        <li key={idx} className="list-disc ml-4">
                          {text}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export const ConsolidatedReportView = (props: ConsolidatedReportProps) => {
  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Votos</p>
              <p className="text-3xl font-bold mt-2">{props.totalVotes}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Votantes Únicos</p>
              <p className="text-3xl font-bold mt-2">{props.uniqueVoters}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dimensão Analisada</p>
              <p className="text-lg font-bold mt-2">{props.dimension}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-6 w-6 text-indigo-600" />
          <h3 className="text-xl font-semibold">Resumo Executivo</h3>
        </div>
        <div className="prose max-w-none">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
            {props.summary}
          </p>
        </div>
      </Card>

      {/* Insights Estratégicos */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-600" />
          <h3 className="text-xl font-semibold">Insights Estratégicos</h3>
        </div>
        <ul className="space-y-3">
          {props.insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {index + 1}
              </span>
              <span className="text-foreground/90 flex-1">{insight}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Palavras-Chave */}
      {props.keywords.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Hash className="h-6 w-6 text-cyan-600" />
            <h3 className="text-xl font-semibold">Palavras-Chave Recorrentes</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {props.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                {keyword}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Dimensões Mais Mencionadas */}
      {props.topDimensions && props.topDimensions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-6 w-6 text-orange-600" />
            <h3 className="text-xl font-semibold">Dimensões Mais Mencionadas</h3>
          </div>
          <div className="space-y-3">
            {props.topDimensions.map((dim, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium">{dim.dimension}</span>
                <Badge variant="secondary">{dim.count} menções</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pontos Fortes */}
      <CategoryCard
        title="Pontos Fortes Consolidados"
        icon={TrendingUp}
        items={props.strengths}
        bgColorClass="bg-[#2F855A] text-white"
      />

      {/* Desafios */}
      <CategoryCard
        title="Desafios Consolidados"
        icon={AlertTriangle}
        items={props.challenges}
        bgColorClass="bg-[#FFD700] text-gray-900"
      />

      {/* Oportunidades */}
      <CategoryCard
        title="Oportunidades Consolidadas"
        icon={Lightbulb}
        items={props.opportunities}
        bgColorClass="bg-[#000080] text-white"
      />
    </div>
  );
};
