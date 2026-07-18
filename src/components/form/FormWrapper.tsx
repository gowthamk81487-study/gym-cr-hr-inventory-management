'use client';

import React from 'react';
import { useForm, UseFormReturn, SubmitHandler, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { cn } from '@/utils';

interface FormWrapperProps<TFormValues extends FieldValues> {
  schema: ZodSchema<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  defaultValues?: Partial<TFormValues>;
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  className?: string;
}

export function FormWrapper<TFormValues extends FieldValues = FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className
}: FormWrapperProps<TFormValues>) {
  const methods = useForm<TFormValues>({
    resolver: zodResolver(schema as any) as any,
    defaultValues: defaultValues as any
  });

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className={cn('space-y-4 w-full', className)}
    >
      {children(methods)}
    </form>
  );
}

export default FormWrapper;
