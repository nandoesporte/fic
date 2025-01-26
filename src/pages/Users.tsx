import { RegisteredVotersSection } from "@/components/RegisteredVotersSection";
import { Card } from "@/components/ui/card";
import { Users as UsersIcon } from "lucide-react";

const Users = () => {
  return (
    <Card className="p-8">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
        <UsersIcon className="h-6 w-6 text-primary" />
        Participantes Cadastrados
      </h2>
      <RegisteredVotersSection />
    </Card>
  );
};

export default Users;