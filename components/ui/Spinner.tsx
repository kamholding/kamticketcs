// C:\Next\kam\kam_ticket_latest\components\ui\Spinner.tsx
export default function Spinner({ size = 8 }: { size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
    />
  );
}
