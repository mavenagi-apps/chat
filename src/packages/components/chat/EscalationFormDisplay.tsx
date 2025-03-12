import React, { useContext, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useParams } from "next/navigation";
import { ReactMarkdown } from "@magi/components/ReactMarkdown";
import { useAuth } from "@/src/app/providers/AuthProvider";
import { useSettings } from "@/src/app/providers/SettingsProvider";
import { isHandoffAvailable } from "@/src/app/actions";
import type {
  CustomField,
  InitializeHandoffParams,
} from "@/src/lib/handoff/types";
import type { Control, FieldValues } from "react-hook-form";

import { ChatContext } from "./Chat";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  FieldGroup,
  Input,
  useForm,
  Checkbox,
  SelectItem,
} from "@magi/ui";
import Spinner from "@magi/components/Spinner";

async function checkHandoffAvailability(
  organizationId: string,
  agentId: string,
) {
  const result = await isHandoffAvailable(organizationId, agentId);
  return result ?? true;
}

type FormData = {
  email?: string;
  [key: string]: string | boolean | number | undefined; // For dynamic fields
};

// Text/Number Field Component
function TextField({
  field,
  register,
  required,
}: {
  field: CustomField;
  register: any;
  required: boolean;
}) {
  return (
    <div key={String(field.id)} className="flex flex-col gap-1">
      <label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-gray-500">{field.description}</p>
      <Input
        {...register(String(field.id))}
        required={required}
        name={String(field.id)}
        type={field.type === "NUMBER" ? "number" : "text"}
      />
    </div>
  );
}

// Dropdown Field Component
function DropdownField<T extends FieldValues>({
  field,
  required,
  Form,
}: {
  field: CustomField;
  control: Control<T>;
  required: boolean;
  Form: any;
}) {
  return (
    <div key={String(field.id)}>
      <Form.SelectField
        controlId={String(field.id) as any}
        label={field.label}
        description={field.description}
        placeholder={`Select ${field.label.toLowerCase()}`}
        required={required}
        className="w-full"
      >
        {field.enumOptions?.map((option: { label: string; value: any }) => (
          <SelectItem key={String(option.value)} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </Form.SelectField>
    </div>
  );
}

// Boolean Field Component
function BooleanField({
  field,
  register,
  required,
}: {
  field: CustomField;
  register: any;
  required: boolean;
}) {
  return (
    <div key={String(field.id)} className="flex flex-col gap-1">
      <label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-gray-500">{field.description}</p>
      <div className="flex items-center gap-2">
        <Checkbox
          {...register(String(field.id))}
          required={required}
          name={String(field.id)}
          id={String(field.id)}
        />
        <label htmlFor={String(field.id)} className="text-sm">
          {field.label}
        </label>
      </div>
    </div>
  );
}

// Custom Field Component Factory
function CustomFieldComponent<T extends FieldValues>({
  field,
  register,
  control,
  Form,
}: {
  field: CustomField;
  register: any;
  control: Control<T>;
  Form: any;
}) {
  const required = field.required || false;

  if (field.type === "BOOLEAN") {
    return (
      <BooleanField field={field} register={register} required={required} />
    );
  }

  if (field.enumOptions && field.enumOptions.length > 0) {
    return (
      <DropdownField
        field={field}
        control={control}
        required={required}
        Form={Form}
      />
    );
  }

  return <TextField field={field} register={register} required={required} />;
}

function EscalationForm({ isAvailable }: { isAvailable: boolean }) {
  const t = useTranslations("chat.EscalationFormDisplay");
  const [error, setError] = useState<string | null>(null);
  const { initializeHandoff } = useContext(ChatContext);
  const { isAuthenticated } = useAuth();
  const { misc } = useSettings();
  const availabilityFallbackMessage =
    misc.handoffConfiguration?.availabilityFallbackMessage ??
    t("agents_unavailable");
  const customFields = misc.handoffConfiguration?.customFields || [];

  const form = useForm<FormData>({
    onSubmit: async (data) => {
      try {
        // Extract email from form data
        const { email, ...customFieldData } = data;

        // Convert string field IDs to numbers in customFieldValues
        const customFieldValues: InitializeHandoffParams["customFieldValues"] =
          {};

        // Process custom field values
        customFields.forEach((field) => {
          const fieldId = String(field.id);
          const value = customFieldData[fieldId];
          if (fieldId in customFieldData && value !== undefined) {
            customFieldValues[field.id] = value as string | boolean | number;
          }
        });

        await initializeHandoff({
          email: isAuthenticated ? undefined : email,
          customFieldValues,
        });
      } catch (error) {
        console.error("Error initiating chat session:", error);
        setError("Failed to initiate chat session. Please try again.");
        throw error;
      }
    },
  });

  const { register, control, formState } = form;

  if (!isAvailable) {
    return (
      <Alert variant="warning" className="[&_a]:underline">
        <ReactMarkdown>{availabilityFallbackMessage as string}</ReactMarkdown>
      </Alert>
    );
  }

  if (formState.isSubmitSuccessful) {
    return null;
  }

  return (
    <div>
      {error ? (
        <Alert variant="warning">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <form.Form.Form {...form}>
          <FieldGroup>
            {!isAuthenticated && (
              <Input
                {...register("email")}
                required
                name="email"
                placeholder={t("email_placeholder")}
                type="email"
              />
            )}

            {/* Render custom fields */}
            {customFields.map((field) => (
              <CustomFieldComponent
                key={String(field.id)}
                field={field}
                register={register}
                control={control}
                Form={form.Form}
              />
            ))}

            <form.Form.SubmitButton
              variant="primary"
              className="w-full bg-[--brand-color]"
              disabled={formState.isSubmitting}
            >
              <IoChatbubbleEllipsesOutline />
              {t("connect_to_live_agent")}
            </form.Form.SubmitButton>
          </FieldGroup>
        </form.Form.Form>
      )}
    </div>
  );
}

export default function EscalationFormDisplay() {
  const { misc } = useSettings();
  const { organizationId, agentId } = useParams<{
    organizationId: string;
    agentId: string;
  }>();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      const shouldCheckAvailability =
        misc.handoffConfiguration?.enableAvailabilityCheck;
      if (shouldCheckAvailability) {
        const _isAvailable = await checkHandoffAvailability(
          organizationId,
          agentId,
        );
        setIsAvailable(_isAvailable);
      } else {
        setIsAvailable(true);
      }
      setIsLoading(false);
    };

    void fetchAvailability();
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  return <EscalationForm isAvailable={isAvailable} />;
}
