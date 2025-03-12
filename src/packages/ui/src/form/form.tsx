"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ComponentProps,
  type FC,
  createContext,
  useContext,
  useId,
} from "react";
import {
  type FieldPath,
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
  useForm as useFormRHF,
  Controller,
} from "react-hook-form";
import { type ZodTypeDef, type z } from "zod";

// import {FetchError} from '@magi/fetcher'

import { Button } from "../button";
import { CheckboxField, Field, type FieldProps } from "./fieldset";
import { Select, SelectTrigger, SelectValue, SelectContent } from "./select";

const FormFieldContext = createContext<{ controlId: string } | undefined>(
  undefined,
);
const FormFieldProvider = FormFieldContext.Provider;

export const useFormFieldContext = () => useContext(FormFieldContext);

// Form field components
const FormField = <TFieldValues extends FieldValues>({
  controlId,
  ...props
}: { controlId: FieldPath<TFieldValues> } & FieldProps) => {
  return (
    <FormFieldProvider value={{ controlId }}>
      <Field {...props} />
    </FormFieldProvider>
  );
};

const FormCheckboxField = <TFieldValues extends FieldValues>({
  controlId,
  ...props
}: { controlId: FieldPath<TFieldValues> } & FieldProps) => {
  return (
    <FormFieldProvider value={{ controlId }}>
      <CheckboxField {...props} />
    </FormFieldProvider>
  );
};

// New FormSelectField component
type FormSelectFieldProps<TFieldValues extends FieldValues> = {
  controlId: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

const FormSelectField = <TFieldValues extends FieldValues>({
  controlId,
  label,
  description,
  placeholder,
  required,
  className,
  children,
}: FormSelectFieldProps<TFieldValues>) => {
  return (
    <FormFieldProvider value={{ controlId }}>
      <Controller
        name={controlId}
        rules={{ required }}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            {label && (
              <label className="text-sm font-medium">
                {label}
                {required && <span className="text-red-500">*</span>}
              </label>
            )}
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
            <Select
              onValueChange={field.onChange}
              value={field.value || ""}
              defaultValue=""
            >
              <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                {children}
              </SelectContent>
            </Select>
            {fieldState.error && (
              <p className="text-xs text-red-500">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
    </FormFieldProvider>
  );
};

export function useForm<
  Output extends FieldValues,
  Def extends ZodTypeDef,
  Input extends FieldValues,
>({
  onSubmit,
  schema,
  ...props
}: Omit<UseFormProps<Input>, "resolver"> & {
  schema: z.ZodType<Output, Def, Input>;
  onSubmit: SubmitHandler<Output>;
  fieldnameMapper?: (fieldName: string) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): UseFormReturn<Input, any, Output> & {
  id: string;
  onSubmit: SubmitHandler<Output>;
  fieldnameMapper?: (fieldName: string) => string;
  Form: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Form: typeof Form<Input, any, Output>;
    Field: typeof FormField<Input>;
    CheckboxField: typeof FormCheckboxField<Input>;
    SelectField: typeof FormSelectField<Input>;
    SubmitButton: FC<ComponentProps<typeof Button>>;
  };
};

export function useForm<TFieldValues extends FieldValues>({
  onSubmit,
  ...props
}: Omit<UseFormProps<TFieldValues>, "resolver"> & {
  schema?: never;
  onSubmit: SubmitHandler<TFieldValues>;
  fieldnameMapper?: (fieldName: string) => string;
}): UseFormReturn<TFieldValues> & {
  id: string;
  onSubmit: SubmitHandler<TFieldValues>;
  fieldnameMapper?: (fieldName: string) => string;
  Form: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Form: typeof Form<TFieldValues, any, TFieldValues>;
    Field: typeof FormField<TFieldValues>;
    CheckboxField: typeof FormCheckboxField<TFieldValues>;
    SelectField: typeof FormSelectField<TFieldValues>;
    SubmitButton: FC<ComponentProps<typeof Button>>;
  };
};

export function useForm<
  TFieldValues extends FieldValues,
  TTransformedValues extends FieldValues,
  TSchema extends z.ZodType,
>({
  onSubmit,
  fieldnameMapper,
  schema,
  ...props
}: Omit<UseFormProps<TFieldValues>, "resolver"> & {
  schema?: TSchema;
  onSubmit: SubmitHandler<TTransformedValues>;
  fieldnameMapper?: (fieldName: string) => string;
}) {
  const id = useId();
  const methods = {
    ...useFormRHF({
      mode: "onBlur",
      resolver:
        schema !== undefined ? zodResolver(schema, undefined) : undefined,
      ...props,
    }),
    onSubmit,
    fieldnameMapper,
    id,
  };

  const SubmitButton = (props: React.ComponentProps<typeof Button>) => {
    return (
      <Button
        // @ts-expect-error ButtonProps are wrong
        form={id}
        isProcessing={methods.formState.isSubmitting}
        type="submit"
        {...props}
      />
    );
  };

  return {
    Form: {
      Form,
      Field: FormField<TFieldValues>,
      CheckboxField: FormCheckboxField<TFieldValues>,
      SelectField: FormSelectField<TFieldValues>,
      SubmitButton,
    },
    ...methods,
  };
}

const Form = <
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues extends FieldValues,
>({
  children,
  id,
  onSubmit,
  fieldnameMapper,
  className,
  ...methods
}: React.PropsWithChildren<
  UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
    id: string;
    onSubmit: SubmitHandler<TTransformedValues>;
    fieldnameMapper?: (fieldName: string) => string;
    className?: string;
  }
>) => {
  return (
    <FormProvider {...methods}>
      <form
        role="form"
        id={id}
        className={className}
        onSubmit={(event) => {
          if (event) {
            if (typeof event.preventDefault === "function") {
              event.preventDefault();
            }
            if (typeof event.stopPropagation === "function") {
              event.stopPropagation();
            }
          }
          void methods.handleSubmit(
            // @ts-expect-error handleSubmit
            async (values: TTransformedValues, event) => {
              try {
                await onSubmit(values, event);
              } catch (error: any) {
                // if (error instanceof FetchError && error.response?.status === 400) {
                if (error.response?.status === 400) {
                  const data = await error.response?.json();
                  const violations: { fieldName: string; message: string }[] =
                    data?.violations;
                  if (violations) {
                    // TODO(doll): This manual prefixing is a hack. Spring boot isn't returning the requestPart prefix in the field name
                    violations.map((value) => {
                      methods.setError(
                        // @ts-expect-error setError
                        fieldnameMapper?.(value.fieldName) ?? value.fieldName,
                        {
                          message: value.message,
                        },
                      );
                    });
                  } else {
                    methods.setError("root.serverError", {
                      message: data?.message || "Unknown error",
                    });
                  }
                } else {
                  methods.setError("root.serverError", {
                    message: (error as Error)?.message ?? "Unknown error",
                    type: "server",
                  });
                }
              }
            },
            console.error,
          )(event);
        }}
      >
        {methods.formState.errors.root?.serverError && (
          <div>{methods.formState.errors.root.serverError.message}</div>
        )}
        {children}
      </form>
    </FormProvider>
  );
};

export { FormField, FormCheckboxField, FormSelectField };
