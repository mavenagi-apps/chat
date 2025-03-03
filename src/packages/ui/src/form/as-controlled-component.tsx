import { ErrorMessage as ErrorMessageRHF } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";

import { ErrorMessage } from "./fieldset";
import { useFormFieldContext } from "./form";

export function asControlledComponent<
  P extends object,
  DefaultValueRequired = false,
>(
  Component: React.ComponentType<P & { invalid?: boolean }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  {
    valueAsChecked = false,
    defaultValue,
  }: { valueAsChecked?: boolean; defaultValue?: any } = {},
) {
  const AsControlledComponent = ({
    defaultValue: defaultValueProp,
    ...props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: P &
    (DefaultValueRequired extends true
      ? { defaultValue: any }
      : { defaultValue?: any })) => {
    const formContext = useFormContext();
    const formFieldContext = useFormFieldContext();
    if (!formFieldContext) {
      return <Component {...(props as unknown as P)} />;
    }
    const { controlId } = formFieldContext;
    const {
      control,
      formState: { errors },
    } = formContext;
    return (
      <>
        <Controller
          name={controlId}
          control={control}
          defaultValue={defaultValue ?? defaultValueProp}
          render={({
            field: { onChange, onBlur, value, disabled, name },
            fieldState: { invalid },
          }) => (
            <Component
              onChange={onChange}
              onBlur={onBlur}
              {...(valueAsChecked ? { checked: value } : { value })}
              disabled={disabled}
              name={name}
              invalid={invalid}
              {...(props as unknown as P)}
            />
          )}
        />
        <ErrorMessageRHF
          errors={errors}
          name={controlId}
          render={({ message }) => <ErrorMessage>{message}</ErrorMessage>}
        />
      </>
    );
  };
  AsControlledComponent.displayName = `AsControlledComponent(${Component.displayName || Component.name || "Component"})`;
  return AsControlledComponent;
}
