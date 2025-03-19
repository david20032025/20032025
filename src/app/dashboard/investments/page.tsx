import BrokerAccountsList from "@/components/dashboard/broker-accounts-list";
import BrokerHoldingsList from "@/components/dashboard/broker-holdings-list";

export default function InvestmentsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Investment Accounts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BrokerAccountsList />
        </div>
        <div className="lg:col-span-2">
          <BrokerHoldingsList />
        </div>
      </div>
    </div>
  );
}
