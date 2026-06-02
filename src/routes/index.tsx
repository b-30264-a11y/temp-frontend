import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  User,
  Wallet,
  CreditCard,
  FileText,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import logo from "@/assets/logo.png";

const API_URL = "https://temp-backend-rgcl.onrender.com/predict";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loan Approval Prediction System | AI Banking Assistant" },
      {
        name: "description",
        content:
          "Smart AI-based assessment for loan approval decisions powered by machine learning.",
      },
    ],
  }),
  component: Index,
});

type FieldType = "number" | "decimal" | "select";
interface Field {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
}

const sections: { title: string; icon: React.ElementType; fields: Field[] }[] = [
  {
    title: "Personal Details",
    icon: User,
    fields: [
      { name: "Age", label: "Age", type: "number", placeholder: "e.g. 35" },
      {
        name: "MaritalStatus",
        label: "Marital Status",
        type: "select",
        options: ["Single", "Married", "Divorced", "Widowed"],
      },
      { name: "NumberOfDependents", label: "Number of Dependents", type: "number", placeholder: "e.g. 2" },
      {
        name: "EducationLevel",
        label: "Education Level",
        type: "select",
        options: ["High School", "Associate", "Bachelor", "Master", "Doctorate"],
      },
      {
        name: "EmploymentStatus",
        label: "Employment Status",
        type: "select",
        options: ["Employed", "Self-Employed", "Unemployed"],
      },
      { name: "Experience", label: "Years of Experience", type: "number", placeholder: "e.g. 10" },
      { name: "JobTenure", label: "Job Tenure (years)", type: "number", placeholder: "e.g. 5" },
      {
        name: "HomeOwnershipStatus",
        label: "Home Ownership",
        type: "select",
        options: ["Own", "Rent", "Mortgage", "Other"],
      },
    ],
  },
  {
    title: "Income & Financial Details",
    icon: Wallet,
    fields: [
      { name: "AnnualIncome", label: "Annual Income ($)", type: "number", placeholder: "75000" },
      { name: "MonthlyIncome", label: "Monthly Income ($)", type: "number", placeholder: "6250" },
      { name: "LoanAmount", label: "Loan Amount ($)", type: "number", placeholder: "20000" },
      { name: "LoanDuration", label: "Loan Duration (months)", type: "number", placeholder: "48" },
      { name: "MonthlyDebtPayments", label: "Monthly Debt Payments ($)", type: "number", placeholder: "400" },
      { name: "SavingsAccountBalance", label: "Savings Balance ($)", type: "number", placeholder: "5000" },
      { name: "CheckingAccountBalance", label: "Checking Balance ($)", type: "number", placeholder: "2000" },
      { name: "TotalAssets", label: "Total Assets ($)", type: "number", placeholder: "150000" },
      { name: "TotalLiabilities", label: "Total Liabilities ($)", type: "number", placeholder: "30000" },
      { name: "NetWorth", label: "Net Worth ($)", type: "number", placeholder: "120000" },
    ],
  },
  {
    title: "Credit Profile",
    icon: CreditCard,
    fields: [
      { name: "CreditScore", label: "Credit Score", type: "number", placeholder: "680" },
      { name: "DebtToIncomeRatio", label: "Debt to Income Ratio", type: "decimal", placeholder: "0.25" },
      { name: "TotalDebtToIncomeRatio", label: "Total Debt to Income Ratio", type: "decimal", placeholder: "0.20" },
      { name: "CreditCardUtilizationRate", label: "Credit Card Utilization", type: "decimal", placeholder: "0.25" },
      { name: "NumberOfOpenCreditLines", label: "Open Credit Lines", type: "number", placeholder: "4" },
      { name: "NumberOfCreditInquiries", label: "Credit Inquiries", type: "number", placeholder: "1" },
      { name: "LengthOfCreditHistory", label: "Credit History (years)", type: "number", placeholder: "12" },
      { name: "PaymentHistory", label: "Payment History Score", type: "number", placeholder: "25" },
      { name: "UtilityBillsPaymentHistory", label: "Utility Bills Payment History", type: "decimal", placeholder: "0.90" },
      {
        name: "BankruptcyHistory",
        label: "Bankruptcy History",
        type: "select",
        options: ["0", "1"],
      },
      {
        name: "PreviousLoanDefaults",
        label: "Previous Loan Defaults",
        type: "select",
        options: ["0", "1"],
      },
    ],
  },
  {
    title: "Loan Information",
    icon: FileText,
    fields: [
      {
        name: "LoanPurpose",
        label: "Loan Purpose",
        type: "select",
        options: ["Home", "Auto", "Education", "Debt Consolidation", "Other"],
      },
    ],
  },
];

const allFields = sections.flatMap((s) => s.fields);

const numericFields = new Set(
  allFields.filter((f) => f.type === "number" || f.type === "decimal").map((f) => f.name),
);

interface PredictionResult {
  prediction: number;
  result: string;
  approval_probability?: number;
}

