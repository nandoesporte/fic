import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cocamarName: "Cocamar",
    cocamarMembers: "15800",
    cocamarEngagement: "88",
    sicoobName: "Sicoob",
    sicoobMembers: "25300",
    sicoobEngagement: "92",
    frisiaName: "Frísia",
    frisiaMembers: "12400",
    frisiaEngagement: "85"
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .maybeSingle();

        if (error) throw error;

        if (profile) {
          setFormData({
            cocamarName: profile.cocamarname || "Cocamar",
            cocamarMembers: profile.cocamarmembers || "15800",
            cocamarEngagement: profile.cocamarengagement || "88",
            sicoobName: profile.sicoobname || "Sicoob",
            sicoobMembers: profile.sicoobmembers || "25300",
            sicoobEngagement: profile.sicoobengagement || "92",
            frisiaName: profile.frisianame || "Frísia",
            frisiaMembers: profile.frisiamembers || "12400",
            frisiaEngagement: profile.frisiaengagement || "85"
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error("Erro ao carregar configurações");
      }
    };

    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          cocamarname: formData.cocamarName,
          cocamarmembers: formData.cocamarMembers,
          cocamarengagement: formData.cocamarEngagement,
          sicoobname: formData.sicoobName,
          sicoobmembers: formData.sicoobMembers,
          sicoobengagement: formData.sicoobEngagement,
          frisianame: formData.frisiaName,
          frisiamembers: formData.frisiaMembers,
          frisiaengagement: formData.frisiaEngagement
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar configurações");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações do Dashboard</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Cooperativas</h2>
          
          <div className="grid gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cocamarName">Nome da Cooperativa</Label>
                  <Input
                    id="cocamarName"
                    name="cocamarName"
                    value={formData.cocamarName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cocamarMembers">Número de Membros</Label>
                  <Input
                    id="cocamarMembers"
                    name="cocamarMembers"
                    value={formData.cocamarMembers}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cocamarEngagement">Engajamento (%)</Label>
                  <Input
                    id="cocamarEngagement"
                    name="cocamarEngagement"
                    value={formData.cocamarEngagement}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sicoobName">Nome da Cooperativa</Label>
                  <Input
                    id="sicoobName"
                    name="sicoobName"
                    value={formData.sicoobName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sicoobMembers">Número de Membros</Label>
                  <Input
                    id="sicoobMembers"
                    name="sicoobMembers"
                    value={formData.sicoobMembers}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sicoobEngagement">Engajamento (%)</Label>
                  <Input
                    id="sicoobEngagement"
                    name="sicoobEngagement"
                    value={formData.sicoobEngagement}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frisiaName">Nome da Cooperativa</Label>
                  <Input
                    id="frisiaName"
                    name="frisiaName"
                    value={formData.frisiaName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frisiaMembers">Número de Membros</Label>
                  <Input
                    id="frisiaMembers"
                    name="frisiaMembers"
                    value={formData.frisiaMembers}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frisiaEngagement">Engajamento (%)</Label>
                  <Input
                    id="frisiaEngagement"
                    name="frisiaEngagement"
                    value={formData.frisiaEngagement}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button className="mt-6" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </Card>
      </form>
    </div>
  );
}