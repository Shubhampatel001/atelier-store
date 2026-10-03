import { useId, type ComponentProps } from "react";

const inputClass =
  "min-h-12 w-full border-b border-line-strong bg-transparent px-0 text-body placeholder:text-subtle";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  hint?: string;
};

/** Labelled underline input with an optional hint. */
export function Field({ label, hint, ...input }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-label">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hintId}
        className={inputClass}
        {...input}
      />
      {hint && (
        <p id={hintId} className="type-caption">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Inline form error, announced when it appears. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-body-sm text-sale">
      {message}
    </p>
  );
}
