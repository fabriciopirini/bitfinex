export const ErrorAlert = ({ message }: { message: string }) => (
  <div
    role="alert"
    className="relative w-full rounded-lg border px-4 py-3 text-sm border-destructive/50 text-red-500 dark:border-destructive"
  >
    <h5 className="mb-1 font-medium leading-none tracking-tight">Error</h5>
    <p className="text-sm leading-relaxed">{message}</p>
  </div>
);
