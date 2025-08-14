import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cocamarName: "Cocamar",
    cocamarMembers: "15800",
    cocamarEngagement: "88",
    sicoobName: "Sicoob",
    sicoobMembers: "25300",
    sicoobEngagement: "92",
    frisiaName: "Frísia",
    frisiaMembers: "12400",
    frisiaEngagement: "85",
    coopImage1: "",
    coopImage2: "",
    coopImage3: "",
    coopImage4: ""
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!session?.user) {
      navigate('/login');
      return;
    }

    const loadSettings = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading settings:', error);
          toast.error("Erro ao carregar configurações");
          return;
        }

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
            frisiaEngagement: profile.frisiaengagement || "85",
            coopImage1: profile.coop_image_1 || "",
            coopImage2: profile.coop_image_2 || "",
            coopImage3: profile.coop_image_3 || "",
            coopImage4: profile.coop_image_4 || ""
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error("Erro ao carregar configurações");
      }
    };

    loadSettings();
  }, [session, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Você precisa estar logado para salvar as configurações");
      return;
    }

    setLoading(true);

    try {
      // First try to update, if no rows affected, create profile
      const { data, error } = await supabase
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
          frisiaengagement: formData.frisiaEngagement,
          coop_image_1: formData.coopImage1,
          coop_image_2: formData.coopImage2,
          coop_image_3: formData.coopImage3,
          coop_image_4: formData.coopImage4
        })
        .eq('id', session.user.id)
        .select();

      if (error) throw error;
      
      // If no profile exists, create one
      if (!data || data.length === 0) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email || '',
            cocamarname: formData.cocamarName,
            cocamarmembers: formData.cocamarMembers,
            cocamarengagement: formData.cocamarEngagement,
            sicoobname: formData.sicoobName,
            sicoobmembers: formData.sicoobMembers,
            sicoobengagement: formData.sicoobEngagement,
            frisianame: formData.frisiaName,
            frisiamembers: formData.frisiaMembers,
            frisiaengagement: formData.frisiaEngagement,
            coop_image_1: formData.coopImage1,
            coop_image_2: formData.coopImage2,
            coop_image_3: formData.coopImage3,
            coop_image_4: formData.coopImage4
          });
        
        if (insertError) throw insertError;
      }
      
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar configurações");
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

          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Imagens das Cooperativas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coopImage1">Imagem da Cooperativa 1 (URL)</Label>
                <Input
                  id="coopImage1"
                  name="coopImage1"
                  value={formData.coopImage1}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/logo1.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coopImage2">Imagem da Cooperativa 2 (URL)</Label>
                <Input
                  id="coopImage2"
                  name="coopImage2"
                  value={formData.coopImage2}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/logo2.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coopImage3">Imagem da Cooperativa 3 (URL)</Label>
                <Input
                  id="coopImage3"
                  name="coopImage3"
                  value={formData.coopImage3}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/logo3.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coopImage4">Imagem da Cooperativa 4 (URL)</Label>
                <Input
                  id="coopImage4"
                  name="coopImage4"
                  value={formData.coopImage4}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/logo4.png"
                />
              </div>
            </div>
          </Card>

          <Button className="mt-6" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </Card>
      </form>
    </div>
  );
};