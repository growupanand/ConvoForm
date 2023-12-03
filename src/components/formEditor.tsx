"use client";

import {
  Form as UIForm,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formUpdateSchema } from "@/lib/validations/form";
import { Button } from "./ui/button";
import { useState } from "react";
import { apiClient } from "@/lib/fetch";
import { Check, Loader2 } from "lucide-react";
import { toast } from "./ui/use-toast";
import { Journey, Form as PrismaForm } from "@prisma/client";

type Form = PrismaForm & { journey: Journey[] };

type Props = {
  form: Form & { journey: Journey[] };
  onUpdated?: (newForm: Form) => void;
};

const formSchema = formUpdateSchema;

type State = {
  isFormBusy: boolean;
  form: Form & { journey: Journey[] };
};

export default function FormEditor(props: Props) {
  const [state, setState] = useState<State>({
    isFormBusy: false,
    form: props.form,
  });
  const { isFormBusy, form } = state;

  const formHook = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: form,
  });

  const { fields, append, remove } = useFieldArray({
    control: formHook.control,
    name: "journey",
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (
    formData: Record<string, any>
  ) => {
    setState((cs) => ({ ...cs, isFormBusy: true }));
    try {
      const response = await apiClient(`form/${form.id}`, {
        method: "PUT",
        data: formData,
      });
      const updatedForm = (await response.json()) as Form;
      toast({
        action: (
          <div className="w-full">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1">
                <Check className="text-white " />
              </div>
              <span>Changes saved successfully</span>
            </div>
          </div>
        ),
        duration: 1500,
      });
      setState((cs) => ({ ...cs, form: updatedForm }));
      props.onUpdated?.(updatedForm);
    } catch (error) {
      toast({
        title: "Unable to save changes",
        duration: 1500,
      });
    } finally {
      setState((cs) => ({ ...cs, isFormBusy: false }));
    }
  };
  return (
    <div className="bg-transparent border-0 shadow-none">
      <UIForm {...formHook}>
        <form onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={formHook.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Form name"
                    className="text-2xl font-bold bg-transparent border-0 shadow-none focus-visible:ring-transparent	 focus-visible:ring-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formHook.control}
            name="overview"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overview</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Give overview about this form"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formHook.control}
            name="welcomeScreenTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Welcome Screen Title</FormLabel>
                <FormControl>
                  <Input placeholder="Give welcome screen title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formHook.control}
            name="welcomeScreenMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Welcome Screen Message</FormLabel>
                <FormControl>
                  <Input placeholder="Give welcome screen message" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formHook.control}
            name="welcomeScreenCTALabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Welcome Screen CTA Label</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Give welcome screen CTA label"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-2">
            <FormLabel className="mb-2">Journey</FormLabel>
            {fields.map((item, index) => (
              <FormField
                key={item.id}
                control={formHook.control}
                name={`journey.${index}.fieldName`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input placeholder={`Field name`} {...field} />
                        <Button
                          variant="secondary"
                          disabled={index === 0 && fields.length === 1}
                          onClick={() => fields.length != 1 && remove(index)}
                          type="button"
                        >
                          Remove
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <div>
              <Button
                variant="secondary"
                onClick={() => append({ fieldName: "" })}
                type="button"
              >
                Add Journey Field
              </Button>
            </div>
          </div>
          <FormField
            control={formHook.control}
            name="aboutCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Company</FormLabel>
                <FormControl>
                  <Input placeholder="Give about company" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" type="submit" disabled={isFormBusy}>
            {isFormBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {form.isPublished ? "Save changes" : "Publish"}
          </Button>
        </form>
      </UIForm>
    </div>
  );
}
