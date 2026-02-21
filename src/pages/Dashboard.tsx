import { useState, useEffect } from "react";
import { DollarSign, Calendar, TrendingUp, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboardData, calculatePercentageChange, formatCurrency } from "@/hooks/useDashboardData";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueBarChart } from "@/components/dashboard/RevenueBarChart";
import { ServicesPieChart } from "@/components/dashboard/ServicesPieChart";
import { TopBarberCard } from "@/components/dashboard/TopBarberCard";
import { UpcomingAppointmentsList } from "@/components/dashboard/UpcomingAppointmentsList";
import { FinancialOverviewChart } from "@/components/dashboard/FinancialOverviewChart";
import { OnboardingCard } from "@/components/dashboard/OnboardingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { useBarbers } from "@/hooks/useBarbers";
import { useServices } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUnit } from "@/contexts/UnitContext";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [customDateRange, setCustomDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(true);
  const { status } = useSubscription();
  const { currentUnitId } = useCurrentUnit();
  const { barbers } = useBarbers(currentUnitId);
  const { services } = useServices(currentUnitId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsEmailConfirmed(!!data.user?.email_confirmed_at);
    });
  }, []);

  const { 
    metrics, 
    last7DaysRevenue, 
    popularServices, 
    topBarbers, 
    upcomingAppointments,
    financialOverviewWeek,
    financialOverviewMonth,
    financialOverviewCustom,
    isLoading 
  } = useDashboardData(customDateRange);

  const todayDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  // Calculate percentage changes
  const revenueChange = calculatePercentageChange(metrics.todayRevenue, metrics.yesterdayRevenue);
  const appointmentsChange = metrics.todayAppointments - metrics.yesterdayAppointments;
  const ticketChange = calculatePercentageChange(metrics.averageTicket, metrics.lastMonthAverageTicket);
  const clientsChange = calculatePercentageChange(metrics.monthAppointments, metrics.lastMonthAppointments);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground capitalize">{todayDate}</p>
        </div>
        {/* Onboarding Card for trial users */}
        {(status?.plan_status === "trial" || !status?.plan_status) && (
          <OnboardingCard isEmailConfirmed={isEmailConfirmed} planStatus={status?.plan_status || null} hasBarbers={(barbers?.length || 0) > 0} hasServices={(services?.length || 0) > 0} />
        )}

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Faturamento Hoje"
            value={formatCurrency(metrics.todayRevenue)}
            change={revenueChange}
            description="vs. ontem"
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            isLoading={isLoading}
          />
          <MetricCard
            title="Agendamentos Hoje"
            value={metrics.todayAppointments.toString()}
            change={metrics.yesterdayAppointments > 0 
              ? ((appointmentsChange / metrics.yesterdayAppointments) * 100) 
              : (appointmentsChange > 0 ? 100 : 0)
            }
            description="vs. ontem"
            icon={<Calendar className="h-5 w-5 text-primary" />}
            isLoading={isLoading}
          />
          <MetricCard
            title="Ticket Médio"
            value={formatCurrency(metrics.averageTicket)}
            change={ticketChange}
            description="vs. mês passado"
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            isLoading={isLoading}
          />
          <MetricCard
            title="Atendimentos no Mês"
            value={metrics.monthAppointments.toString()}
            change={clientsChange}
            description="vs. mês passado"
            icon={<Users className="h-5 w-5 text-primary" />}
            isLoading={isLoading}
          />
        </div>

        {/* Financial Overview - Full Width */}
        <FinancialOverviewChart 
          weekData={financialOverviewWeek} 
          monthData={financialOverviewMonth}
          customData={financialOverviewCustom}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
          isLoading={isLoading} 
        />

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueBarChart data={last7DaysRevenue} isLoading={isLoading} />
          <ServicesPieChart data={popularServices} isLoading={isLoading} />
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingAppointmentsList appointments={upcomingAppointments} isLoading={isLoading} />
          <TopBarberCard topBarbers={topBarbers} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