function Index() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const setField = (name: string, value: string) =>
    setValues((v) => ({ ...v, [name]: value }));

  const handleReset = () => {
    setValues({});
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const missing = allFields.filter((f) => !values[f.name] && values[f.name] !== "0");
    if (missing.length > 0) {
      setError(`Please fill in all fields. Missing: ${missing[0].label}`);
      return;
    }

    const payload: Record<string, string | number> = {};
    for (const f of allFields) {
      const raw = values[f.name];
      if (numericFields.has(f.name)) {
        payload[f.name] = Number(raw);
      } else if (f.name === "BankruptcyHistory" || f.name === "PreviousLoanDefaults") {
        payload[f.name] = Number(raw);
      } else {
        payload[f.name] = raw;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: PredictionResult = await res.json();
      setResult(data);
      setTimeout(() => {
        document.getElementById("result-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}. Make sure the Flask API is running at ${API_URL} with CORS enabled.`
          : "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  };

  const approved = result?.result === "Loan Approved";
  const probPct = result?.approval_probability != null ? Math.round(result.approval_probability * 100) : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-brand)" }}
        />
        <div
          className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--gradient-success)" }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-md bg-background/70 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" width={40} height={40} className="rounded-lg" />
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-brand)" }}>
                LoanIQ
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">AI Approval System</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-[color:var(--teal)]" />
            <span>Secure ML Prediction</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {/* Hero */}
        <section className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border border-[color:var(--brand)]/20 bg-[color:var(--brand)]/5 text-[color:var(--brand)]">
            <Sparkles className="h-3 w-3" />
            Powered by Machine Learning
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
              Loan Approval Prediction
            </span>
            <br />
            <span className="text-foreground">System</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Smart AI-based assessment for loan approval decisions
          </p>
        </section>

        {/* Intro + feature badges */}
        <Card className="mb-8 border-0 shadow-xl overflow-hidden" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div className="h-1.5 w-full" style={{ background: "var(--gradient-brand)" }} />
          <CardContent className="p-6 sm:p-8">
            <p className="text-foreground/80 text-center sm:text-left mb-6 leading-relaxed">
              This system predicts whether a loan application is likely to be{" "}
              <span className="font-semibold text-[color:var(--success)]">approved</span> or{" "}
              <span className="font-semibold text-[color:var(--warning)]">rejected</span> based on financial,
              credit, and applicant details.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Sparkles, label: "AI Prediction", color: "var(--brand)" },
                { icon: Zap, label: "Fast Decision Support", color: "var(--teal)" },
                { icon: Lock, label: "Secure Assessment", color: "var(--success)" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className="p-2 rounded-lg flex items-center justify-center"
                    style={{ background: `color-mix(in oklab, ${f.color} 12%, transparent)` }}
                  >
                    <f.icon className="h-4 w-4" style={{ color: `${f.color}` }} />
                  </div>
                  <span className="text-sm font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {sections.map((section) => (
            <Card key={section.title} className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 w-full" style={{ background: "var(--gradient-brand)" }} />
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <section.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{section.title}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.fields.map((f) => (
                    <div key={f.name} className="space-y-1.5">
                      <Label htmlFor={f.name} className="text-xs font-semibold text-foreground/80">
                        {f.label}
                      </Label>
                      {f.type === "select" ? (
                        <Select value={values[f.name] ?? ""} onValueChange={(v) => setField(f.name, v)}>
                          <SelectTrigger id={f.name} className="h-10">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {f.options!.map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={f.name}
                          type="number"
                          step={f.type === "decimal" ? "0.01" : "1"}
                          placeholder={f.placeholder}
                          value={values[f.name] ?? ""}
                          onChange={(e) => setField(f.name, e.target.value)}
                          className="h-10"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {error && (
            <div className="p-4 rounded-xl border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/5 text-[color:var(--warning)] text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 text-base font-semibold text-white border-0 hover:opacity-90 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-elegant)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing application...
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Predict Loan Approval
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className="h-14 sm:w-auto px-6"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div id="result-card" className="mt-10 animate-fade-in">
            <Card
              className="border-0 shadow-2xl overflow-hidden"
              style={{
                boxShadow: approved
                  ? "0 20px 60px -20px color-mix(in oklab, var(--success) 40%, transparent)"
                  : "0 20px 60px -20px color-mix(in oklab, var(--warning) 40%, transparent)",
              }}
            >
              <div
                className="h-2 w-full"
                style={{ background: approved ? "var(--gradient-success)" : "var(--gradient-warning)" }}
              />
              <CardContent className="p-8 sm:p-10">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="p-4 rounded-full mb-4 animate-scale-in"
                    style={{
                      background: approved ? "var(--gradient-success)" : "var(--gradient-warning)",
                    }}
                  >
                    {approved ? (
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    ) : (
                      <XCircle className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <h3
                    className="text-3xl sm:text-4xl font-bold mb-2"
                    style={{ color: approved ? "var(--success)" : "var(--warning)" }}
                  >
                    {result.result}
                  </h3>
                  {probPct != null && (
                    <div className="w-full max-w-md mt-6">
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="text-muted-foreground">Approval Probability</span>
                        <span style={{ color: approved ? "var(--success)" : "var(--warning)" }}>
                          {probPct}%
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${probPct}%`,
                            background: approved
                              ? "var(--gradient-success)"
                              : "var(--gradient-warning)",
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-6 max-w-md">
                    This prediction is generated using the applicant's financial, income, and credit information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="border-t border-border/40 mt-16 py-6 text-center text-xs text-muted-foreground">
        <p>Built using Machine Learning, Flask API, and predictive analytics.</p>
      </footer>
    </div>
  );
}
