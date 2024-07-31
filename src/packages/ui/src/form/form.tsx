'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {type ComponentProps, type FC, createContext, useContext, useId} from 'react'
import {
  type FieldPath,
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
  useForm as useFormRHF,
} from 'react-hook-form'
import {type ZodTypeDef, type z} from 'zod'

import {FetchError} from '@magi/fetcher'

import {Button} from '../button'
import {CheckboxField, Field, type FieldProps} from './fieldset'

const FormFieldContext = createContext<{controlId: string} | undefined>(undefined)
const FormFieldProvider = FormFieldContext.Provider

export const useFormFieldContext = () => useContext(FormFieldContext)

export function useForm<Output extends FieldValues, Def extends ZodTypeDef, Input extends FieldValues>({
  onSubmit,
  schema,
  ...props
}: Omit<UseFormProps<Input>, 'resolver'> & {
  schema: z.ZodType<Output, Def, Input>
  onSubmit: SubmitHandler<Output>
  fieldnameMapper?: (fieldName: string) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): UseFormReturn<Input, any, Output> & {
  id: string
  onSubmit: SubmitHandler<Output>
  fieldnameMapper?: (fieldName: string) => string
  Form: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Form: typeof Form<Input, any, Output>
    Field: typeof FormField<Input>
    CheckboxField: typeof FormCheckboxField<Input>
    SubmitButton: FC<ComponentProps<typeof Button>>
  }
}

export function useForm<TFieldValues extends FieldValues>({
  onSubmit,
  ...props
}: Omit<UseFormProps<TFieldValues>, 'resolver'> & {
  schema?: never
  onSubmit: SubmitHandler<TFieldValues>
  fieldnameMapper?: (fieldName: string) => string
}): UseFormReturn<TFieldValues> & {
  id: string
  onSubmit: SubmitHandler<TFieldValues>
  fieldnameMapper?: (fieldName: string) => string
  Form: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Form: typeof Form<TFieldValues, any, TFieldValues>
    Field: typeof FormField<TFieldValues>
    CheckboxField: typeof FormCheckboxField<TFieldValues>
    SubmitButton: FC<ComponentProps<typeof Button>>
  }
}

export function useForm<
  TFieldValues extends FieldValues,
  TTransformedValues extends FieldValues,
  TSchema extends z.ZodType,
>({
  onSubmit,
  fieldnameMapper,
  schema,
  ...props
}: Omit<UseFormProps<TFieldValues>, 'resolver'> & {
  schema?: TSchema
  onSubmit: SubmitHandler<TTransformedValues>
  fieldnameMapper?: (fieldName: string) => string
}) {
  const id = useId()
  const methods = {
    ...useFormRHF({
      mode: 'onBlur',
      resolver: schema !== undefined ? zodResolver(schema, undefined) : undefined,
      ...props,
    }),
    onSubmit,
    fieldnameMapper,
    id,
  }

  const SubmitButton = (props: React.ComponentProps<typeof Button>) => {
    // @ts-expect-error ButtonProps are wrong
    return <Button form={id} isProcessing={methods.formState.isSubmitting} type="submit" {...props} />
  }

  return {
    Form: {
      Form,
      Field: FormField<TFieldValues>,
      CheckboxField: FormCheckboxField<TFieldValues>,
      SubmitButton,
    },
    ...methods,
  }
}

const Form = <TFieldValues extends FieldValues, TContext, TTransformedValues extends FieldValues>({
  children,
  id,
  onSubmit,
  fieldnameMapper,
  className,
  ...methods
}: React.PropsWithChildren<
  UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
    id: string
    onSubmit: SubmitHandler<TTransformedValues>
    fieldnameMapper?: (fieldName: string) => string
    className?: string
  }
>) => {
  return (
    <FormProvider {...methods}>
      <form
        role="form"
        id={id}
        className={className}
        onSubmit={event => {
          if (event) {
            if (typeof event.preventDefault === 'function') {
              event.preventDefault()
            }
            if (typeof event.stopPropagation === 'function') {
              event.stopPropagation()
            }
          }
          // @ts-expect-error handleSubmit
          void methods.handleSubmit(async (values: TTransformedValues, event) => {
            try {
              await onSubmit(values, event)
            } catch (error) {
              if (error instanceof FetchError && error.response?.status === 400) {
                const data = await error.response?.json()
                const violations: {fieldName: string; message: string}[] = data?.violations
                if (violations) {
                  // TODO(doll): This manual prefixing is a hack. Spring boot isn't returning the requestPart prefix in the field name
                  violations.map(value => {
                    // @ts-expect-error setError
                    methods.setError(fieldnameMapper?.(value.fieldName) ?? value.fieldName, {
                      message: value.message,
                    })
                  })
                } else {
                  methods.setError('root.serverError', {message: data?.message || 'Unknown error'})
                }
              } else {
                methods.setError('root.serverError', {
                  message: (error as Error)?.message ?? 'Unknown error',
                  type: 'server',
                })
              }
            }
          }, console.error)(event)
        }}
      >
        {methods.formState.errors.root?.serverError && <div>{methods.formState.errors.root.serverError.message}</div>}
        {children}
      </form>
    </FormProvider>
  )
}

const FormField = <TFieldValues extends FieldValues>({
  controlId,
  ...props
}: {controlId: FieldPath<TFieldValues>} & FieldProps) => {
  return (
    <FormFieldProvider value={{controlId}}>
      <Field {...props} />
    </FormFieldProvider>
  )
}

const FormCheckboxField = <TFieldValues extends FieldValues>({
  controlId,
  ...props
}: {controlId: FieldPath<TFieldValues>} & FieldProps) => {
  return (
    <FormFieldProvider value={{controlId}}>
      <CheckboxField {...props} />
    </FormFieldProvider>
  )
}
