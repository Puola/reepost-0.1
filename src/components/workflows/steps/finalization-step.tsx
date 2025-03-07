interface FinalizationStepProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
}

export function FinalizationStep({ workflowName, onWorkflowNameChange }: FinalizationStepProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNvbmZldHRpIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBoLTQweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDk5LDcxLDAuMikiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjY29uZmV0dGkpIi8+PC9zdmc+')] opacity-50" />
      <div className="relative py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Félicitations !</h2>
        <p className="text-gray-600 mb-8">Il ne te reste plus qu'à donner un nom à ton nouveau workflow</p>
        <input
          type="text"
          placeholder="New workflow name"
          value={workflowName}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg border-2 border-gray-200 text-center"
        />
      </div>
    </div>
  );
}