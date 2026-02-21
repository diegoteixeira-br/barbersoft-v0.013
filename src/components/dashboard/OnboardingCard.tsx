import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Circle, X, Mail, CreditCard, Settings, Users, Scissors } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OnboardingCardProps {
  isEmailConfirmed: boolean;
  planStatus: string | null;
  hasBarbers: boolean;
  hasServices: boolean;
}

export function OnboardingCard({ isEmailConfirmed, planStatus, hasBarbers, hasServices }: OnboardingCardProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("barbersoft_onboarding_dismissed") === "true";
  });

  if (dismissed) return null;

  const hasPlan = planStatus === "active";

  const steps = [
    {
      label: "Confirmar email",
      description: "Verifique sua caixa de entrada",
      done: isEmailConfirmed,
      icon: Mail,
      action: null,
    },
    {
      label: "Escolher um plano",
      description: "Assine para desbloquear tudo",
      done: hasPlan,
      icon: CreditCard,
      action: () => navigate("/assinatura"),
    },
    {
      label: "Cadastrar profissionais",
      description: "Adicione sua equipe",
      done: hasBarbers,
      icon: Users,
      action: () => navigate("/profissionais"),
    },
    {
      label: "Cadastrar serviços",
      description: "Defina cortes, barba e mais",
      done: hasServices,
      icon: Scissors,
      action: () => navigate("/servicos"),
    },
    {
      label: "Configurar sua barbearia",
      description: "Horários e preferências",
      done: false,
      icon: Settings,
      action: () => navigate("/configuracoes"),
    },
  ];

  const handleDismiss = () => {
    localStorage.setItem("barbersoft_onboarding_dismissed", "true");
    setDismissed(true);
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <CardContent className="pt-6">
        <h3 className="font-bold text-foreground mb-1">
          👋 Bem-vindo ao BarberSoft!
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Complete os passos abaixo para configurar sua conta:
        </p>

        <div className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 group"
              >
                <div className="flex-shrink-0">
                  {step.done ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${step.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {!step.done && step.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0 text-xs"
                    onClick={step.action}
                  >
                    Ir
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
